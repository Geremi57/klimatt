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
      id: 'fall-armyworm',
      name: 'Fall Armyworm',
      localName: 'Mbonje ya Maziwa',
      scientificName: 'Spodoptera frugiperda',
      symptoms: ['Holes in Leaves', 'Sawdust-like frass on leaves', 'Window-pane damage on young leaves', 'Cob damage'],
      quickTreatment: 'Use Tithonia diversifolia botanical extract (equal to synthetic insecticides). Integrate with Brachiaria trap crops (Xaraes variety) in push-pull systems. Consider host-resistant maize accession MA4.',
      confidence: 'High',
      icon: '🐛',
      source: 'AJOL Research 2025 [citation:2]'
    },
    {
      id: 'armyworm',
      name: 'African Armyworm',
      localName: 'Mbonje',
      scientificName: 'Spodoptera exempta',
      symptoms: ['Holes in Leaves', 'Defoliation', 'Stripped leaves', 'Caterpillars marching in groups'],
      quickTreatment: 'Use spinosad-based insecticides. Spray early morning or evening. Monitor after heavy rains as outbreaks often follow rainfall.',
      confidence: 'High',
      icon: '🐛'
    },
    {
      id: 'maize-stalk-borer',
      name: 'Maize Stalk Borer',
      localName: 'Mzunguko',
      scientificName: 'Busseola fusca',
      symptoms: ['Stem Damage', 'Dead heart (central shoot dies)', 'Wilting', 'Frass (sawdust) around entry holes', 'Broken tassels'],
      quickTreatment: 'Use granular insecticides at planting. Remove and destroy affected stems. Practice crop rotation with non-cereals.',
      confidence: 'High',
      icon: '🪲',
      source: 'AAK Grow [citation:1]'
    }
  ],
  
  beans: [
    {
      id: 'bean-stem-maggot',
      name: 'Bean Stem Maggot',
      localName: 'Mabuu ya Maharagwe',
      scientificName: 'Ophiomyia spp.',
      symptoms: ['Wilting plants', 'Mining tracks on leaves', 'Lower stems dry, swollen and cracked', 'Death of young plants', 'Blocked movement of water and nutrients'],
      quickTreatment: 'Plant early before rains start. Apply one handful of farmyard manure per planting hole. Ridge plants with soil to help damaged plants form new roots. Treat seeds with murtano (10g per 1kg beans). Remove old bean stems after harvest.',
      confidence: 'High',
      icon: '🪰',
      source: 'KALRO via Farmbizafrica [citation:3]'
    },
    {
      id: 'bean-anthracnose',
      name: 'Bean Anthracnose',
      localName: 'Ukungu wa Maharagwe',
      scientificName: 'Colletotrichum lindemuthianum',
      symptoms: ['Brown spots on leaves', 'Black sunken cankers on pods', 'Dark lesions on stems'],
      quickTreatment: 'Use certified disease-free seeds. Apply Trichoderma spp. as biopesticide (37.5% reduction). Practice crop rotation. Remove infected plant debris.',
      confidence: 'High',
      icon: '🍂',
      source: 'FAO AGRIS [citation:9]'
    },
    {
      id: 'bean-rust',
      name: 'Bean Rust',
      localName: 'Kutu ya Maharagwe',
      scientificName: 'Uromyces appendiculatus',
      symptoms: ['Rust-colored pustules on leaves (reddish-brown)', 'Yellow halos around spots', 'Leaf drop'],
      quickTreatment: 'Apply Trichoderma spp. (67% reduction). Use plant extracts from turmeric, garlic, ginger. Ensure good air circulation.',
      confidence: 'High',
      icon: '🍂',
      source: 'FAO AGRIS [citation:9]'
    },
    {
      id: 'angular-leaf-spot',
      name: 'Angular Leaf Spot',
      localName: 'Madoa ya Majani',
      scientificName: 'Phaeoisariopsis griseola',
      symptoms: ['Angular brown/grey spots on leaves', 'Spots limited by leaf veins', 'Pod lesions'],
      quickTreatment: 'Apply Trichoderma spp. (37.5% reduction). Use disease-free seeds. Practice crop rotation.',
      confidence: 'Medium',
      icon: '🍂',
      source: 'FAO AGRIS [citation:9]'
    },
    {
      id: 'whiteflies-bean',
      name: 'Whiteflies',
      localName: 'Nzi Weupe',
      scientificName: 'Bemisia tabaci',
      symptoms: ['Sticky leaves (honeydew)', 'Yellowing', 'Sooty mold', 'Stunted growth'],
      quickTreatment: 'Apply plant extracts from turmeric, garlic, ginger, lemon (up to 58% reduction). Use yellow sticky traps.',
      confidence: 'High',
      icon: '🦋',
      source: 'FAO AGRIS [citation:9]'
    },
    {
      id: 'thrips-bean',
      name: 'Thrips',
      localName: 'Thiripsi',
      scientificName: 'Thysanoptera',
      symptoms: ['Silvery leaves', 'Deformed leaves', 'Discolored pods'],
      quickTreatment: 'Apply plant extracts (41% reduction). Use blue sticky traps. Introduce predatory mites.',
      confidence: 'High',
      icon: '🐞',
      source: 'FAO AGRIS [citation:9]'
    }
  ],
  
  wheat: [
    {
      id: 'wheat-leaf-rust',
      name: 'Wheat Leaf Rust',
      localName: 'Kutu ya Ngano',
      scientificName: 'Puccinia triticina',
      symptoms: ['Brown spots on leaf surface', 'Brown spots on stem', 'Head smut/bleached head', 'Cream-white heads instead of maturing brown'],
      quickTreatment: 'PREVENTION: Spray at tillering, beginning of booting, and mid-head formation. CONTROL: Use triazole fungicides like Tebuconazole (Folicur, Orius, Dokta Cure) or Flutriafol (curative and preventive). Add adjuvants (ionic spreaders or organosilicon) when spraying during rainy season. Cost: KES 7,000-12,000 per hectare.',
      confidence: 'High',
      icon: '🍂',
      source: 'Farmbizafrica [citation:4]'
    },
    {
      id: 'hessian-fly',
      name: 'Hessian Fly',
      localName: 'Nzi ya Majalibu',
      scientificName: 'Mayetiola destructor',
      symptoms: ['Yellow Leaves', 'Wilting', 'Stunted Growth', 'Dark larvae at base of plants'],
      quickTreatment: 'Use resistant varieties. Apply insecticides if infestation is severe. Practice delayed planting.',
      confidence: 'Medium',
      icon: '🪰'
    },
    {
      id: 'quelea-birds',
      name: 'Quelea Birds',
      localName: 'Ndege Quelea',
      scientificName: 'Quelea quelea',
      symptoms: ['Entire grain heads stripped', 'Flocks of small birds in fields', 'Significant grain loss'],
      quickTreatment: 'Government conducts aerial spraying of bird repellents. A single bird consumes 10g grain daily; a flock of 2 million can devour 20 tons/day. New drone technology being deployed for targeted repellent application.',
      confidence: 'High',
      icon: '🐦',
      source: 'FAO via CapitalFM [citation:10]'
    }
  ],
  
  tomato: [
    {
      id: 'tomato-leaf-miner',
      name: 'Tomato Leaf Miner (Tuta absoluta)',
      localName: 'Tuta',
      scientificName: 'Tuta absoluta',
      symptoms: ['Mines/tunnels in leaves', 'Larvae inside leaves', 'Brown spots', 'Fruit damage'],
      quickTreatment: 'Use integrated pest management. Silicon application (100-200 mg/L) as basal or foliar spray significantly reduces pest populations. Practice crop rotation.',
      confidence: 'High',
      icon: '🐛',
      source: 'AAK Grow [citation:1] & Kenyatta University [citation:5]'
    },
    {
      id: 'tomato-hornworm',
      name: 'Tomato Hornworm',
      localName: 'Mbeji Mkubwa',
      scientificName: 'Manduca quinquemaculata',
      symptoms: ['Holes in Leaves', 'Defoliation', 'Large green caterpillars with horn'],
      quickTreatment: 'Hand-pick larvae. Use Bt spray for severe infestations. Silicon application at 100mg/L helps manage pests.',
      confidence: 'High',
      icon: '🐛'
    },
    {
      id: 'late-blight',
      name: 'Late Blight',
      localName: 'Magonjwa ya Tomato',
      scientificName: 'Phytophthora infestans',
      symptoms: ['Brown spots on leaves and stems', 'White powder on leaf undersides', 'Wilting', 'Fruit rot'],
      quickTreatment: 'Remove affected leaves. Apply copper fungicide weekly. Silicon application (100mg/L basal) helps manage pathogens effectively.',
      confidence: 'High',
      icon: '🍂',
      source: 'Kenyatta University [citation:5]'
    },
    {
      id: 'thrips-tomato',
      name: 'Thrips',
      localName: 'Thiripsi',
      scientificName: 'Thysanoptera',
      symptoms: ['Silvery leaves', 'Deformed growth', 'Dark specks (excrement)'],
      quickTreatment: 'Silicon fertilization (100-200mg/L) controls thrips populations effectively. Use blue sticky traps.',
      confidence: 'Medium',
      icon: '🐞',
      source: 'Kenyatta University [citation:5]'
    }
  ],
  
  cabbage: [
    {
      id: 'diamondback-moth',
      name: 'Diamondback Moth',
      localName: 'Nondo wa Kabichi',
      scientificName: 'Plutella xylostella',
      symptoms: ['Holes in leaves', 'Damaged leaves', 'Live larvae on plants', 'Skeletonized leaves'],
      quickTreatment: 'Use biopesticides: Beauveria bassiana (BioPower 100g/20L), Bacillus thuringiensis (Dipel DF 20g/20L), or Neem (Neemraj Super 3000 20mL/20L). Inter-crop with tomatoes (one row of tomato for every two rows of cabbage). All treatments significantly reduce leaf damage.',
      confidence: 'High',
      icon: '🦋',
      source: 'Tanzania Journal of Science [citation:6]'
    }
  ],
  
  potato: [
    {
      id: 'potato-cyst-nematode',
      name: 'Potato Cyst Nematode',
      localName: 'Nematodi ya Viazi',
      scientificName: 'Globodera rostochiensis, G. pallida',
      symptoms: ['Leaf discoloration/yellowing', 'Wilting', 'Root with cysts', 'Uneven tuber sizes', 'Reduced number of roots', 'Dwarfing of plants', 'Reduced number of crops'],
      quickTreatment: 'Use nematicides: NEMATHORIN® 150EC, Adventure® 0.5% GR, Alonze® 50EC, Farmchance® 250 EC. Cover planting seeds with banana paper laced with minimal pesticides. Intercrop with Marigold flowers (acts as alternative host but produces natural nematicides). PCN causes up to 80% yield loss and can lie dormant for 20 years. Found in 71.8% of potato-growing counties, with Nyandarua at 47.6% incidence.',
      confidence: 'High',
      icon: '🪱',
      source: 'KEPHIS via Farmbizafrica [citation:7]'
    }
  ]
  }

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
