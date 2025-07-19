import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import type { Event, Contestant, User, Phase } from "@shared/schema";

export default function JudgeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentContestantIndex, setCurrentContestantIndex] = useState(0);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [currentCriteriaIndex, setCurrentCriteriaIndex] = useState(0);

  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Auto-select the first active event
  useEffect(() => {
    if (events && events.length > 0 && !selectedEvent) {
      const activeEvent = events.find(e => e.status === 'active') || events[0];
      setSelectedEvent(activeEvent.id);
    }
  }, [events, selectedEvent]);

  const { data: contestants } = useQuery<(Contestant & { user: User })[]>({
    queryKey: ['/api/events', selectedEvent, 'contestants'],
    enabled: !!selectedEvent,
  });

  const { data: shows } = useQuery<any[]>({
    queryKey: ['/api/events', selectedEvent, 'shows'],
    enabled: !!selectedEvent,
  });

  const currentShow = shows?.[currentShowIndex];

  const { data: criteria } = useQuery<any[]>({
    queryKey: ['/api/shows', currentShow?.id, 'criteria'],
    enabled: !!currentShow?.id,
  });

  const currentCriteria = criteria?.[currentCriteriaIndex];

  const { data: phases } = useQuery<Phase[]>({
    queryKey: ['/api/events', selectedEvent, 'phases'],
    enabled: !!selectedEvent,
  });

  const { data: scoringProgress } = useQuery<{
    totalRequired: number;
    completed: number;
    progress: number;
    remainingContestants: number;
    remainingCriteria: number;
    activePhase: string;
    activeShow: string;
  }>({
    queryKey: ['/api/events', selectedEvent, 'scoring-progress'],
    enabled: !!selectedEvent,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const scoreMutation = useMutation({
    mutationFn: async (scoreData: any) => {
      await apiRequest('POST', `/api/events/${selectedEvent}/scores`, scoreData);
    },
    onSuccess: () => {
      toast({
        title: "Score submitted",
        description: "Your score has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', selectedEvent] });
      
      // Auto-advance to next criteria or contestant
      if (currentCriteriaIndex < (criteria?.length || 1) - 1) {
        setCurrentCriteriaIndex(prev => prev + 1);
      } else if (currentContestantIndex < (contestants?.length || 1) - 1) {
        setCurrentContestantIndex(prev => prev + 1);
        setCurrentCriteriaIndex(0);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleScoreSubmit = (contestantId: string, criteriaId: string) => {
    const scoreKey = `${contestantId}-${criteriaId}`;
    const score = scores[scoreKey];
    const maxScore = currentCriteria?.maxScore || 10;

    if (!score || score < 1 || score > maxScore) {
      toast({
        title: "Invalid score",
        description: `Score must be between 1 and ${maxScore}.`,
        variant: "destructive",
      });
      return;
    }

    // Get the current active phase from the event
    const activePhase = phases?.find(p => p.status === 'active');
    if (!activePhase) {
      toast({
        title: "No Active Phase",
        description: "No active phase found. Please contact admin to activate a phase.",
        variant: "destructive",
      });
      return;
    }

    scoreMutation.mutate({
      contestantId,
      criteriaId,
      phaseId: activePhase.id,
      score,
    });
  };

  const handleNextContestant = () => {
    if (contestants && currentContestantIndex < contestants.length - 1) {
      setCurrentContestantIndex(prev => prev + 1);
    }
  };

  const handlePrevContestant = () => {
    if (currentContestantIndex > 0) {
      setCurrentContestantIndex(prev => prev - 1);
    }
  };

  const handleNextShow = () => {
    if (shows && currentShowIndex < shows.length - 1) {
      setCurrentShowIndex(prev => prev + 1);
      setCurrentCriteriaIndex(0); // Reset to first criteria when changing shows
    }
  };

  const handlePrevShow = () => {
    if (currentShowIndex > 0) {
      setCurrentShowIndex(prev => prev - 1);
      setCurrentCriteriaIndex(0); // Reset to first criteria when changing shows
    }
  };

  const handleNextCriteria = () => {
    if (criteria && currentCriteriaIndex < criteria.length - 1) {
      setCurrentCriteriaIndex(prev => prev + 1);
    }
  };

  const handlePrevCriteria = () => {
    if (currentCriteriaIndex > 0) {
      setCurrentCriteriaIndex(prev => prev - 1);
    }
  };

  const activeEvent = events?.find(e => e.status === 'active');
  const currentEvent = selectedEvent ? events?.find(e => e.id === selectedEvent) : activeEvent;
  const currentEventId = currentEvent?.id || '';

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Events</h3>
            <p className="text-gray-600">There are no active events to judge at the moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Judge Dashboard</h1>
            <p className="text-gray-600">{currentEvent.name}</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <Label className="text-sm text-gray-600">Contest:</Label>
              <select
                value={currentEventId}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {events?.filter(e => e.status === 'active' || e.status === 'upcoming').map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.status})
                  </option>
                ))}
              </select>
            </div>
            <Badge className="bg-primary/10 text-primary">
              Phase: {currentEvent.currentPhase}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {contestants?.length || 0} Contestants
            </Badge>
          </div>
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scoring Progress */}
        {scoringProgress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Scoring Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${scoringProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-lg font-medium">{scoringProgress.progress}%</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Completed:</span> {scoringProgress.completed}/{scoringProgress.totalRequired}
                </div>
                <div>
                  <span className="text-muted-foreground">Phase:</span> {scoringProgress.activePhase}
                </div>
                <div>
                  <span className="text-muted-foreground">Show:</span> {scoringProgress.activeShow}
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining:</span> {scoringProgress.totalRequired - scoringProgress.completed}
                </div>
              </div>
              {scoringProgress.progress === 100 && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200">
                  ✅ All scoring completed for this phase! Ready for next phase.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Current Show and Criteria */}
        {currentShow && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Show: {currentShow.name}</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevShow}
                    disabled={currentShowIndex === 0}
                  >
                    Prev Show
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextShow}
                    disabled={currentShowIndex >= (shows?.length || 1) - 1}
                  >
                    Next Show
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {criteria?.map((criterion, index) => (
                  <div 
                    key={criterion.id} 
                    className={`p-4 rounded-lg border transition-colors ${
                      index === currentCriteriaIndex 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-primary/5 border-primary/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{criterion.weight}%</div>
                      <div className="text-sm text-gray-600">{criterion.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sequential Scoring Interface */}
        {contestants && contestants.length > 0 && criteria && criteria.length > 0 && (
          <div className="space-y-6">
            {/* Navigation */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevContestant}
                  disabled={currentContestantIndex === 0}
                >
                  Previous Contestant
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNextContestant}
                  disabled={currentContestantIndex === contestants.length - 1}
                >
                  Next Contestant
                </Button>
              </div>
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevCriteria}
                  disabled={currentCriteriaIndex === 0}
                >
                  Previous Criteria
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleNextCriteria}
                  disabled={currentCriteriaIndex === criteria.length - 1}
                >
                  Next Criteria
                </Button>
              </div>
            </div>

            {/* Current Contestant & Criteria */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contestant Card */}
              <Card>
                <div className="relative">
                  <img 
                    src={contestants[currentContestantIndex].photoUrl || contestants[currentContestantIndex].user.profileImageUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
                    alt={`${contestants[currentContestantIndex].user.firstName} ${contestants[currentContestantIndex].user.lastName}`}
                    className="w-full h-64 object-cover rounded-t-lg"
                    key={contestants[currentContestantIndex].id}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    #{contestants[currentContestantIndex].contestantNumber}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {contestants[currentContestantIndex].user.firstName} {contestants[currentContestantIndex].user.lastName}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Age: {contestants[currentContestantIndex].age} • {contestants[currentContestantIndex].location} • {contestants[currentContestantIndex].occupation}
                  </p>
                  <p className="text-sm text-gray-500">
                    Contestant {currentContestantIndex + 1} of {contestants.length}
                  </p>
                </CardContent>
              </Card>

              {/* Scoring Card */}
              {currentCriteria && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{currentCriteria.name}</span>
                      <Badge>{currentCriteria.weight}%</Badge>
                    </CardTitle>
                    <p className="text-gray-600">{currentCriteria.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Input */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Label className="text-lg font-medium">Score:</Label>
                        <Input
                          type="number"
                          min="1"
                          max={currentCriteria.maxScore || 10}
                          value={scores[`${contestants[currentContestantIndex].id}-${currentCriteria.id}`] || ''}
                          onChange={(e) => setScores(prev => ({
                            ...prev,
                            [`${contestants[currentContestantIndex].id}-${currentCriteria.id}`]: parseInt(e.target.value) || 0
                          }))}
                          className="w-24 text-center text-lg"
                          placeholder={`1-${currentCriteria.maxScore || 10}`}
                        />
                        <span className="text-lg text-gray-500">/{currentCriteria.maxScore || 10}</span>
                      </div>

                      <Button
                        onClick={() => handleScoreSubmit(contestants[currentContestantIndex].id, currentCriteria.id)}
                        className="w-full"
                        disabled={scoreMutation.isPending}
                        size="lg"
                      >
                        {scoreMutation.isPending ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Submit Score for {currentCriteria.name}
                      </Button>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                      Criteria {currentCriteriaIndex + 1} of {criteria?.length || 0}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Progress Summary */}
        {currentShow && criteria && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Scoring Progress</h3>
                <p className="text-gray-600">
                  Show: {currentShow.name} • 
                  Criteria: {currentCriteriaIndex + 1} of {criteria.length} • 
                  Contestant: {currentContestantIndex + 1} of {contestants?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}