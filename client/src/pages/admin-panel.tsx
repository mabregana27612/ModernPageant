import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Play, Pause, RotateCcw, Users, Trophy, Calendar, Settings, ArrowRight } from "lucide-react";
import PhaseProgression from "@/components/phase-progression";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Event, Show, Criteria, Phase, Contestant, Judge } from "@shared/schema";

function JudgeScoresView({ currentEventId }: { currentEventId: string | undefined }) {
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [selectedJudge, setSelectedJudge] = useState<string>("");

  const { data: phases } = useQuery<Phase[]>({
    queryKey: ['/api/events', currentEventId, 'phases'],
    enabled: !!currentEventId,
  });

  const { data: judges } = useQuery<Judge[]>({
    queryKey: ['/api/events', currentEventId, 'judges'],
    enabled: !!currentEventId,
  });

  const { data: contestants } = useQuery<Contestant[]>({
    queryKey: ['/api/events', currentEventId, 'contestants'],
    enabled: !!currentEventId,
  });

  const { data: shows } = useQuery<Show[]>({
    queryKey: ['/api/events', currentEventId, 'shows'],
    enabled: !!currentEventId,
  });

  const { data: allScores } = useQuery<any[]>({
    queryKey: ['/api/events', currentEventId, 'scores'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${currentEventId}/scores${selectedPhase && selectedPhase !== 'all' ? `?phaseId=${selectedPhase}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch scores');
      return response.json();
    },
    enabled: !!currentEventId,
  });

  const activePhase = phases?.find(p => p.status === 'active') || phases?.[0];
  const currentPhaseId = selectedPhase || activePhase?.id;

  // Filter scores by selected judge if one is selected
  const filteredScores = allScores?.filter(score => 
    (!selectedJudge || score.judgeId === selectedJudge) &&
    (!selectedPhase || selectedPhase === 'all' || score.phaseId === currentPhaseId)
  ) || [];

  // Group scores by judge
  const scoresByJudge = filteredScores.reduce((acc: any, score: any) => {
    if (!acc[score.judgeId]) {
      acc[score.judgeId] = [];
    }
    acc[score.judgeId].push(score);
    return acc;
  }, {});

  // Calculate judge statistics
  const judgeStats = judges?.map(judge => {
    const judgeScores = scoresByJudge[judge.id] || [];
    const totalScores = judgeScores.length;
    const avgScore = totalScores > 0 ? 
      judgeScores.reduce((sum: number, score: any) => sum + parseFloat(score.score), 0) / totalScores : 0;
    const maxScore = totalScores > 0 ? 
      Math.max(...judgeScores.map((s: any) => parseFloat(s.score))) : 0;
    const minScore = totalScores > 0 ? 
      Math.min(...judgeScores.map((s: any) => parseFloat(s.score))) : 0;

    return {
      judge,
      totalScores,
      avgScore,
      maxScore,
      minScore
    };
  }) || [];

  if (!currentEventId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please select an event first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Judge Scoring Analysis</CardTitle>
          <p className="text-gray-600">View and analyze individual judge scoring patterns</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Label>Phase:</Label>
              <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All phases</SelectItem>
                  {phases?.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label>Judge:</Label>
              <Select value={selectedJudge} onValueChange={setSelectedJudge}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All judges" />
                </SelectTrigger>
                <SelectContent>
                  {judges?.map((judge) => (
                    <SelectItem key={judge.id} value={judge.id}>
                      {judge.userId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Judge Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {judgeStats.map(({ judge, totalScores, avgScore, maxScore, minScore }) => (
              <Card key={judge.id} className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">{judge.userId}</h4>
                  <p className="text-sm text-gray-600">{judge.specialization}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total Scores: <Badge variant="outline">{totalScores}</Badge></div>
                    <div>Avg Score: <Badge variant="secondary">{avgScore.toFixed(2)}</Badge></div>
                    <div>Max Score: <Badge variant="default">{maxScore.toFixed(2)}</Badge></div>
                    <div>Min Score: <Badge variant="outline">{minScore.toFixed(2)}</Badge></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Scores Table */}
          {selectedJudge && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scores - {judges?.find(j => j.id === selectedJudge)?.userId}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left">Contestant</th>
                        <th className="border border-gray-200 p-2 text-left">Show</th>
                        <th className="border border-gray-200 p-2 text-left">Criteria</th>
                        <th className="border border-gray-200 p-2 text-left">Score</th>
                        <th className="border border-gray-200 p-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoresByJudge[selectedJudge]?.map((score: any) => {
                        const contestant = contestants?.find(c => c.id === score.contestantId);
                        const show = shows?.find(s => s.id === score.showId);
                        return (
                          <tr key={score.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 p-2">{contestant?.userId || 'Unknown'}</td>
                            <td className="border border-gray-200 p-2">{show?.name || 'Unknown'}</td>
                            <td className="border border-gray-200 p-2">{score.criteriaName || 'Unknown'}</td>
                            <td className="border border-gray-200 p-2">
                              <Badge variant="default">{parseFloat(score.score).toFixed(2)}</Badge>
                            </td>
                            <td className="border border-gray-200 p-2">
                              {new Date(score.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Judges Overview Table */}
          {!selectedJudge && (
            <Card>
              <CardHeader>
                <CardTitle>All Judges Scores Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left">Judge</th>
                        <th className="border border-gray-200 p-2 text-left">Contestant</th>
                        <th className="border border-gray-200 p-2 text-left">Show</th>
                        <th className="border border-gray-200 p-2 text-left">Criteria</th>
                        <th className="border border-gray-200 p-2 text-left">Score</th>
                        <th className="border border-gray-200 p-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScores.slice(0, 50).map((score: any) => {
                        const judge = judges?.find(j => j.id === score.judgeId);
                        const contestant = contestants?.find(c => c.id === score.contestantId);
                        const show = shows?.find(s => s.id === score.showId);
                        return (
                          <tr key={score.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 p-2">
                              <div>
                                <div className="font-medium">{judge?.userId || 'Unknown'}</div>
                                <div className="text-sm text-gray-600">{judge?.specialization}</div>
                              </div>
                            </td>
                            <td className="border border-gray-200 p-2">{contestant?.userId || 'Unknown'}</td>
                            <td className="border border-gray-200 p-2">{show?.name || 'Unknown'}</td>
                            <td className="border border-gray-200 p-2">{score.criteriaName || 'Unknown'}</td>
                            <td className="border border-gray-200 p-2">
                              <Badge variant="default">{parseFloat(score.score).toFixed(2)}</Badge>
                            </td>
                            <td className="border border-gray-200 p-2">
                              {new Date(score.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredScores.length > 50 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Showing first 50 scores. Use filters to narrow down results.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showContestantForm, setShowContestantForm] = useState(false);
  const [showJudgeForm, setShowJudgeForm] = useState(false);
  const [showShowForm, setShowShowForm] = useState(false);
  const [showForm, setShowForm] = useState({
    name: '',
    description: '',
    weight: '',
    maxScore: '10'
  });
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    description: '',
    weight: '',
    maxScore: '10'
  });
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [phaseForm, setPhaseForm] = useState({
    name: '',
    description: '',
    order: '',
    resetScores: false
  });

  // Criteria queries for selected show
  const { data: criteriaData } = useQuery({
    queryKey: ['/api/shows', selectedShow, 'criteria'],
    enabled: !!selectedShow,
  });

  // Form states
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming'
  });

  const [contestantForm, setContestantForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    location: '',
    occupation: '',
    bio: '',
    talent: ''
  });

  const [judgeForm, setJudgeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: ''
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user || (user as any).role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [user, toast]);

  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Get the active event or first event
  const activeEvent = events?.find(e => e.status === 'active') || events?.[0];
  const currentEventId = selectedEvent || activeEvent?.id;
  const currentEvent = events?.find(e => e.id === currentEventId);

  const { data: contestants } = useQuery<Contestant[]>({
    queryKey: ['/api/events', currentEventId, 'contestants'],
    enabled: !!currentEventId,
  });

  const { data: judges } = useQuery<Judge[]>({
    queryKey: ['/api/events', currentEventId, 'judges'],
    enabled: !!currentEventId,
  });

  const { data: shows } = useQuery<Show[]>({
    queryKey: ['/api/events', currentEventId, 'shows'],
    enabled: !!currentEventId,
  });

  const { data: criteria } = useQuery<any[]>({
    queryKey: ['/api/shows', shows?.[0]?.id, 'criteria'],
    enabled: !!shows?.[0]?.id,
  });

  const { data: phases } = useQuery<Phase[]>({
    queryKey: ['/api/events', currentEventId, 'phases'],
    enabled: !!currentEventId,
  });

  // Mutation for creating events
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/events', data);
    },
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "Event has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowEventForm(false);
      setEventForm({ name: '', description: '', startDate: '', endDate: '', status: 'upcoming' });
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

      // Try to parse error details for better feedback
      let errorMessage = "Failed to create event. Please try again.";
      if (error.message.includes("Validation error")) {
        errorMessage = "Please check your input data and try again.";
      } else if (error.message.includes("date")) {
        errorMessage = "Please check the date format and try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutation for creating contestants
  const createContestantMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create user, then create contestant
      const userData = {
        id: `contestant_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`
      };

      await apiRequest('POST', '/api/users', userData);

      const contestantData = {
        userId: userData.id,
        contestantNumber: (contestants?.length || 0) + 1,
        age: parseInt(data.age),
        location: data.location,
        occupation: data.occupation,
        bio: data.bio,
        talent: data.talent,
        status: 'approved'
      };

      await apiRequest('POST', `/api/events/${currentEventId}/contestants`, contestantData);
    },
    onSuccess: () => {
      toast({
        title: "Contestant added",
        description: "Contestant has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'contestants'] });
      setShowContestantForm(false);
      setContestantForm({ firstName: '', lastName: '', email: '', age: '', location: '', occupation: '', bio: '', talent: '' });
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
        description: "Failed to add contestant. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating judges
  const createJudgeMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create user, then create judge
      const userData = {
        id: `judge_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`
      };

      await apiRequest('POST', '/api/users', userData);

      const judgeData = {
        userId: userData.id,
        specialization: data.specialization
      };

      await apiRequest('POST', `/api/events/${currentEventId}/judges`, judgeData);
    },
    onSuccess: () => {
      toast({
        title: "Judge added",
        description: "Judge has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'judges'] });
      setShowJudgeForm(false);
      setJudgeForm({ firstName: '', lastName: '', email: '', specialization: '' });
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
        description: "Failed to add judge. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show creation mutation
  const createShowMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', `/api/events/${currentEventId}/shows`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Show created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'shows'] });
      setShowShowForm(false);
      setShowForm({ name: '', description: '', weight: '', maxScore: '10' });
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
        description: "Failed to create show.",
        variant: "destructive",
      });
    },
  });

  // Criteria mutations for Shows/Criteria structure
  const createCriteriaMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', `/api/shows/${selectedShow}/criteria`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Criteria created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shows', selectedShow, 'criteria'] });
      setShowCriteriaForm(false);
      setCriteriaForm({ name: '', description: '', weight: '', maxScore: '10' });
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
        description: "Failed to create criteria.",
        variant: "destructive",
      });
    },
  });

  const deleteCriteriaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/criteria/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Criteria deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shows', selectedShow, 'criteria'] });
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
        description: "Failed to delete criteria.",
        variant: "destructive",
      });
    },
  });

  const deleteShowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/shows/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Show deleted",
        description: "Show has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'shows'] });
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
        description: "Failed to delete show. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating event status
  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest('PATCH', `/api/events/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Event updated",
        description: "Event status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
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
        description: "Failed to update event status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "Event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
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
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const advancePhaseMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/advance-phase`);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: (data as any).message || "Phase advanced successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'phases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
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
        description: "Failed to advance phase.",
        variant: "destructive",
      });
    },
  });

  const createPhaseMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', `/api/events/${currentEventId}/phases`, data);
    },
    onSuccess: () => {
      toast({
        title: "Phase created",
        description: "Phase has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'phases'] });
      setShowPhaseForm(false);
      setPhaseForm({ name: '', description: '', order: '', resetScores: false });
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
        description: "Failed to create phase.",
        variant: "destructive",
      });
    },
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest('PATCH', `/api/phases/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Phase updated",
        description: "Phase has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'phases'] });
      setEditingPhase(null);
      setShowPhaseForm(false);
      setPhaseForm({ name: '', description: '', order: '', resetScores: false });
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
        description: "Failed to update phase.",
        variant: "destructive",
      });
    },
  });

  const deletePhaseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/phases/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Phase deleted",
        description: "Phase has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'phases'] });
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
        description: "Failed to delete phase.",
        variant: "destructive",
      });
    },
  });

  const reorderPhasesMutation = useMutation({
    mutationFn: async (phaseOrders: { id: string; order: number }[]) => {
      await apiRequest('POST', `/api/events/${currentEventId}/phases/reorder`, { phaseOrders });
    },
    onSuccess: () => {
      toast({
        title: "Phases reordered",
        description: "Phases have been reordered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'phases'] });
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
        description: "Failed to reorder phases.",
        variant: "destructive",
      });
    },
  });

  const handleAddShow = async (data: any) => {
    if (!currentEventId) return;

    try {
      await apiRequest('POST', `/api/events/${currentEventId}/criteria`, data);
      toast({
        title: "Show added",
        description: "New show category has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'shows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'criteria'] });
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to add show category.",
        variant: "destructive",
      });
    }
  };

  const handleAdvancePhase = () => {
    if (!currentEvent) {
      toast({
        title: "No Event Selected",
        description: "Please select an event first.",
        variant: "destructive",
      });
      return;
    }

    if (!phases || phases.length === 0) {
      toast({
        title: "No Phases Found",
        description: "Please create phases for this event before advancing. You can run the migration script to add default phases.",
        variant: "destructive",
      });
      return;
    }

    const currentPhases = phases;
    const activePhase = currentPhases.find(p => p.status === 'active');
    const currentPhaseIndex = activePhase ? currentPhases.findIndex(p => p.id === activePhase.id) : -1;
    const nextPhase = currentPhases[currentPhaseIndex + 1];

    if (!activePhase && currentPhases.length > 0) {
      // No active phase, start the first one
      if (confirm(`Start the first phase: "${currentPhases[0].name}"?`)) {
        advancePhaseMutation.mutate(currentEventId!);
      }
      return;
    }

    if (!nextPhase) {
      if (confirm(`Complete the event? This will mark "${activePhase?.name}" as completed.`)) {
        advancePhaseMutation.mutate(currentEventId!);
      }
      return;
    }

    // Regular phase advancement
    if (confirm(`Advance from "${activePhase?.name}" to "${nextPhase.name}"?`)) {
      advancePhaseMutation.mutate(currentEventId!);
    }
  };

  const handleCreatePhase = () => {
    if (!currentEventId) return;

    const nextOrder = phases && phases.length > 0 ? Math.max(...phases.map(p => p.order)) + 1 : 1;
    setPhaseForm({ ...phaseForm, order: nextOrder.toString() });
    setEditingPhase(null);
    setShowPhaseForm(true);
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setPhaseForm({
      name: phase.name,
      description: '',
      order: phase.order.toString(),
      resetScores: phase.resetScores || false
    });
    setShowPhaseForm(true);
  };

  const handleDeletePhase = (phase: Phase) => {
    if (confirm(`Are you sure you want to delete "${phase.name}"? This will also delete all associated scores.`)) {
      deletePhaseMutation.mutate(phase.id);
    }
  };

  const handleMovePhase = (phaseId: string, direction: 'up' | 'down') => {
    if (!phases) return;

    const currentPhase = phases.find(p => p.id === phaseId);
    if (!currentPhase) return;

    const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
    const currentIndex = sortedPhases.findIndex(p => p.id === phaseId);

    if (direction === 'up' && currentIndex > 0) {
      const phaseOrders = [
        { id: sortedPhases[currentIndex].id, order: sortedPhases[currentIndex - 1].order },
        { id: sortedPhases[currentIndex - 1].id, order: sortedPhases[currentIndex].order }
      ];
      reorderPhasesMutation.mutate(phaseOrders);
    } else if (direction === 'down' && currentIndex < sortedPhases.length - 1) {
      const phaseOrders = [
        { id: sortedPhases[currentIndex].id, order: sortedPhases[currentIndex + 1].order },
        { id: sortedPhases[currentIndex + 1].id, order: sortedPhases[currentIndex].order }
      ];
      reorderPhasesMutation.mutate(phaseOrders);
    }
  };

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">Create your first event to get started.</p>
            <Button onClick={() => setShowEventForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
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
              <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage events, contestants, shows, and scoring criteria</p>
            </div>
            <Button onClick={() => setShowEventForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <Select value={currentEventId || ''} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex items-center space-x-2">
                            <span>{event.name}</span>
                            <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                              {event.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {currentEvent && (
                  <div className="flex items-center space-x-2">
                    <Badge variant={currentEvent.status === 'active' ? 'default' : 'secondary'}>
                      {currentEvent.status}
                    </Badge>
                    <Badge variant="outline">
                      {currentEvent.currentPhase}
                    </Badge>
                  </div>
                )}
              </div>
              {currentEvent && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Change Status:</span>
                  <Select value={currentEvent.status} onValueChange={(status) => updateEventStatusMutation.mutate({ id: currentEvent.id, status })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Tabs */}
        <Tabs defaultValue="scoring" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="contestants">Contestants</TabsTrigger>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="progression">Progression</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="judge-scores">Judge Scores</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="scoring" className="space-y-6">
            {/* Phase Selection for Show Management */}
            <Card>
              <CardHeader>
                <CardTitle>Show Management</CardTitle>
                <p className="text-gray-600">Add shows and criteria to competition phases</p>
              </CardHeader>
              <CardContent>
                {phases && phases.length > 0 ? (
                  <div className="space-y-6">
                    {phases.sort((a, b) => a.order - b.order).map((phase) => (
                      <div key={phase.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{phase.name}</h3>
                            <Badge variant={phase.status === 'active' ? 'default' : 'secondary'}>
                              {phase.status}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedPhase(phase.id);
                              setShowShowForm(true);
                            }}
                            disabled={!currentEvent}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Show to {phase.name}
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Shows in this phase:</h4>
                          {shows?.filter(show => show.phaseId === phase.id).map((show) => (
                            <div key={show.id} className="border rounded-lg overflow-hidden bg-gray-50">
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-4">
                                  <span className="font-medium">{show.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <Label className="text-sm text-gray-600">Weight:</Label>
                                    <span className="text-sm font-medium">{show.weight}%</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedShow(selectedShow === show.id ? null : show.id);
                                    }}
                                  >
                                    {selectedShow === show.id ? 'Hide' : 'Manage'} Criteria
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => deleteShowMutation.mutate(show.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>

                              {/* Criteria section for selected show */}
                              {selectedShow === show.id && (
                                <div className="p-4 bg-white border-t">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Criteria for {show.name}</h4>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        toast({
                                          title: "Feature Available",
                                          description: "Use the existing show's Add Show button to create criteria.",
                                        });
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Criteria
                                    </Button>
                                  </div>

                                  <div className="grid gap-3">
                                    {(criteriaData as any)?.filter?.((c: any) => c.showId === show.id)?.map((criteria: any) => (
                                      <div key={criteria.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div className="flex items-center space-x-4">
                                          <span className="font-medium">{criteria.name}</span>
                                          <Badge variant="outline">{criteria.weight}% weight</Badge>
                                          <Badge variant="secondary">Max: {criteria.maxScore}</Badge>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => deleteCriteriaMutation.mutate(criteria.id)}
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                    )) || []}
                                    {(!(criteriaData as any)?.filter?.((c: any) => c.showId === show.id)?.length) && (
                                      <div className="text-sm text-gray-500 italic p-3">
                                        No criteria defined for this show yet.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )) || []}
                          {(!shows?.filter(show => show.phaseId === phase.id)?.length) && (
                            <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
                              No shows configured for this phase yet. Click "Add Show" to create the first one.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">No phases available. Create phases first in the Phases tab.</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Event Management</CardTitle>
                  <Button onClick={() => setShowEventForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events?.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{event.name}</h3>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <div className="flex space-x-2 mt-2">
                          <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          <Badge variant="outline">{event.currentPhase}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Select value={event.status} onValueChange={(status) => updateEventStatusMutation.mutate({ id: event.id, status })}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedEvent(event.id)}
                          disabled={selectedEvent === event.id}
                        >
                          {selectedEvent === event.id ? 'Selected' : 'Select'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contestants">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contestant Management</CardTitle>
                  <Button onClick={() => setShowContestantForm(true)} disabled={!currentEvent}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Contestant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contestants?.map((contestant) => (
                    <div key={contestant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">#{contestant.contestantNumber}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{contestant.userId}</h3>
                          <p className="text-sm text-gray-600">{contestant.bio}</p>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant={contestant.status === 'approved' ? 'default' : 'secondary'}>
                              {contestant.status}
                            </Badge>
                            {contestant.occupation && (
                              <Badge variant="outline">{contestant.occupation}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Contestant editing will be available soon.",
                          });
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Contestant deletion will be available soon.",
                          });
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judges">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Judge Management</CardTitle>
                  <Button onClick={() => setShowJudgeForm(true)} disabled={!currentEvent}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Add Judge
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {judges?.map((judge) => (
                    <div key={judge.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><span className="text-sm font-medium">J</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{judge.userId}</h3>
                          <p className="text-sm text-gray-600">{judge.specialization}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Judge editing will be available soon.",
                          });
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Judge deletion will be available soon.",
                          });
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Phase Management</CardTitle>
                    <p className="text-gray-600">Manage competition phases and progression</p>
                  </div>
                  <Button onClick={handleCreatePhase} disabled={!currentEventId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Phase
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases && phases.length > 0 ? (
                    phases.sort((a, b) => a.order - b.order).map((phase, index) => (
                      <div key={phase.id} className={`p-4 rounded-lg border ${
                        phase.status === 'active' ? 'bg-primary/5 border-primary/20' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {phase.status === 'active' ? (
                                <Play className="h-5 w-5 text-green-500" />
                              ) : phase.status === 'completed' ? (
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <Pause className="h-5 w-5 text-gray-400" />
                              )}
                              <div>
                                <span className="font-medium">{phase.name}</span>
                                {phase.description && (
                                  <p className="text-sm text-gray-600">{phase.description}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant={phase.status === 'active' ? 'default' : 'secondary'}>
                              {phase.status}
                            </Badge>
                            <span className="text-sm text-gray-600">Order: {phase.order}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={phase.resetScores || false}
                                className="rounded border-gray-300 text-primary focus:ring-primary/20"
                                disabled
                              />
                              <span className="text-sm text-gray-600">Reset scores</span>
                            </label>
                            <div className="flex items-center space-x-1 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMovePhase(phase.id, 'up')}
                                disabled={index === 0 || reorderPhasesMutation.isPending}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMovePhase(phase.id, 'down')}
                                disabled={index === phases.length - 1 || reorderPhasesMutation.isPending}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPhase(phase)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePhase(phase)}
                                disabled={deletePhaseMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Shows for this phase */}
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Shows in this phase:</h5>
                          <div className="space-y-2">
                            {shows?.filter(show => show.phaseId === phase.id).map(show => (
                              <div key={show.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="text-sm font-medium">{show.name}</span>
                                  <span className="text-xs text-gray-600 ml-2">({show.weight}% weight)</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {(criteriaData as any)?.filter?.((c: any) => c.showId === show.id)?.length || 0} criteria
                                </Badge>
                              </div>
                            )) || []}
                            {(!shows?.filter(show => show.phaseId === phase.id)?.length) && (
                              <div className="text-xs text-gray-500 italic">
                                No shows configured for this phase. Use the Scoring tab to add shows.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No Phases Found</h3>
                      <p className="text-sm">This event doesn't have any phases configured yet.</p>
                      <Button 
                        className="mt-4"
                        onClick={handleCreatePhase}
                        disabled={!currentEventId}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Phase
                      </Button>
                    </div>
                  )}
                </div>

                {/* Phase Actions */}
                {phases && phases.length > 0 && (
                  <div className="mt-6 flex space-x-4">
                    <Button onClick={() => {
                      handleAdvancePhase();
                    }} disabled={advancePhaseMutation.isPending}>
                      <Play className="h-4 w-4 mr-2" />
                      {advancePhaseMutation.isPending ? 'Advancing...' : 'Advance to Next Phase'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Phase reset will be available soon.",
                      });
                    }}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Current Phase
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progression">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Phase Progression
                </CardTitle>
                <p className="text-gray-600">Select top contestants to advance to the next phase</p>
              </CardHeader>
              <CardContent>
                {currentEventId ? (
                  <PhaseProgression eventId={currentEventId} />
                ) : (
                  <p className="text-gray-500">Please select an event to manage phase progression.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judge-scores">
            <JudgeScoresView currentEventId={currentEventId} />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input
                      id="event-name"
                      value={eventForm.name}
                      onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                      placeholder="e.g., Miss Universe 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Event description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-start-date">Start Date</Label>
                    <Input
                      id="event-start-date"
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-end-date">End Date</Label>
                    <Input
                      id="event-end-date"
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-status">Status</Label>
                    <Select value={eventForm.status} onValueChange={(value) => setEventForm({ ...eventForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => createEventMutation.mutate(eventForm)}
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowEventForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Contestant Form Modal */}
        {showContestantForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Contestant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contestant-first-name">First Name</Label>
                      <Input
                        id="contestant-first-name"
                        value={contestantForm.firstName}
                        onChange={(e) => setContestantForm({ ...contestantForm, firstName: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contestant-last-name">Last Name</Label>
                      <Input
                        id="contestant-last-name"
                        value={contestantForm.lastName}
                        onChange={(e) => setContestantForm({ ...contestantForm, lastName: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contestant-email">Email</Label>
                    <Input
                      id="contestant-email"
                      type="email"
                      value={contestantForm.email}
                      onChange={(e) => setContestantForm({ ...contestantForm, email: e.target.value })}
                      placeholder="contestant@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestant-age">Age</Label>
                    <Input
                      id="contestant-age"
                      type="number"
                      value={contestantForm.age}
                      onChange={(e) => setContestantForm({ ...contestantForm, age: e.target.value })}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestant-location">Location</Label>
                    <Input
                      id="contestant-location"
                      value={contestantForm.location}
                      onChange={(e) => setContestantForm({ ...contestantForm, location: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestant-occupation">Occupation</Label>
                    <Input
                      id="contestant-occupation"
                      value={contestantForm.occupation}
                      onChange={(e) => setContestantForm({ ...contestantForm, occupation: e.target.value })}
                      placeholder="Occupation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestant-talent">Talent</Label>
                    <Input
                      id="contestant-talent"
                      value={contestantForm.talent}
                      onChange={(e) => setContestantForm({ ...contestantForm, talent: e.target.value })}
                      placeholder="e.g., Singing, Dancing, Piano"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contestant-bio">Bio</Label>
                    <Textarea
                      id="contestant-bio"
                      value={contestantForm.bio}
                      onChange={(e) => setContestantForm({ ...contestantForm, bio: e.target.value })}
                      placeholder="Brief biography..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => createContestantMutation.mutate(contestantForm)}
                      disabled={createContestantMutation.isPending}
                    >
                      {createContestantMutation.isPending ? 'Adding...' : 'Add Contestant'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowContestantForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Judge Form Modal */}
        {showJudgeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Judge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="judge-first-name">First Name</Label>
                      <Input
                        id="judge-first-name"
                        value={judgeForm.firstName}
                        onChange={(e) => setJudgeForm({ ...judgeForm, firstName: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="judge-last-name">Last Name</Label>
                      <Input
                        id="judge-last-name"
                        value={judgeForm.lastName}
                        onChange={(e) => setJudgeForm({ ...judgeForm, lastName: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="judge-email">Email</Label>
                    <Input
                      id="judge-email"
                      type="email"
                      value={judgeForm.email}
                      onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                      placeholder="judge@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="judge-specialization">Specialization</Label>
                    <Input
                      id="judge-specialization"
                      value={judgeForm.specialization}
                      onChange={(e) => setJudgeForm({ ...judgeForm, specialization: e.target.value })}
                      placeholder="e.g., Fashion, Performance, Interview"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => createJudgeMutation.mutate(judgeForm)}
                      disabled={createJudgeMutation.isPending}
                    >
                      {createJudgeMutation.isPending ? 'Adding...' : 'Add Judge'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowJudgeForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Criteria Form Modal */}
        {showCriteriaForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Scoring Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="criteria-name">Name</Label>
                    <Input
                      id="criteria-name"
                      value={criteriaForm.name}
                      onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })}
                      placeholder="e.g., Interview, Talent, Evening Gown"
                    />
                  </div>
                  <div>
                    <Label htmlFor="criteria-description">Description</Label>
                    <Textarea
                      id="criteria-description"
                      value={criteriaForm.description}
                      onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
                      placeholder="e.g., Communication skills and personality"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="criteria-weight">Weight (%)</Label>
                    <Input
                      id="criteria-weight"
                      type="number"
                      value={criteriaForm.weight}
                      onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value })}
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="criteria-maxScore">Max Score</Label>
                    <Input
                      id="criteria-maxScore"
                      type="number"
                      value={criteriaForm.maxScore}
                      onChange={(e) => setCriteriaForm({ ...criteriaForm, maxScore: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => createCriteriaMutation.mutate(criteriaForm)}
                      disabled={createCriteriaMutation.isPending}
                    >
                      {createCriteriaMutation.isPending ? 'Creating...' : 'Create Criteria'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCriteriaForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Show Form Modal */}
        {showShowForm && selectedPhase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Show to {phases?.find(p => p.id === selectedPhase)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="show-name">Show Name</Label>
                    <Input
                      id="show-name"
                      value={showForm.name}
                      onChange={(e) => setShowForm({ ...showForm, name: e.target.value })}
                      placeholder="e.g., Interview, Talent, Evening Gown"
                    />
                  </div>
                  <div>
                    <Label htmlFor="show-description">Description</Label>
                    <Textarea
                      id="show-description"
                      value={showForm.description}
                      onChange={(e) => setShowForm({ ...showForm, description: e.target.value })}
                      placeholder="e.g., Personal interview with judges"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="show-weight">Weight (%)</Label>
                    <Input
                      id="show-weight"
                      type="number"
                      value={showForm.weight}
                      onChange={(e) => setShowForm({ ...showForm, weight: e.target.value })}
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="show-maxScore">Max Score</Label>
                    <Input
                      id="show-maxScore"
                      type="number"
                      value={showForm.maxScore}
                      onChange={(e) => setShowForm({ ...showForm, maxScore: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => createShowMutation.mutate({
                        ...showForm,
                        phaseId: selectedPhase,
                        weight: parseInt(showForm.weight),
                        maxScore: parseInt(showForm.maxScore)
                      })}
                      disabled={createShowMutation.isPending}
                    >
                      {createShowMutation.isPending ? 'Creating...' : 'Create Show'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowShowForm(false);
                      setSelectedPhase(null);
                      setShowForm({ name: '', description: '', weight: '', maxScore: '10' });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create/Edit Phase Form Modal */}
        {showPhaseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingPhase ? 'Edit Phase' : 'Create New Phase'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phase-name">Phase Name</Label>
                    <Input
                      id="phase-name"
                      value={phaseForm.name}
                      onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })}
                      placeholder="e.g., Preliminaries, Semi-Finals, Finals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phase-description">Description</Label>
                    <Textarea
                      id="phase-description"
                      value={phaseForm.description}
                      onChange={(e) => setPhaseForm({ ...phaseForm, description: e.target.value })}
                      placeholder="e.g., Initial judging round with all contestants"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phase-order">Order</Label>
                    <Input
                      id="phase-order"
                      type="number"
                      value={phaseForm.order}
                      onChange={(e) => setPhaseForm({ ...phaseForm, order: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="phase-reset-scores"
                      checked={phaseForm.resetScores}
                      onChange={(e) => setPhaseForm({ ...phaseForm, resetScores: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <Label htmlFor="phase-reset-scores">Reset scores when entering this phase</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        if (editingPhase) {
                          updatePhaseMutation.mutate({
                            id: editingPhase.id,
                            data: {
                              name: phaseForm.name,
                              description: phaseForm.description,
                              order: parseInt(phaseForm.order),
                              resetScores: phaseForm.resetScores
                            }
                          });
                        } else {
                          createPhaseMutation.mutate({
                            name: phaseForm.name,
                            description: phaseForm.description,
                            order: parseInt(phaseForm.order),
                            resetScores: phaseForm.resetScores,
                            status: 'pending'
                          });
                        }
                      }}
                      disabled={createPhaseMutation.isPending || updatePhaseMutation.isPending}
                    >
                      {(createPhaseMutation.isPending || updatePhaseMutation.isPending) 
                        ? (editingPhase ? 'Updating...' : 'Creating...') 
                        : (editingPhase ? 'Update Phase' : 'Create Phase')
                      }
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowPhaseForm(false);
                      setEditingPhase(null);
                      setPhaseForm({ name: '', description: '', order: '', resetScores: false });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}