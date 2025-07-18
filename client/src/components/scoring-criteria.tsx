import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Mic, Music, Shirt, MessageSquare } from "lucide-react";
import type { ScoringCriteria } from "@shared/schema";

interface ScoringCriteriaProps {
  criteria: ScoringCriteria[];
  onUpdate: (id: string, weight: number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

const getIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('interview')) return <Mic className="h-5 w-5" />;
  if (lowerName.includes('talent')) return <Music className="h-5 w-5" />;
  if (lowerName.includes('gown') || lowerName.includes('dress')) return <Shirt className="h-5 w-5" />;
  if (lowerName.includes('question')) return <MessageSquare className="h-5 w-5" />;
  return <div className="h-5 w-5 bg-gray-300 rounded-full" />;
};

export default function ScoringCriteria({ 
  criteria, 
  onUpdate, 
  onDelete, 
  onAdd,
  isLoading = false
}: ScoringCriteriaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Criteria Configuration</CardTitle>
        <p className="text-gray-600">Define and customize scoring categories with weighted calculations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-primary">
                  {getIcon(criterion.name)}
                  <span className="font-medium">{criterion.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-gray-600">Weight:</Label>
                  <Input
                    type="number"
                    value={criterion.weight}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-20 text-center"
                    onChange={(e) => {
                      const weight = parseFloat(e.target.value) || 0;
                      onUpdate(criterion.id, weight);
                    }}
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" disabled={isLoading}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onDelete(criterion.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add New Criteria */}
        <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="flex items-center justify-center">
            <Button 
              variant="ghost" 
              onClick={onAdd}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Criteria
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
