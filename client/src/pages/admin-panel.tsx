import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Event, ScoringCriteria, Phase } from "@shared/schema";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: criteria } = useQuery<ScoringCriteria[]>({
    queryKey: ['/api/events', selectedEvent, 'criteria'],
    enabled: !!selectedEvent,
  });

  const { data: phases } = useQuery<Phase[]>({
    queryKey: ['/api/events', selectedEvent, 'phases'],
    enabled: !!selectedEvent,
  });

  const createCriteriaMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', `/api/events/${selectedEvent}/criteria`, data);
    },
    onSuccess: () => {
      toast({
        title: "Criteria created",
        description: "Scoring criteria has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', selectedEvent, 'criteria'] });
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
      await apiRequest('PATCH', `/api/events/${selectedEvent}/criteria/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Criteria updated",
        description: "Scoring criteria has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', selectedEvent, 'criteria'] });
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
      await apiRequest('DELETE', `/api/events/${selectedEvent}/criteria/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Criteria deleted",
        description: "Scoring criteria has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', selectedEvent, 'criteria'] });
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

  const activeEvent = events?.find(e => e.status === 'active') || events?.[0];
  const currentEvent = selectedEvent ? events?.find(e => e.id === selectedEvent) : activeEvent;

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">Create your first event to get started.</p>
            <Button>
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
            <Button>
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
            <CardTitle>Current Event: {currentEvent.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant={currentEvent.status === 'active' ? 'default' : 'secondary'}>
                {currentEvent.status}
              </Badge>
              <Badge variant="outline">
                {currentEvent.currentPhase}
              </Badge>
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
                        <Button size="sm" variant="ghost">
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
                    <Button variant="ghost" className="text-gray-400 hover:text-gray-600">
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
                              // Update phase reset scores
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
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Advance to Next Phase
                  </Button>
                  <Button variant="outline">
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
                <CardTitle>Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Event management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contestants">
            <Card>
              <CardHeader>
                <CardTitle>Contestant Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Contestant management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judges">
            <Card>
              <CardHeader>
                <CardTitle>Judge Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Judge management features coming soon...</p>
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
      </div>
    </div>
  );
}
