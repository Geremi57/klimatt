import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSelectSymptom: (symptom: string) => void;
  disabled?: boolean;
}

const symptoms = [
  'Yellow Leaves',
  'Brown Spots',
  'Wilting',
  'Holes in Leaves',
  'Curled Leaves',
  'White Powder',
  'Stunted Growth',
  'Root Rot',
  'Stem Damage',
  'Leaf Discoloration',
  'Webbing',
  'Sticky Residue',
];

export default function SymptomSelector({
  selectedSymptoms,
  onSelectSymptom,
  disabled = false,
}: SymptomSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Symptoms</CardTitle>
          {selectedSymptoms.length > 0 && (
            <Badge variant="secondary">
              {selectedSymptoms.length} selected
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Select all visible symptoms
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {symptoms.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom);
            return (
              <Button
                key={symptom}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSelectSymptom(symptom)}
                disabled={disabled}
                className="text-xs"
              >
                {symptom}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
