import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, BarChart3, Crown, Plus } from "lucide-react";
import { Link } from "wouter";
import type { Event } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const isAdmin = user?.role === 'admin';
  const isJudge = user?.role === 'judge';
  const isContestant = user?.role === 'contestant';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin && "Manage your pageant events and oversee competitions"}
                {isJudge && "View your judging assignments and score contestants"}
                {isContestant && "Track your competition progress and results"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin && (
            <Link href="/admin">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Crown className="h-8 w-8 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                      <p className="text-sm text-gray-600">Manage events and scoring</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          
          {(isJudge || isAdmin) && (
            <Link href="/judge">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BarChart3 className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Judge Dashboard</h3>
                      <p className="text-sm text-gray-600">Score contestants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
          
          <Link href="/results">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Trophy className="h-8 w-8 text-accent" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Results</h3>
                    <p className="text-sm text-gray-600">View competition results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
                  <p className="text-sm text-gray-600">View contestants & judges</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-playfair font-bold text-gray-900">Events</h2>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-4">
                  {isAdmin ? "Create your first pageant event to get started." : "No events available at the moment."}
                </p>
                {isAdmin && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">{event.name}</CardTitle>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Crown className="h-4 w-4 mr-2" />
                      {event.currentPhase}
                    </div>
                    <div className="flex space-x-2">
                      {isAdmin && (
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      )}
                      {isJudge && (
                        <Button size="sm">
                          Judge
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
