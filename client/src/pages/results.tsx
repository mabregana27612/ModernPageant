
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, BarChart3, PieChart, Users, Calculator, Eye, Printer } from "lucide-react";
import { useState } from "react";
import type { Event } from "@shared/schema";
import ResultsTable from "@/components/results-table";
import JudgeScoringBreakdown from "@/components/judge-scoring-breakdown";
import { useAuth } from "@/hooks/useAuth";

export default function Results() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [isPrintMode, setIsPrintMode] = useState(false);
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin';

  // Print functions
  const handlePrintResults = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  const handlePrintSpecificPhase = (phaseId: string, phaseName: string) => {
    const printWindow = window.open('', '_blank');
    const phaseData = organizedResults.find(pr => pr.phase.id === phaseId);
    
    if (printWindow && phaseData && currentEvent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${currentEvent.name} - ${phaseName} Results</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .results-table th, .results-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .results-table th { background-color: #f0f0f0; }
            .rank-1 { background-color: #ffd700; }
            .rank-2 { background-color: #c0c0c0; }
            .rank-3 { background-color: #cd7f32; }
            @media print { 
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${currentEvent?.name}</h1>
            <h2>${phaseName} Results</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="results-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Contestant</th>
                <th>Total Score</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody>
              ${phaseData.results.slice(0, 10).map((result: any, index: number) => `
                <tr class="${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''}">
                  <td>${index + 1}</td>
                  <td>${result.user?.firstName} ${result.user?.lastName}</td>
                  <td>${parseFloat(result.totalScore).toFixed(1)}</td>
                  <td>${parseFloat(result.averageScore).toFixed(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: phases } = useQuery<any[]>({
    queryKey: ['/api/events', selectedEvent || events?.find(e => e.status === 'active')?.id, 'phases'],
    enabled: !!(selectedEvent || events?.find(e => e.status === 'active')),
  });

  const { data: shows } = useQuery<any[]>({
    queryKey: ['/api/events', selectedEvent || events?.find(e => e.status === 'active')?.id, 'shows'],
    enabled: !!(selectedEvent || events?.find(e => e.status === 'active')),
  });

  const activeEvent = events?.find(e => e.status === 'active') || events?.[0];
  const currentEvent = selectedEvent ? events?.find(e => e.id === selectedEvent) : activeEvent;

  // Get results for each phase
  const phaseResults = useQuery({
    queryKey: ['/api/events', currentEvent?.id, 'all-phase-results'],
    enabled: !!currentEvent && !!phases,
    queryFn: async () => {
      if (!currentEvent || !phases) return [];
      
      const allResults = await Promise.all(
        phases.map(async (phase) => {
          const response = await fetch(`/api/events/${currentEvent.id}/results?phaseId=${phase.id}`);
          const results = await response.json();
          return {
            phase,
            results
          };
        })
      );
      
      return allResults;
    }
  });

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

  const organizedResults = phaseResults.data || [];
  const overallWinner = organizedResults
    .flatMap(pr => pr.results)
    .sort((a: any, b: any) => parseFloat(b.totalScore) - parseFloat(a.totalScore))[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">Competition Results</h1>
                <p className="text-gray-600">{currentEvent.name} - Rankings by Show & Phase</p>
              </div>
              <div className="no-print flex gap-2">
                <Button
                  onClick={handlePrintResults}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print All Results
                </Button>
              </div>
            </div>
            
            {/* Event Selector */}
            {events && events.length > 1 && (
              <div className="mt-4">
                <select 
                  value={selectedEvent} 
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Select Event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} {event.status === 'active' && '(Active)'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Winner Announcement */}
        {overallWinner && (
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-8 mb-8 border border-accent/20">
            <div className="text-center">
              <Crown className="text-accent h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-2">👑 Overall Winner</h2>
              <img 
                src={overallWinner.user?.profileImageUrl || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200'} 
                alt={`${overallWinner.user?.firstName} ${overallWinner.user?.lastName}`}
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-accent shadow-lg"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {overallWinner.user?.firstName} {overallWinner.user?.lastName}
              </h3>
              <p className="text-gray-600 mb-4">Final Score: {parseFloat(overallWinner.totalScore).toFixed(1)} / 100</p>
            </div>
          </div>
        )}

        {/* Results Tabs */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Competition Results</TabsTrigger>
            <TabsTrigger value="judging" className={!isAdmin ? "opacity-50 cursor-not-allowed" : ""}>
              {isAdmin ? (
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Judge Scoring Details
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Admin Only
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-8">
            {/* Results by Phase and Show */}
            {organizedResults.length > 0 ? (
              <div className="space-y-8">
            {organizedResults.map((phaseResult) => {
              const { phase, results } = phaseResult;
              
              // Group results by show within this phase
              const showGroups = shows?.reduce((acc, show) => {
                const showResults = results.filter((result: any) => 
                  result.scores?.some((score: any) => score.showId === show.id)
                );
                
                if (showResults.length > 0) {
                  // Calculate show-specific scores
                  const processedResults = showResults.map((result: any) => {
                    const showScores = result.scores?.filter((score: any) => score.showId === show.id) || [];
                    const showTotal = showScores.reduce((sum: number, score: any) => sum + parseFloat(score.score), 0);
                    
                    return {
                      ...result,
                      showTotal: showTotal,
                      showScores: showScores
                    };
                  }).sort((a: any, b: any) => b.showTotal - a.showTotal);
                  
                  acc[show.id] = {
                    show,
                    results: processedResults
                  };
                }
                
                return acc;
              }, {} as Record<string, any>) || {};

              return (
                <div key={phase.id} className="space-y-6">
                  {/* Phase Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-600' :
                        phase.status === 'active' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{phase.name}</h2>
                        <div className="text-gray-600 flex items-center gap-2">
                          <span>Phase {phase.order}</span>
                          <span>•</span>
                          <Badge variant={
                            phase.status === 'completed' ? 'default' :
                            phase.status === 'active' ? 'secondary' : 'outline'
                          }>
                            {phase.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="no-print">
                        <Button
                          onClick={() => handlePrintSpecificPhase(phase.id, phase.name)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Print {phase.name}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Show Results within Phase */}
                  {Object.values(showGroups).map((showGroup: any) => (
                    <Card key={showGroup.show.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl text-gray-900">
                              {showGroup.show.name} Rankings
                            </CardTitle>
                            <p className="text-gray-600 mt-1">
                              {showGroup.show.description} • Weight: {showGroup.show.weight}%
                            </p>
                          </div>
                          <Badge variant="outline" className="text-sm">
                            {showGroup.results.length} contestants
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
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
                                  Show Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Overall Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Criteria Breakdown
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {showGroup.results.map((result: any, index: number) => (
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
                                        src={result.user?.profileImageUrl || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40'} 
                                        alt={`${result.user?.firstName} ${result.user?.lastName}`}
                                      />
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {result.user?.firstName} {result.user?.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">#{result.contestantNumber}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                      {result.showTotal?.toFixed(1) || '0.0'}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant="outline">
                                      {parseFloat(result.totalScore).toFixed(1)}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                      {result.showScores?.slice(0, 3).map((score: any, i: number) => (
                                        <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                          {score.criteria}: {score.score}
                                        </span>
                                      ))}
                                      {result.showScores?.length > 3 && (
                                        <span className="text-xs text-gray-500">
                                          +{result.showScores.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Overall Phase Results */}
                  {results.length > 0 && (
                    <ResultsTable 
                      results={results} 
                      title={`${phase.name} - Overall Rankings`}
                    />
                  )}
                </div>
              );
            })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
                <p className="text-gray-600">Results will be available once judging is complete.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="judging" className="space-y-6">
            <JudgeScoringBreakdown 
              eventId={currentEvent.id} 
              phaseId={phases?.find(p => p.status === 'active')?.id}
            />
          </TabsContent>
        </Tabs>

        {/* Analytics Charts */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
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
              <CardTitle>Show Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Show Performance Chart</p>
                  <p className="text-xs text-gray-400">Pie chart showing performance across different shows</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
