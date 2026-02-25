'use client';

import MainLayout from '@/components/layout/MainLayout';
import CropSelector from '@/components/pests/CropSelector';
import PestCard from '@/components/pests/PestCard';
import SymptomSelector from '@/components/pests/SymptomSelector';
import { Button } from '@/components/ui/button';
import { AlertCircle, Zap } from 'lucide-react';
import { useState } from 'react';

// Mock pest data
const pestDatabase = {
  maize: [
    {
      id: 'armyworm',
      name: 'Armyworm',
      localName: 'Mbonje',
      scientificName: 'Spodoptera exempta',
      symptoms: ['Holes in Leaves', 'Stunted Growth', 'Stem Damage'],
      quickTreatment:
        'Use spinosad-based insecticides. Spray early morning or evening.',
      confidence: 'High',
      icon: '🐛',
    },
    {
      id: 'fall-armyworm',
      name: 'Fall Armyworm',
      localName: 'Mbonje ya Maziwa',
      scientificName: 'Spodoptera frugiperda',
      symptoms: ['Holes in Leaves', 'Wilting', 'Brown Spots'],
      quickTreatment: 'Apply pyrethroid or spinosad. Repeat every 7-10 days.',
      confidence: 'High',
      icon: '🐛',
    },
    {
      id: 'stem-borer',
      name: 'Corn Stem Borer',
      localName: 'Mzunguko',
      scientificName: 'Busseola fusca',
      symptoms: ['Stem Damage', 'Wilting', 'Stunted Growth'],
      quickTreatment:
        'Use granular insecticides at planting. Remove affected stems.',
      confidence: 'Medium',
      icon: '🪲',
    },
  ],
  wheat: [
    {
      id: 'hessian-fly',
      name: 'Hessian Fly',
      localName: 'Nzi ya Majalibu',
      scientificName: 'Mayetiola destructor',
      symptoms: ['Yellow Leaves', 'Wilting', 'Stunted Growth'],
      quickTreatment:
        'Use resistant varieties. Apply insecticides if infestation is severe.',
      confidence: 'Medium',
      icon: '🪰',
    },
    {
      id: 'wheat-rust',
      name: 'Wheat Rust',
      localName: 'Kutu ya Mahindi',
      scientificName: 'Puccinia graminis',
      symptoms: ['Brown Spots', 'Yellow Leaves', 'White Powder'],
      quickTreatment:
        'Apply sulfur dust or fungicide. Ensure good crop spacing.',
      confidence: 'High',
      icon: '🍂',
    },
  ],
  tomato: [
    {
      id: 'tomato-hornworm',
      name: 'Tomato Hornworm',
      localName: 'Mbeji Mkubwa',
      scientificName: 'Manduca quinquemaculata',
      symptoms: ['Holes in Leaves', 'Defoliation'],
      quickTreatment: 'Hand-pick larvae. Use Bt spray for severe infestations.',
      confidence: 'High',
      icon: '🐛',
    },
    {
      id: 'late-blight',
      name: 'Late Blight',
      localName: 'Magonjwa ya Tomato',
      scientificName: 'Phytophthora infestans',
      symptoms: ['Brown Spots', 'White Powder', 'Wilting'],
      quickTreatment: 'Remove affected leaves. Apply copper fungicide weekly.',
      confidence: 'High',
      icon: '🍂',
    },
  ],
};

export default function PestsPage() {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSelectSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  const handleSearch = () => {
    setHasSearched(true);
  };

  const getMatchingPests = () => {
    if (!selectedCrop || selectedSymptoms.length === 0) return [];

    const cropKey = selectedCrop as keyof typeof pestDatabase;
    const pests = pestDatabase[cropKey] || [];

    return pests
      .map((pest) => ({
        ...pest,
        matchedSymptoms: pest.symptoms.filter((s) =>
          selectedSymptoms.includes(s),
        ),
      }))
      .filter((pest) => pest.matchedSymptoms.length > 0)
      .sort((a, b) => b.matchedSymptoms.length - a.matchedSymptoms.length);
  };

  const matchingPests = hasSearched ? getMatchingPests() : [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Pest Detective</h1>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Identify crop pests by symptoms
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Crop Selector */}
          <CropSelector
            selectedCrop={selectedCrop}
            onSelectCrop={setSelectedCrop}
          />

          {/* Symptom Selector */}
          {selectedCrop && (
            <SymptomSelector
              selectedSymptoms={selectedSymptoms}
              onSelectSymptom={handleSelectSymptom}
            />
          )}

          {/* Search Button */}
          {selectedCrop && selectedSymptoms.length > 0 && (
            <Button
              className="w-full"
              size="lg"
              onClick={handleSearch}
              disabled={!selectedCrop || selectedSymptoms.length === 0}
            >
              Find Matching Pests
            </Button>
          )}

          {/* Results */}
          {hasSearched && (
            <div className="space-y-3">
              {matchingPests.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    <p className="font-medium">
                      Found {matchingPests.length} matching pest
                      {matchingPests.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {matchingPests.map((pest) => (
                    <PestCard key={pest.id} pest={pest} />
                  ))}
                </>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="text-4xl">🔍</div>
                  <p className="text-muted-foreground">
                    No pests match the selected symptoms for {selectedCrop}.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try selecting different symptoms.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!hasSearched && (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">🌾</div>
              <p className="text-muted-foreground">
                Select a crop and symptoms to identify potential pests
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
