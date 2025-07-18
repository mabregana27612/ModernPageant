import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Trophy } from "lucide-react";

interface ResultsTableProps {
  results: any[];
  title?: string;
}

export default function ResultsTable({ results, title = "Final Rankings" }: ResultsTableProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="text-accent h-5 w-5 mr-2" />;
      case 2:
        return <Medal className="text-gray-400 h-5 w-5 mr-2" />;
      case 3:
        return <Medal className="text-amber-600 h-5 w-5 mr-2" />;
      default:
        return <Trophy className="text-gray-300 h-5 w-5 mr-2" />;
    }
  };

  const getRankSuffix = (position: number) => {
    switch (position) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
                  Score Breakdown
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={result.contestantId} className={index === 0 ? 'bg-accent/5' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(index + 1)}
                      <span className={`text-sm font-bold ${index === 0 ? 'text-accent' : 'text-gray-600'}`}>
                        {index + 1}{getRankSuffix(index + 1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.user?.profileImageUrl || ''} alt="" />
                        <AvatarFallback>
                          {result.user?.firstName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
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
                      {result.totalScore?.toFixed(1) || '0.0'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {result.scores?.slice(0, 3).map((score: any, i: number) => (
                        <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {score.criteria}: {score.score}
                        </span>
                      ))}
                      {result.scores?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{result.scores.length - 3} more
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
  );
}
