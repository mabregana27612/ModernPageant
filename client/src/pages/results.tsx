import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, BarChart3, PieChart } from "lucide-react";
import { useState } from "react";
import type { Event } from "@shared/schema";

export default function Results() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: results } = useQuery<any[]>({
    queryKey: ['/api/results'],
  });

  const activeEvent = events?.find(e => e.status === 'active') || events?.[0];
  const currentEvent = selectedEvent ? events?.find(e => e.id === selectedEvent) : activeEvent;

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600">Results will be available once judging is complete.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winner = results?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Competition Results</h1>
            <p className="text-gray-600">{currentEvent.name} - Final Rankings</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Winner Announcement */}
        {winner && (
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-8 mb-8 border border-accent/20">
            <div className="text-center">
              <Crown className="text-accent h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-2">👑 Winner</h2>
              <img 
                src={winner.user.profileImageUrl || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200'} 
                alt={`${winner.user.firstName} ${winner.user.lastName}`}
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-accent shadow-lg"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {winner.user.firstName} {winner.user.lastName}
              </h3>
              <p className="text-gray-600 mb-4">Final Score: {parseFloat(winner.totalScore).toFixed(1)} / 100</p>
              <div className="flex justify-center space-x-4 text-sm">
                {winner.scores?.map((score: any, index: number) => (
                  <div key={`${score.criteria}-${index}`} className="bg-white/50 px-4 py-2 rounded-lg">
                    <span className="font-medium">{score.criteria}: {score.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Final Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contestant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results?.map((result, index) => (
                    <tr key={result.contestantId} className={index === 0 ? 'bg-accent/5' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <Crown className="text-accent h-5 w-5 mr-2" />}
                          {index === 1 && <Medal className="text-gray-400 h-5 w-5 mr-2" />}
                          {index === 2 && <Medal className="text-amber-600 h-5 w-5 mr-2" />}
                          <span className={`text-sm font-bold ${index === 0 ? 'text-accent' : 'text-gray-600'}`}>
                            {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={result.user.profileImageUrl || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40'} 
                            alt={`${result.user.firstName} ${result.user.lastName}`}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {result.user.firstName} {result.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">#{result.contestantNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          {parseFloat(result.totalScore).toFixed(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {result.scores?.slice(0, 3).map((score: any, index: number) => (
                            <span key={`${score.criteria}-${index}-${result.contestantId}`} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {score.criteria}: {score.score}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Score Distribution Chart</p>
                  <p className="text-xs text-gray-400">Interactive bar chart showing score distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Category Performance Chart</p>
                  <p className="text-xs text-gray-400">Pie chart showing category weight distribution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
