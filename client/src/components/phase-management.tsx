import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Trophy, RotateCcw, FastForward } from "lucide-react";
import type { Phase } from "@shared/schema";

interface PhaseManagementProps {
  phases: Phase[];
  onAdvance: () => void;
  onReset: () => void;
  onUpdatePhase: (id: string, updates: Partial<Phase>) => void;
  isLoading?: boolean;
}

export default function PhaseManagement({ 
  phases, 
  onAdvance, 
  onReset, 
  onUpdatePhase,
  isLoading = false
}: PhaseManagementProps) {
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <Trophy className="h-5 w-5 text-accent" />;
      default:
        return <Pause className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competition Phases</CardTitle>
        <p className="text-gray-600">Configure multi-phase competitions with score reset capabilities</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.id} className={`flex items-center justify-between p-4 rounded-lg ${
              phase.status === 'active' ? 'bg-primary/5 border border-primary/10' : 'bg-gray-50'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getPhaseIcon(phase.status)}
                  <span className="font-medium">{phase.name}</span>
                </div>
                <Badge variant={phase.status === 'active' ? 'default' : 'secondary'}>
                  {phase.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={phase.resetScores}
                    onChange={(e) => onUpdatePhase(phase.id, { resetScores: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary/20"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-600">Reset scores after phase</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        
        {/* Phase Actions */}
        <div className="mt-6 flex space-x-4">
          <Button 
            onClick={onAdvance}
            disabled={isLoading}
          >
            <FastForward className="h-4 w-4 mr-2" />
            Advance to Next Phase
          </Button>
          <Button 
            variant="outline"
            onClick={onReset}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Current Phase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
