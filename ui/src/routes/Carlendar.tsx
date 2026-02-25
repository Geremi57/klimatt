'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, X } from 'lucide-react';
import { useState } from 'react';

const calendarEvents = [
  {
    id: 1,
    date: 'March 5',
    crop: 'Maize',
    event: 'Planting Season Begins',
    type: 'planting',
  },
  {
    id: 2,
    date: 'March 15',
    crop: 'Wheat',
    event: 'Fertilizer Application',
    type: 'maintenance',
  },
  {
    id: 3,
    date: 'March 28',
    crop: 'Beans',
    event: 'Expected Harvest',
    type: 'harvest',
  },
  {
    id: 4,
    date: 'April 10',
    crop: 'Tomato',
    event: 'Transplanting',
    type: 'planting',
  },
  {
    id: 5,
    date: 'April 22',
    crop: 'Maize',
    event: 'First Weeding',
    type: 'maintenance',
  },
  {
    id: 6,
    date: 'May 15',
    crop: 'Cabbage',
    event: 'Pest Control Spray',
    type: 'maintenance',
  },
];

const getEventLabel = (type: string) => {
  switch (type) {
    case 'planting':
      return '🌱';
    case 'harvest':
      return '🌾';
    case 'maintenance':
      return '🔧';
    default:
      return '📅';
  }
};

const eventTypes = ['planting', 'maintenance', 'harvest'];

export function CalendarPage() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [events, setEvents] = useState(calendarEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    crop: '',
    event: '',
    type: 'maintenance' as string,
  });

  const handleAddEvent = () => {
    if (formData.date && formData.crop && formData.event) {
      const newEvent = {
        id: Math.max(...events.map((e) => e.id), 0) + 1,
        date: formData.date,
        crop: formData.crop,
        event: formData.event,
        type: formData.type,
      };
      setEvents([...events, newEvent]);
      setFormData({
        date: '',
        crop: '',
        event: '',
        type: 'maintenance',
      });
      setIsModalOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Crop Calendar</h1>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>
          <p className="text-primary-foreground/90 text-sm">
            Upcoming farm activities
          </p>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-3">
          {/* Legend */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl mb-1">🌱</p>
                  <p className="text-xs text-muted-foreground">Planting</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">🔧</p>
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">🌾</p>
                  <p className="text-xs text-muted-foreground">Harvest</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="space-y-2">
            {events.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  setExpandedEvent(expandedEvent === event.id ? null : event.id)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getEventLabel(event.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CardTitle className="text-base">
                          {event.event}
                        </CardTitle>
                        <Badge className="text-xs">{event.date}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.crop}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                {expandedEvent === event.id && (
                  <CardContent className="pt-0 border-t border-border">
                    <div className="space-y-2 mt-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          CROP
                        </p>
                        <p className="text-sm">{event.crop}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          SCHEDULED FOR
                        </p>
                        <p className="text-sm">{event.date}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          ACTIVITY TYPE
                        </p>
                        <p className="text-sm capitalize">{event.type}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Create Event Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-end z-50">
              <div className="bg-background w-full rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Create New Event</h2>
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
                      placeholder="e.g., March 15"
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
                      Crop Name
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

                  {/* Event Description Input */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                      Event Description
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Planting Season Begins"
                      value={formData.event}
                      onChange={(e) =>
                        setFormData({ ...formData, event: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Event Type Selection */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Event Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {eventTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={`p-3 rounded-lg border-2 transition-all text-center font-medium capitalize ${
                            formData.type === type
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground'
                          }`}
                        >
                          <span className="text-xl block mb-1">
                            {getEventLabel(type)}
                          </span>
                          {type}
                        </button>
                      ))}
                    </div>
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
                      onClick={handleAddEvent}
                      disabled={
                        !formData.date || !formData.crop || !formData.event
                      }
                      className="flex-1"
                    >
                      Create Event
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
