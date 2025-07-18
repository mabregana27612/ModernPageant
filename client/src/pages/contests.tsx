
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Trophy, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Event, ScoringCriteria, SubCriteria } from "@shared/schema";

export default function ContestsPage() {
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  
  const { data: criteria } = useQuery<ScoringCriteria[]>({
    queryKey: ['/api/events', expandedEvent, 'criteria'],
    enabled: !!expandedEvent,
  });
  
  const { data: subCriteria } = useQuery<SubCriteria[]>({
    queryKey: ['/api/criteria', expandedEvent, 'sub-criteria'],
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
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{event.location || 'Location TBA'}</span>
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
                      
                      {expandedEvent === event.id && criteria && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-3">Scoring Criteria ({criteria.length} categories)</h4>
                          <div className="space-y-3">
                            {criteria.map((criterion) => (
                              <div key={criterion.id} className="bg-white p-3 rounded border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{criterion.name}</span>
                                  <Badge variant="outline">{criterion.weight}%</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                                
                                {/* Show sub-criteria if available */}
                                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Sub-criteria breakdown:</p>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    {criterion.name === 'Interview' && (
                                      <>
                                        <div>• Communication Skills (35%)</div>
                                        <div>• Intelligence & Knowledge (30%)</div>
                                        <div>• Confidence & Poise (25%)</div>
                                        <div>• Personality & Charisma (10%)</div>
                                      </>
                                    )}
                                    {criterion.name === 'Talent' && (
                                      <>
                                        <div>• Skill Level (40%)</div>
                                        <div>• Stage Presence (30%)</div>
                                        <div>• Creativity & Originality (20%)</div>
                                        <div>• Overall Performance (10%)</div>
                                      </>
                                    )}
                                    {criterion.name === 'Evening Gown' && (
                                      <>
                                        <div>• Elegance & Grace (35%)</div>
                                        <div>• Poise & Posture (30%)</div>
                                        <div>• Gown Selection (25%)</div>
                                        <div>• Overall Presentation (10%)</div>
                                      </>
                                    )}
                                    {criterion.name === 'Swimwear' && (
                                      <>
                                        <div>• Physical Fitness (40%)</div>
                                        <div>• Confidence (30%)</div>
                                        <div>• Stage Presence (20%)</div>
                                        <div>• Overall Impression (10%)</div>
                                      </>
                                    )}
                                  </div>
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
