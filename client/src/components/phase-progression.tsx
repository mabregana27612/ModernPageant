import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Trophy, ArrowRight, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event, Phase, Contestant, User } from "@shared/schema";

interface PhaseProgressionProps {
  eventId: string;
}

export default function PhaseProgression({ eventId }: { eventId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContestants, setSelectedContestants] = useState<string[]>([]);

  const { data: phases, isLoading: phasesLoading, error: phasesError } = useQuery<Phase[]>({
    queryKey: ['/api/events', eventId, 'phases'],
    enabled: !!eventId,
    retry: 2,
    staleTime: 30000,
  });

  const { data: contestants, isLoading: contestantsLoading, error: contestantsError } = useQuery<(Contestant & { user: User })[]>({
    queryKey: ['/api/events', eventId, 'contestants'],
    enabled: !!eventId,
    retry: 2,
    staleTime: 30000,
  });

  const { data: event } = useQuery<Event>({
    queryKey: ['/api/events', eventId],
  });

  const currentPhase = phases?.find(p => p.status === 'active');
  const nextPhase = phases?.find((p, index, arr) => {
    const currentIndex = arr.findIndex(phase => phase.id === currentPhase?.id);
    return index === currentIndex + 1;
  });

  // Get all contestants to show current standings
  const { data: allContestants } = useQuery<(Contestant & { user: User })[]>({
    queryKey: ['/api/events', eventId, 'contestants'],
  });

  // Get eligible contestants for current phase
  const { data: eligibleContestants } = useQuery<(Contestant & { user: User })[]>({
    queryKey: ['/api/phases', currentPhase?.id, 'contestants'],
    enabled: !!currentPhase?.id,
  });

  // Get current results to show rankings
  const { data: results } = useQuery<any[]>({
    queryKey: ['/api/events', eventId, 'results', currentPhase?.id],
    enabled: !!currentPhase?.id,
  });

  const advanceContestantsMutation = useMutation({
    mutationFn: async () => {
      if (selectedContestants.length === 0) {
        throw new Error('Please select contestants to advance');
      }

      const response = await apiRequest('POST', `/api/events/${eventId}/advance-contestants`, {
        selectedContestantIds: selectedContestants
      });


      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Contestants Advanced",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['/api/phases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'results'] });
      setSelectedContestants([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to advance contestants",
        variant: "destructive",
      });
    },
  });

  const handleContestantToggle = (contestantId: string) => {
    setSelectedContestants(prev => 
      prev.includes(contestantId)
        ? prev.filter(id => id !== contestantId)
        : [...prev, contestantId]
    );
  };

  const handleSelectTop = (count: number) => {
    if (results) {
      const topContestants = results.slice(0, count).map(r => r.contestantId);
      setSelectedContestants(topContestants);
    }
  };

  if (phasesError || contestantsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading data: {(phasesError as any)?.message || (contestantsError as any)?.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (phasesLoading || contestantsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-600">Loading phase progression data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!event || !phases) {
    return <div>Loading...</div>;
  }

  if (!phases || phases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No phases found for this event. Please create phases first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!contestants || contestants.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No contestants found for this event. Please add contestants first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!currentPhase) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No active phase found. Please activate a phase first.
        </AlertDescription>
      </Alert>
    );
  }

  if (!nextPhase) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This is the final phase. No advancement possible.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if this is truly the first phase by looking at phase order, not contestant eligibility
  const isFirstPhase = currentPhase && phases && phases.length > 0 && 
    currentPhase.order === Math.min(...phases.map(p => p.order));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Phase Progression: {currentPhase.name} → {nextPhase.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Current Phase:</span>
                  <Badge>{currentPhase.name}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Next Phase:</span>
                  <Badge variant="outline">{nextPhase.name}</Badge>
                </div>
              </div>
              <ArrowRight className="h-8 w-8 text-blue-500" />
            </div>

            {isFirstPhase && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This is the first phase. All contestants will participate. Use the regular phase advance to move to the next phase.
                </AlertDescription>
              </Alert>
            )}

            {!isFirstPhase && (!results || results.length === 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No results available for this phase. Please ensure scoring is complete before advancing contestants.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {!isFirstPhase && (results || eligibleContestants) && (
        <Card>
          <CardHeader>
            <CardTitle>Select Contestants to Advance</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSelectTop(3)}
              >
                Select Top 3
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSelectTop(5)}
              >
                Select Top 5
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSelectTop(10)}
              >
                Select Top 10
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedContestants([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(results || []).length > 0 ? (
                results.map((result, index) => {
                  const contestant = allContestants?.find(c => c.id === result.contestantId);
                  const isSelected = selectedContestants.includes(result.contestantId);

                  return (
                    <div
                      key={result.contestantId}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleContestantToggle(result.contestantId)}
                        />
                        <div className="flex items-center space-x-2">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          {index < 3 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            #{contestant?.contestantNumber} {contestant?.user.firstName} {contestant?.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total Score: {result.totalScore?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : eligibleContestants && eligibleContestants.length > 0 ? (
                eligibleContestants.map((contestant, index) => {
                  const isSelected = selectedContestants.includes(contestant.id);

                  return (
                    <div
                      key={contestant.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleContestantToggle(contestant.id)}
                        />
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            #{contestant.contestantNumber} {contestant.user.firstName} {contestant.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: Eligible for {currentPhase?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No contestants available for selection
                </div>
              )}
            </div>

            {selectedContestants.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedContestants.length} contestant(s) selected for advancement
                  </p>
                  <Button
                    onClick={() => advanceContestantsMutation.mutate()}
                    disabled={advanceContestantsMutation.isPending}
                    className="ml-4"
                  >
                    {advanceContestantsMutation.isPending ? 'Advancing...' : 'Advance Selected Contestants'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}