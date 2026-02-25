import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CropSelectorProps {
  selectedCrop: string | null;
  onSelectCrop: (crop: string) => void;
}

const crops = [
  { id: 'maize', name: 'Maize', icon: '🌽' },
  { id: 'wheat', name: 'Wheat', icon: '🌾' },
  { id: 'beans', name: 'Beans', icon: '🫘' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'cabbage', name: 'Cabbage', icon: '🥬' },
  { id: 'potato', name: 'Potato', icon: '🥔' },
];

export default function CropSelector({
  selectedCrop,
  onSelectCrop,
}: CropSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Select Crop</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {crops.map((crop) => (
            <Button
              key={crop.id}
              variant={selectedCrop === crop.id ? 'default' : 'outline'}
              className="h-auto flex-col py-3 gap-2"
              onClick={() => onSelectCrop(crop.id)}
            >
              <span className="text-2xl">{crop.icon}</span>
              <span className="text-xs">{crop.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
