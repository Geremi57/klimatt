import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Pest {
  id: string;
  name: string;
  localName: string;
  scientificName: string;
  symptoms: string[];
  quickTreatment: string;
  confidence: string;
  icon: string;
}

interface PestCardProps {
  pest: Pest;
  onViewDetails?: (pestId: string) => void;
}

export default function PestCard({ pest, onViewDetails }: PestCardProps) {
  const confidenceColor =
    pest.confidence === 'High'
      ? 'bg-accent/20 text-accent'
      : pest.confidence === 'Medium'
        ? 'bg-primary/20 text-primary'
        : 'bg-muted text-muted-foreground';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{pest.icon}</span>
              <div>
                <CardTitle className="text-base">{pest.name}</CardTitle>
                <p className="text-xs text-muted-foreground italic">
                  {pest.scientificName}
                </p>
              </div>
            </div>
            {pest.localName && (
              <p className="text-xs text-muted-foreground mt-1">
                Local: {pest.localName}
              </p>
            )}
          </div>
          <Badge className={confidenceColor}>{pest.confidence}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p className="text-sm">{pest.quickTreatment}</p>
          </div>
        </div>

        {pest.symptoms.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Matched symptoms:
            </p>
            <div className="flex flex-wrap gap-1">
              {pest.symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewDetails(pest.id)}
          >
            View Full Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
