'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, Sprout, Droplets, Scissors, Package, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const calendarEvents = [
  // ============ MAIZE EVENTS ============
  {
    id: 1,
    date: '2025-01-15',
    crop: 'Maize',
    event: 'Begin Land Preparation (Long Rains)',
    type: 'preparation',
    details: 'Clear land, plough 2-3 weeks before planting. Remove weeds and crop residue.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  },
  {
    id: 2,
    date: '2025-03-25',
    crop: 'Maize',
    event: 'Planting Season Begins (Long Rains)',
    type: 'planting',
    details: 'Plant within 2 weeks after onset of rains. 75cm between rows, 25-30cm between plants. Apply DAP fertilizer at 50kg/acre.',
    completed: false,
    priority: 'critical',
    season: 'long-rains'
  },
  {
    id: 3,
    date: '2025-04-15',
    crop: 'Maize',
    event: 'First Weeding & Pest Scouting',
    type: 'maintenance',
    details: 'First weeding 2-3 weeks after germination. Scout for Fall Armyworm and Stem Borers.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  },
  {
    id: 4,
    date: '2025-05-10',
    crop: 'Maize',
    event: 'Top Dressing & Second Weeding',
    type: 'maintenance',
    details: 'Apply CAN fertilizer at 92kg/acre when maize is knee-high. Second weeding before tasseling.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  },
  {
    id: 5,
    date: '2025-08-15',
    crop: 'Maize',
    event: 'Harvest Ready',
    type: 'harvest',
    details: 'Harvest when husks are dry and grains are hard. Dry to below 13% moisture before storage.',
    completed: false,
    priority: 'critical',
    season: 'long-rains'
  },
  
  // ============ BEANS EVENTS ============
  {
    id: 6,
    date: '2025-03-15',
    crop: 'Beans',
    event: 'Land Preparation',
    type: 'preparation',
    details: 'Prepare seedbeds for planting. Incorporate manure if available.',
    completed: false,
    priority: 'medium',
    season: 'long-rains'
  },
  {
    id: 7,
    date: '2025-04-01',
    crop: 'Beans',
    event: 'Planting Window Opens',
    type: 'planting',
    details: 'Plant with onset of rains. 50cm between rows, 15cm between plants. Plant 2 seeds per hole.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  },
  {
    id: 8,
    date: '2025-04-25',
    crop: 'Beans',
    event: 'First Weeding',
    type: 'maintenance',
    details: 'Remove weeds carefully. Watch for aphids and bean fly.',
    completed: false,
    priority: 'medium',
    season: 'long-rains'
  },
  {
    id: 9,
    date: '2025-07-01',
    crop: 'Beans',
    event: 'Harvest Period',
    type: 'harvest',
    details: 'Harvest when pods are dry and rattle. Dry thoroughly before shelling.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  },
  
  // ============ WHEAT EVENTS ============
  {
    id: 10,
    date: '2025-03-01',
    crop: 'Wheat',
    event: 'Early Land Prep (Duma/Ngamia Varieties)',
    type: 'preparation',
    details: 'Prepare land for early planting. Use certified disease-free seed.',
    completed: false,
    priority: 'medium',
    season: 'long-rains'
  },
  {
    id: 11,
    date: '2025-03-20',
    crop: 'Wheat',
    event: 'Planting at Onset of Rains',
    type: 'planting',
    details: 'Plant with planter (1 bag/acre) or broadcast (1.5 bags/acre). Apply 50kg DAP/acre.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  },
  {
    id: 12,
    date: '2025-04-25',
    crop: 'Wheat',
    event: 'Herbicide Application',
    type: 'maintenance',
    details: 'Apply Buctril MC when crop has 4-6 leaves. Watch for Russian wheat aphid.',
    completed: false,
    priority: 'medium',
    season: 'long-rains'
  },
  {
    id: 13,
    date: '2025-07-15',
    crop: 'Wheat',
    event: 'Harvest Ready (Duma/Ngamia)',
    type: 'harvest',
    details: 'Early maturing varieties ready for harvest. Duma yields up to 9 bags per acre.',
    completed: false,
    priority: 'high',
    season: 'long-rains'
  }
];

type EventType = 'planting' | 'maintenance' | 'harvest' | 'preparation';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type Season = 'long-rains' | 'short-rains' | 'dry';

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'planting':
      return <Sprout className="w-5 h-5" />;
    case 'harvest':
      return <Package className="w-5 h-5" />;
    case 'maintenance':
      return <Scissors className="w-5 h-5" />;
    case 'preparation':
      return <Droplets className="w-5 h-5" />;
    default:
      return <Calendar className="w-5 h-5" />;
  }
};

const getEventColor = (type: EventType, priority: Priority) => {
  if (priority === 'critical') return 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-800';
  if (priority === 'high') return 'bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
  
  switch (type) {
    case 'planting':
      return 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    case 'harvest':
      return 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
    case 'maintenance':
      return 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    case 'preparation':
      return 'bg-purple-100 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'critical':
      return <Badge variant="destructive" className="text-xs">Critical</Badge>;
    case 'high':
      return <Badge variant="default" className="bg-orange-500 text-xs">High</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    case 'low':
      return <Badge variant="outline" className="text-xs">Low</Badge>;
  }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [events, setEvents] = useState(calendarEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [formData, setFormData] = useState({
    date: '',
    crop: '',
    event: '',
    type: 'maintenance' as EventType,
    priority: 'medium' as Priority,
    details: '',
  });

  // Get unique crops for filter
  const uniqueCrops = useMemo(() => {
    const crops = events.map(e => e.crop);
    return ['all', ...new Set(crops)];
  }, [events]);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventMonth = new Date(event.date).getMonth();
      const eventYear = new Date(event.date).getFullYear();
      const monthMatch = eventMonth === currentMonth && eventYear === currentYear;
      const cropMatch = filterCrop === 'all' || event.crop === filterCrop;
      const typeMatch = filterType === 'all' || event.type === filterType;
      return monthMatch && cropMatch && typeMatch;
    });
  }, [events, currentMonth, currentYear, filterCrop, filterType]);

  // Group events by week
  const weeks = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const weeks: (typeof events)[] = [];
    let week: typeof events = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = filteredEvents.filter(e => 
        new Date(e.date).getDate() === day
      );
      
      if (dayEvents.length > 0) {
        week.push(...dayEvents);
      }
      
      // Group by week (every 7 days)
      if (day % 7 === 0 || day === daysInMonth) {
        if (week.length > 0) {
          weeks.push(week);
          week = [];
        }
      }
    }
    
    return weeks;
  }, [filteredEvents, currentMonth, currentYear]);

  const handleAddEvent = () => {
    if (formData.date && formData.crop && formData.event) {
      const newEvent = {
        id: Math.max(...events.map((e) => e.id), 0) + 1,
        date: formData.date,
        crop: formData.crop,
        event: formData.event,
        type: formData.type,
        details: formData.details,
        completed: false,
        priority: formData.priority,
        season: new Date(formData.date).getMonth() < 6 ? 'long-rains' : 'short-rains',
      };
      setEvents([...events, newEvent]);
      setFormData({
        date: '',
        crop: '',
        event: '',
        type: 'maintenance',
        priority: 'medium',
        details: '',
      });
      setIsModalOpen(false);
    }
  };

  const toggleEventComplete = (eventId: number) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, completed: !event.completed }
        : event
    ));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setExpandedEvent(null);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Header */}
        <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-6 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">Crop Calendar</h1>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {months[currentMonth]} {currentYear}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-4 space-y-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-background text-sm"
                >
                  {uniqueCrops.map(crop => (
                    <option key={crop} value={crop}>
                      {crop === 'all' ? 'All Crops' : crop}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
                  className="px-3 py-2 rounded-lg border bg-background text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="planting">Planting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="harvest">Harvest</option>
                  <option value="preparation">Preparation</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="px-4 py-2 space-y-4 pb-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
              <CardContent className="p-3 text-center">
                <Sprout className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-muted-foreground">Planting</p>
                <p className="text-lg font-bold">{filteredEvents.filter(e => e.type === 'planting').length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
              <CardContent className="p-3 text-center">
                <Scissors className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-muted-foreground">Maintenance</p>
                <p className="text-lg font-bold">{filteredEvents.filter(e => e.type === 'maintenance').length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
              <CardContent className="p-3 text-center">
                <Package className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-xs text-muted-foreground">Harvest</p>
                <p className="text-lg font-bold">{filteredEvents.filter(e => e.type === 'harvest').length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
              <CardContent className="p-3 text-center">
                <Droplets className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-muted-foreground">Prep</p>
                <p className="text-lg font-bold">{filteredEvents.filter(e => e.type === 'preparation').length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Events by Week */}
          {weeks.length === 0 ? (
            <Card className="border-0 shadow-sm bg-muted/50">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No events scheduled for this month</p>
                <Button 
                  variant="link" 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2"
                >
                  Add your first event
                </Button>
              </CardContent>
            </Card>
          ) : (
            weeks.map((weekEvents, weekIndex) => (
              <div key={weekIndex} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-1">
                  Week {weekIndex + 1}
                </h3>
                {weekEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={cn(
                      "border-2 cursor-pointer hover:shadow-md transition-all",
                      getEventColor(event.type as EventType, event.priority as Priority),
                      event.completed && "opacity-60"
                    )}
                    onClick={() =>
                      setExpandedEvent(expandedEvent === event.id ? null : event.id)
                    }
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-background rounded-lg shadow-sm">
                          {getEventIcon(event.type as EventType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <CardTitle className="text-sm font-semibold line-clamp-1">
                              {event.event}
                            </CardTitle>
                            <div className="flex items-center gap-2 shrink-0">
                              {getPriorityBadge(event.priority as Priority)}
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {event.crop}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEventComplete(event.id);
                          }}
                        >
                          {event.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {expandedEvent === event.id && (
                      <CardContent className="p-4 pt-2 border-t border-border/50">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-2 p-2 bg-background/50 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-muted-foreground">{event.details}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-background/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Crop</p>
                              <p className="font-medium">{event.crop}</p>
                            </div>
                            <div className="p-2 bg-background/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Date</p>
                              <p className="font-medium">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle add reminder
                              }}
                            >
                              <Clock className="w-3 h-3 mr-2" />
                              Remind
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Create Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-background w-full rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-background pt-2">
                <h2 className="text-lg font-bold">Create New Event</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Date Input */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full"
                  />
                </div>

                {/* Crop Input */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
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
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
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

                {/* Event Details Input */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Details (Optional)
                  </label>
                  <textarea
                    placeholder="Add more details about this event..."
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border bg-background min-h-[100px] text-sm"
                  />
                </div>

                {/* Event Type Selection */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['planting', 'maintenance', 'harvest', 'preparation'] as EventType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type })}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-center font-medium capitalize",
                          formData.type === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-accent'
                        )}
                      >
                        <span className="block mb-1">
                          {getEventIcon(type)}
                        </span>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['critical', 'high', 'medium'] as Priority[]).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setFormData({ ...formData, priority })}
                        className={cn(
                          "p-2 rounded-lg border-2 transition-all text-center font-medium capitalize",
                          formData.priority === priority
                            ? priority === 'critical'
                              ? 'border-destructive bg-destructive/10 text-destructive'
                              : priority === 'high'
                              ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                              : 'border-yellow-500 bg-yellow-500/10 text-yellow-600'
                            : 'border-border text-muted-foreground hover:bg-accent'
                        )}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-4">
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
    </MainLayout>
  );
}