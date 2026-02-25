import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, X } from 'lucide-react';
import { useState } from 'react';

const diaryEntries = [
  {
    id: 1,
    date: 'March 20, 2024',
    crop: 'Maize',
    title: 'Germination Check',
    content:
      'Checked maize seedlings. 95% germination rate. Looks healthy, ready for transplanting in 2 weeks.',
    weather: 'Sunny, 28°C',
  },
  {
    id: 2,
    date: 'March 15, 2024',
    crop: 'Wheat',
    title: 'Fertilizer Applied',
    content:
      'Applied nitrogen fertilizer to wheat field. Weather was favorable with light rain overnight.',
    weather: 'Cloudy, 22°C',
  },
  {
    id: 3,
    date: 'March 10, 2024',
    crop: 'Beans',
    title: 'Pest Alert',
    content:
      'Found armyworm in bean field. Applied insecticide. Will monitor closely for next week.',
    weather: 'Rainy, 20°C',
  },
];

export default function DiaryPage() {
  const [entries, setEntries] = useState(diaryEntries);
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    crop: '',
    title: '',
    content: '',
    weather: '',
  });

  const handleAddEntry = () => {
    if (formData.date && formData.crop && formData.title && formData.content) {
      const newEntry = {
        id: Math.max(...entries.map((e) => e.id), 0) + 1,
        date: formData.date,
        crop: formData.crop,
        title: formData.title,
        content: formData.content,
        weather: formData.weather,
      };
      setEntries([newEntry, ...entries]);
      setFormData({
        date: '',
        crop: '',
        title: '',
        content: '',
        weather: '',
      });
      setIsModalOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Farm Diary</h1>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Track your farming activities
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-4">
          {/* New Entry Button */}
          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            New Entry
          </Button>

          {/* Entries List */}
          <div className="space-y-3">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    setExpandedEntry(
                      expandedEntry === entry.id ? null : entry.id,
                    )
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">
                          {entry.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span>{entry.date}</span>
                          <span>•</span>
                          <span>{entry.crop}</span>
                        </div>
                      </div>
                      <span className="text-2xl ml-2">📝</span>
                    </div>
                  </CardHeader>
                  {expandedEntry === entry.id && (
                    <CardContent className="pt-0 border-t border-border">
                      <div className="space-y-3 mt-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            ENTRY
                          </p>
                          <p className="text-sm leading-relaxed">
                            {entry.content}
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            WEATHER
                          </p>
                          <p className="text-sm">{entry.weather}</p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="text-5xl">📝</div>
                <p className="text-muted-foreground">No diary entries yet</p>
                <p className="text-xs text-muted-foreground">
                  Start documenting your farming activities
                </p>
              </div>
            )}
          </div>

          {/* Create Entry Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-end z-50">
              <div className="bg-background w-full rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">New Diary Entry</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Date Input */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Date
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., March 20, 2024"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Crop Input */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Crop
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Maize, Wheat, Beans"
                      value={formData.crop}
                      onChange={(e) =>
                        setFormData({ ...formData, crop: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Title
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Germination Check, Fertilizer Applied"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Entry Description
                    </label>
                    <textarea
                      placeholder="Write your diary entry here..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full bg-input border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-32 resize-none"
                    />
                  </div>

                  {/* Weather Input */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Weather (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Sunny, 28°C"
                      value={formData.weather}
                      onChange={(e) =>
                        setFormData({ ...formData, weather: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddEntry}
                      disabled={
                        !formData.date ||
                        !formData.crop ||
                        !formData.title ||
                        !formData.content
                      }
                      className="flex-1"
                    >
                      Save Entry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
