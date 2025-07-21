import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, Calculator, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface JudgeScoringBreakdownProps {
  eventId: string;
  phaseId?: string;
  contestantId?: string;
  showDetailed?: boolean;
}

export default function JudgeScoringBreakdown({ 
  eventId, 
  phaseId, 
  contestantId,
  showDetailed = true 
}: JudgeScoringBreakdownProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin';

  // Fetch all scores for the event/phase
  const { data: allScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['/api/events', eventId, 'scores', phaseId],
    queryFn: async () => {
      const url = `/api/events/${eventId}/scores${phaseId ? `?phaseId=${phaseId}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch scores');
      return response.json();
    },
    enabled: !!eventId,
  });

  // Fetch judges information
  const { data: judges } = useQuery<any[]>({
    queryKey: ['/api/events', eventId, 'judges'],
    enabled: !!eventId,
  });

  // Fetch contestants information  
  const { data: contestants } = useQuery<any[]>({
    queryKey: ['/api/events', eventId, 'contestants'],
    enabled: !!eventId,
  });

  // Fetch shows and criteria
  const { data: shows } = useQuery<any[]>({
    queryKey: ['/api/events', eventId, 'shows'],
    enabled: !!eventId,
  });

  if (scoresLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading scoring data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!allScores?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scoring Data</h3>
          <p className="text-gray-600">Scores will appear here once judges begin scoring.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter scores by contestant if specified
  const filteredScores = contestantId 
    ? allScores.filter((score: any) => score.contestantId === contestantId)
    : allScores;

  // Group scores by contestant, then by judge, then by criteria
  const groupedData = filteredScores.reduce((acc: any, score: any) => {
    const { contestantId, judgeId, criteriaId, showId } = score;
    
    if (!acc[contestantId]) {
      acc[contestantId] = {
        contestant: contestants?.find((c: any) => c.id === contestantId),
        judgeScores: {},
        totalsByJudge: {},
        overallTotal: 0
      };
    }
    
    if (!acc[contestantId].judgeScores[judgeId]) {
      acc[contestantId].judgeScores[judgeId] = {
        judge: judges?.find((j: any) => j.id === judgeId),
        scores: {},
        total: 0
      };
    }
    
    if (!acc[contestantId].judgeScores[judgeId].scores[showId]) {
      acc[contestantId].judgeScores[judgeId].scores[showId] = {
        show: shows?.find((s: any) => s.id === showId),
        criteria: []
      };
    }
    
    acc[contestantId].judgeScores[judgeId].scores[showId].criteria.push(score);
    
    return acc;
  }, {});

  // Calculate totals
  Object.keys(groupedData).forEach(contestantId => {
    const contestantData = groupedData[contestantId];
    Object.keys(contestantData.judgeScores).forEach(judgeId => {
      const judgeData = contestantData.judgeScores[judgeId];
      let judgeTotal = 0;
      
      Object.values(judgeData.scores).forEach((showData: any) => {
        const showTotal = showData.criteria.reduce((sum: number, score: any) => 
          sum + parseFloat(score.score || 0), 0
        );
        judgeTotal += showTotal * (parseFloat(showData.show?.weight || 100) / 100);
      });
      
      judgeData.total = judgeTotal;
    });
    
    // Calculate contestant's overall average from all judges
    const judgeTotals = Object.values(contestantData.judgeScores).map((j: any) => j.total);
    contestantData.overallTotal = judgeTotals.length > 0 
      ? judgeTotals.reduce((sum: number, total: number) => sum + total, 0) / judgeTotals.length
      : 0;
  });

  const toggleSection = (sectionId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(sectionId)) {
      newOpen.delete(sectionId);
    } else {
      newOpen.add(sectionId);
    }
    setOpenSections(newOpen);
  };

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-amber-800">
              <Eye className="h-4 w-4" />
              <p className="text-sm">Detailed scoring breakdown is only visible to administrators for verification purposes.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isAdmin && (
        <>
          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Judge Scoring Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{(judges as any[])?.length || 0}</div>
                  <div className="text-sm text-gray-600">Total Judges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Object.keys(groupedData).length}</div>
                  <div className="text-sm text-gray-600">Contestants Scored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{filteredScores.length}</div>
                  <div className="text-sm text-gray-600">Total Scores Submitted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          {Object.entries(groupedData).map(([contestantId, data]: [string, any]) => (
            <Card key={contestantId}>
              <Collapsible 
                open={openSections.has(contestantId)}
                onOpenChange={() => toggleSection(contestantId)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={data.contestant?.user?.profileImageUrl || ''} alt="" />
                          <AvatarFallback>
                            {data.contestant?.user?.firstName?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {data.contestant?.user?.firstName} {data.contestant?.user?.lastName}
                          </CardTitle>
                          <p className="text-gray-600">Contestant #{data.contestant?.contestantNumber}</p>
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          Avg: {data.overallTotal.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {Object.keys(data.judgeScores).length} judges scored
                        </Badge>
                        {openSections.has(contestantId) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {Object.entries(data.judgeScores).map(([judgeId, judgeData]: [string, any]) => (
                        <div key={judgeId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={judgeData.judge?.user?.profileImageUrl || ''} alt="" />
                                <AvatarFallback>
                                  {judgeData.judge?.user?.firstName?.charAt(0) || 'J'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {judgeData.judge?.user?.firstName} {judgeData.judge?.user?.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{judgeData.judge?.specialization}</p>
                              </div>
                            </div>
                            <Badge variant="default">
                              Total: {judgeData.total.toFixed(1)}
                            </Badge>
                          </div>
                          
                          {/* Show breakdown */}
                          <div className="grid gap-3">
                            {Object.entries(judgeData.scores).map(([showId, showData]: [string, any]) => (
                              <div key={showId} className="bg-gray-50 rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-sm">{showData.show?.name}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    Weight: {showData.show?.weight}%
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {showData.criteria.map((score: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded px-2 py-1 text-xs">
                                      <span className="font-medium">{score.criteriaName}:</span>
                                      <span className="ml-1 text-primary font-bold">{score.score}</span>
                                      <span className="text-gray-500">/{score.maxScore}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}