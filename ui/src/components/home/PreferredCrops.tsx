import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface PreferredCropsProps {
  crops: string[];
  availableCrops: string[];
  onAddCrop: (crop: string) => void;
  onRemoveCrop: (crop: string) => void;
}

export default function PreferredCrops({
  crops,
  availableCrops,
  onAddCrop,
  onRemoveCrop,
}: PreferredCropsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const remainingCrops = availableCrops.filter((crop) => !crops.includes(crop));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">🌾 Your Preferred Crops</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Done' : 'Edit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Selected Crops */}
        <div className="flex flex-wrap gap-2">
          {crops.length > 0 ? (
            crops.map((crop) => (
              <Badge
                key={crop}
                className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-pointer flex items-center gap-1 px-3 py-1"
              >
                {crop}
                {isExpanded && (
                  <button
                    onClick={() => onRemoveCrop(crop)}
                    className="ml-1 hover:text-primary/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No crops selected. Add your first crop!
            </p>
          )}
        </div>

        {/* Add More Crops */}
        {isExpanded && remainingCrops.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Add more crops:
            </p>
            <div className="flex flex-wrap gap-2">
              {remainingCrops.map((crop) => (
                <button
                  key={crop}
                  onClick={() => onAddCrop(crop)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/50 hover:bg-secondary text-sm transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {crop}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info Text */}
        {!isExpanded && (
          <p className="text-xs text-muted-foreground">
            {crops.length} crop{crops.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
