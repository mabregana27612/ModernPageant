
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Trophy, Users } from "lucide-react";
import type { Event, Contestant, User } from "@shared/schema";

export default function ContestantsPage() {
  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Get the active event or first event
  const activeEvent = events?.find(e => e.status === 'active') || events?.[0];

  const { data: contestants } = useQuery<(Contestant & { user: User })[]>({
    queryKey: ['/api/events', activeEvent?.id, 'contestants'],
    enabled: !!activeEvent?.id,
  });

  if (!activeEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Events</h3>
            <p className="text-gray-600">There are no active events with contestants to display.</p>
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
          <div className="text-center">
            <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-2">Meet the Contestants</h1>
            <p className="text-xl text-gray-600 mb-4">{activeEvent.name}</p>
            <Badge className="bg-primary/10 text-primary">
              {contestants?.length || 0} Contestants
            </Badge>
          </div>
        </div>
      </div>

      {/* Contestants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {contestants && contestants.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {contestants.map((contestant) => (
              <Card key={contestant.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-sm font-semibold">
                      #{contestant.contestantNumber}
                    </Badge>
                    <Badge variant={contestant.status === 'approved' ? 'default' : 'secondary'}>
                      {contestant.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {contestant.user?.profileImageUrl ? (
                        <img 
                          src={contestant.user.profileImageUrl} 
                          alt={`${contestant.user.firstName} ${contestant.user.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {contestant.user?.firstName?.[0]}{contestant.user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-1">
                      {contestant.user?.firstName} {contestant.user?.lastName}
                    </CardTitle>
                    {contestant.age && (
                      <p className="text-sm text-gray-500">Age {contestant.age}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contestant.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{contestant.location}</span>
                      </div>
                    )}
                    
                    {contestant.occupation && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{contestant.occupation}</span>
                      </div>
                    )}
                    
                    {contestant.talent && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{contestant.talent}</span>
                      </div>
                    )}
                    
                    {contestant.bio && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {contestant.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contestants Yet</h3>
            <p className="text-gray-600">Contestants will appear here once they are registered for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
}
