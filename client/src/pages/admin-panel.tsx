import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Play, Pause, RotateCcw, Users, Trophy, Calendar, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Event, ScoringCriteria, Phase, Contestant, Judge } from "@shared/schema";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showContestantForm, setShowContestantForm] = useState(false);
  const [showJudgeForm, setShowJudgeForm] = useState(false);
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);

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

  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    description: '',
    weight: '',
    maxScore: '100'
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
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

  const { data: criteria } = useQuery<ScoringCriteria[]>({
    queryKey: ['/api/events', currentEventId, 'criteria'],
    enabled: !!currentEventId,
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

  // Mutation for creating criteria
  const createCriteriaMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', `/api/events/${currentEventId}/criteria`, {
        name: data.name,
        description: data.description,
        weight: parseInt(data.weight),
        maxScore: parseInt(data.maxScore)
      });
    },
    onSuccess: () => {
      toast({
        title: "Criteria created",
        description: "Scoring criteria has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'criteria'] });
      setShowCriteriaForm(false);
      setCriteriaForm({ name: '', description: '', weight: '', maxScore: '100' });
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
        description: "Failed to create criteria. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCriteriaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest('PATCH', `/api/events/${currentEventId}/criteria/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Criteria updated",
        description: "Scoring criteria has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'criteria'] });
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
        description: "Failed to update criteria. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCriteriaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/events/${currentEventId}/criteria/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Criteria deleted",
        description: "Scoring criteria has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', currentEventId, 'criteria'] });
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
        description: "Failed to delete criteria. Please try again.",
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

  // Mutation for deleting event
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
      // Reset selected event if it was deleted
      if (selectedEvent === id) {
        setSelectedEvent(null);
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
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

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
              <p className="text-gray-600">Manage events, contestants, and scoring criteria</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="contestants">Contestants</TabsTrigger>
            <TabsTrigger value="judges">Judges</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="scoring" className="space-y-6">
            {/* Scoring Criteria Management */}
            <Card>
              <CardHeader>
                <CardTitle>Scoring Criteria Configuration</CardTitle>
                <p className="text-gray-600">Define and customize scoring categories with weighted calculations</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criteria?.map((criterion) => (
                    <div key={criterion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{criterion.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-600">Weight:</Label>
                          <Input
                            type="number"
                            value={criterion.weight}
                            min="0"
                            max="100"
                            className="w-16 text-center"
                            onChange={(e) => {
                              const weight = parseFloat(e.target.value);
                              updateCriteriaMutation.mutate({
                                id: criterion.id,
                                data: { weight }
                              });
                            }}
                          />
                          <span className="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => {
                          toast({
                            title: "Feature Coming Soon",
                            description: "Inline criteria editing will be available soon.",
                          });
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteCriteriaMutation.mutate(criterion.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add New Criteria */}
                <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setShowCriteriaForm(true)}
                      disabled={!currentEventId}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Criteria
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competition Phase Management */}
            <Card>
              <CardHeader>
                <CardTitle>Competition Phases</CardTitle>
                <p className="text-gray-600">Configure multi-phase competitions with score reset capabilities</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases?.map((phase) => (
                    <div key={phase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {phase.status === 'active' ? (
                            <Play className="h-5 w-5 text-green-500" />
                          ) : (
                            <Pause className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="font-medium">{phase.name}</span>
                        </div>
                        <Badge variant={phase.status === 'active' ? 'default' : 'secondary'}>
                          {phase.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={phase.resetScores}
                            className="rounded border-gray-300 text-primary focus:ring-primary/20"
                            onChange={(e) => {
                              toast({
                                title: "Feature Coming Soon",
                                description: "Phase configuration will be available soon.",
                              });
                            }}
                          />
                          <span className="text-sm text-gray-600">Reset scores after phase</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Phase Actions */}
                <div className="mt-6 flex space-x-4">
                  <Button onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Phase advancement will be available soon.",
                    });
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Advance to Next Phase
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tab contents would go here */}
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
                            <Badge variant="outline">{contestant.talent}</Badge>
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
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">J</span>
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
      </div>
    </div>
  );
}
