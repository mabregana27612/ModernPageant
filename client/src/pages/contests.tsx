
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import type { Event } from "@shared/schema";

export default function ContestsPage() {
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
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
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Event Status</span>
                        <Badge 
                          variant={event.status === 'active' ? 'default' : event.status === 'upcoming' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {event.status === 'active' ? 'Live Now' : event.status === 'upcoming' ? 'Coming Soon' : 'Completed'}
                        </Badge>
                      </div>
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
