import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import type { Contestant, User, ScoringCriteria } from "@shared/schema";

interface ContestantCardProps {
  contestant: Contestant & { user: User };
  criteria: ScoringCriteria[];
  onScoreSubmit: (contestantId: string, criteriaId: string, score: number) => void;
  isLoading?: boolean;
}

export default function ContestantCard({ 
  contestant, 
  criteria, 
  onScoreSubmit,
  isLoading = false
}: ContestantCardProps) {
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleSubmit = (criteriaId: string) => {
    const score = scores[criteriaId];
    if (score && score >= 1 && score <= 10) {
      onScoreSubmit(contestant.id, criteriaId, score);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={contestant.photoUrl || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
          alt={`${contestant.user.firstName} ${contestant.user.lastName}`}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
          #{contestant.contestantNumber}
        </div>
        <Badge className="absolute top-4 right-4 bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          {contestant.status}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {contestant.user.firstName} {contestant.user.lastName}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Age: {contestant.age} • {contestant.location} • {contestant.occupation}
        </p>
        
        {/* Score Inputs */}
        <div className="space-y-3">
          {criteria.map((criterion) => (
            <div key={criterion.id}>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  {criterion.name}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={scores[criterion.id] || ''}
                    onChange={(e) => setScores(prev => ({
                      ...prev,
                      [criterion.id]: parseInt(e.target.value) || 0
                    }))}
                    className="w-16 text-center"
                    placeholder="Score"
                  />
                  <span className="text-sm text-gray-500">/10</span>
                </div>
              </div>
              
              <Button
                onClick={() => handleSubmit(criterion.id)}
                size="sm"
                disabled={isLoading || !scores[criterion.id]}
                className="w-full"
              >
                {isLoading ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Submit {criterion.name} Score
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
