import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useState } from "react";
import type { Event, Show, Criteria, Phase } from "@shared/schema";

function ShowDisplay({ eventId, phaseId }: { eventId: string; phaseId: string }) {
  const { data: shows } = useQuery<Show[]>({
    queryKey: ['/api/events', eventId, 'shows'],
    enabled: !!eventId
  });

  const phaseShows = shows?.filter(show => show.phaseId === phaseId) || [];

  if (!phaseShows || phaseShows.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic">
        No shows configured for this phase
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {phaseShows.map((show) => (
        <div key={show.id} className="border-l-2 border-primary/30 pl-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {show.name}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {show.weight}% weight
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mt-1">{show.description}</p>
          <CriteriaDisplay showId={show.id} />
        </div>
      ))}
    </div>
  );
}

function CriteriaDisplay({ showId }: { showId: string }) {
  const { data: criteria } = useQuery<Criteria[]>({
    queryKey: ['/api/shows', showId, 'criteria'],
    enabled: !!showId
  });

  if (!criteria || criteria.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 ml-4">
      <p className="text-xs text-gray-500 mb-1">Scoring criteria:</p>
      <div className="text-xs text-gray-600 space-y-1">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="flex justify-between">
            <span>• {criterion.name}</span>
            <span className="text-gray-400">({criterion.weight}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContestsPage() {
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const { data: phases } = useQuery<Phase[]>({
    queryKey: ['/api/events', expandedEvent, 'phases'],
    enabled: !!expandedEvent,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-2">Contests</h1>
            <p className="text-xl text-gray-600 mb-4">Discover all our pageant events</p>
            <Badge className="bg-primary/10 text-primary">
              {events?.length || 0} Events
            </Badge>
          </div>
        </div>
      </div>

      {/* Contests Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}>
                      {event.status}
                    </Badge>
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
                  <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} - {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Location TBA</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Phase: {event.currentPhase || 'Not started'}</span>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Event Status</span>
                        <Badge 
                          variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {event.status === 'active' ? 'Live Now' : event.status === 'upcoming' ? 'Coming Soon' : 'Completed'}
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                      >
                        {expandedEvent === event.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Hide Scoring Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            View Scoring Details
                          </>
                        )}
                      </Button>

                      {expandedEvent === event.id && phases && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-3">Competition Phases ({phases.length} phases)</h4>
                          <div className="space-y-4">
                            {phases.map((phase) => (
                              <div key={phase.id} className="bg-white p-4 rounded border">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{phase.name}</span>
                                    <Badge 
                                      variant={
                                        phase.status === 'active' ? 'default' : 
                                        phase.status === 'completed' ? 'secondary' : 'outline'
                                      }
                                      className="text-xs"
                                    >
                                      {phase.status}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Phase {phase.order}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-3">
                                  <h5 className="font-medium mb-2">Shows for this phase:</h5>
                                  <ShowDisplay eventId={event.id} phaseId={phase.id} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contests Yet</h3>
            <p className="text-gray-600">Check back later for upcoming pageant events.</p>
          </div>
        )}
      </div>
    </div>
  );
}