import { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Droplets,
  Scissors,
  Package,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  defaultCalendarEvents,
  calendarHelpers,
} from '@/services/calendarService';
// At the top of your calendar.ts, replace the IndexedDB import section with:
// At the top of your calendar.ts:
import { useIndexedDB, type CalendarEvent } from '@/hooks/useIndexedDB';

type EventType = 'planting' | 'maintenance' | 'harvest' | 'preparation';
type Priority = 'critical' | 'high' | 'medium' | 'low';

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
  if (priority === 'critical')
    return 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-800';
  if (priority === 'high')
    return 'bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';

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
      return (
        <Badge variant="destructive" className="text-xs">
          Critical
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="default" className="bg-orange-500 text-xs">
          High
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="secondary" className="text-xs">
          Medium
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="outline" className="text-xs">
          Low
        </Badge>
      );
  }
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function CalendarPage() {
  const {
    isReady,
    error: dbError,
    getEventsByMonth,
    addEvent,
    updateEvent,
    deleteEvent,
    seedInitialData,
  } = useIndexedDB();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    upcoming: 0,
    completionRate: 0,
  });

  const [formData, setFormData] = useState({
    date: '',
    crop: '',
    event: '',
    type: 'maintenance' as EventType,
    priority: 'medium' as Priority,
    details: '',
  });

  // Load events from IndexedDB
  useEffect(() => {
    const loadEvents = async () => {
      if (!isReady) return;

      setLoading(true);
      try {
        // Seed initial data if needed
        await seedInitialData(defaultCalendarEvents);

        // Get events for current month
        const monthEvents = await getEventsByMonth(currentYear, currentMonth);
        setEvents(monthEvents);

        // Update stats
        const allEvents = await getEventsByMonth(currentYear, currentMonth);
        setStats(calendarHelpers.getStats(allEvents));
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [isReady, currentMonth, currentYear, getEventsByMonth, seedInitialData]);

  // Refresh events when month changes
  useEffect(() => {
    const refreshEvents = async () => {
      if (!isReady) return;

      const monthEvents = await getEventsByMonth(currentYear, currentMonth);
      setEvents(monthEvents);
      setStats(calendarHelpers.getStats(monthEvents));
    };

    refreshEvents();
  }, [currentMonth, currentYear, getEventsByMonth, isReady]);

  // Get unique crops for filter
  const uniqueCrops = useMemo(() => {
    const crops = events.map((e) => e.crop);
    return ['all', ...new Set(crops)];
  }, [events]);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const cropMatch = filterCrop === 'all' || event.crop === filterCrop;
      const typeMatch = filterType === 'all' || event.type === filterType;
      return cropMatch && typeMatch;
    });
  }, [events, filterCrop, filterType]);

  // Group events by week
  const weeks = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const weeks: (typeof events)[] = [];
    let week: typeof events = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);

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
  }, [filteredEvents, currentYear, currentMonth]);

  const handleAddEvent = async () => {
    if (formData.date && formData.crop && formData.event) {
      try {
        const newId = await addEvent({
          date: formData.date,
          crop: formData.crop,
          event: formData.event,
          type: formData.type,
          details: formData.details,
          completed: false,
          priority: formData.priority,
          season:
            new Date(formData.date).getMonth() < 6
              ? 'long-rains'
              : 'short-rains',
        });

        console.log('✅ Event added with ID:', newId);

        // Refresh events
        const updatedEvents = await getEventsByMonth(currentYear, currentMonth);
        setEvents(updatedEvents);

        // Reset form
        setFormData({
          date: '',
          crop: '',
          event: '',
          type: 'maintenance',
          priority: 'medium',
          details: '',
        });

        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to add event:', error);
        alert('Failed to add event. Please try again.');
      }
    }
  };

  const toggleEventComplete = async (eventId: number) => {
    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      await updateEvent(eventId, { completed: !event.completed });

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, completed: !event.completed }
            : event,
        ),
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        completed: prev.completed + (event.completed ? -1 : 1),
        pending: prev.pending + (event.completed ? 1 : -1),
      }));
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);

        // Refresh events
        const updatedEvents = await getEventsByMonth(currentYear, currentMonth);
        setEvents(updatedEvents);

        if (expandedEvent === eventId) {
          setExpandedEvent(null);
        }
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your calendar...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (dbError) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">Database Error</h2>
              <p className="text-muted-foreground mb-4">{dbError}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 ">
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
        <div className="px-4 py-4 space-y-3 max-w-4xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="px-3 py-2 rounded-lg border bg-background text-sm"
                >
                  {uniqueCrops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop === 'all' ? 'All Crops' : crop}
                    </option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as EventType | 'all')
                  }
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
        <div className="px-4 py-2 space-y-4 pb-24 max-w-4xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
              <CardContent className="p-3 text-center">
                <Sprout className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-muted-foreground">Planting</p>
                <p className="text-lg font-bold">
                  {events.filter((e) => e.type === 'planting').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
              <CardContent className="p-3 text-center">
                <Scissors className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-muted-foreground">Maintenance</p>
                <p className="text-lg font-bold">
                  {events.filter((e) => e.type === 'maintenance').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
              <CardContent className="p-3 text-center">
                <Package className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-xs text-muted-foreground">Harvest</p>
                <p className="text-lg font-bold">
                  {events.filter((e) => e.type === 'harvest').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
              <CardContent className="p-3 text-center">
                <Droplets className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-muted-foreground">Prep</p>
                <p className="text-lg font-bold">
                  {events.filter((e) => e.type === 'preparation').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming & Overdue Summary */}
          {(stats.overdue > 0 || stats.upcoming > 0) && (
            <Card className="border-0 shadow-sm bg-primary/5">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  {stats.overdue > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-destructive">
                        ⚠️ {stats.overdue} overdue
                      </span>
                    </div>
                  )}
                  {stats.upcoming > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        📅 {stats.upcoming} upcoming this week
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {stats.completionRate.toFixed(0)}% complete
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events by Week */}
          {weeks.length === 0 ? (
            <Card className="border-0 shadow-sm bg-muted/50">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No events scheduled for this month
                </p>
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
                      'border-2 cursor-pointer hover:shadow-md transition-all',
                      getEventColor(
                        event.type as EventType,
                        event.priority as Priority,
                      ),
                      event.completed && 'opacity-60',
                    )}
                    onClick={() =>
                      setExpandedEvent(
                        expandedEvent === event.id ? null : event.id,
                      )
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
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                              >
                                {new Date(event.date).toLocaleDateString(
                                  'en-US',
                                  { day: 'numeric', month: 'short' },
                                )}
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
                            <p className="text-muted-foreground">
                              {event.details}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-background/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">
                                Crop
                              </p>
                              <p className="font-medium">{event.crop}</p>
                            </div>
                            <div className="p-2 bg-background/50 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">
                                Date
                              </p>
                              <p className="font-medium">
                                {new Date(event.date).toLocaleDateString(
                                  'en-US',
                                  {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  },
                                )}
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
                                // TODO: Implement edit functionality
                                alert('Edit feature coming soon!');
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                            >
                              Delete
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
          <div className="fixed inset-0 flex items-end z-50 max-w-6xl mx-auto pb-40">
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
                    {(
                      [
                        'planting',
                        'maintenance',
                        'harvest',
                        'preparation',
                      ] as EventType[]
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type })}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-center font-medium capitalize',
                          formData.type === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground',
                        )}
                      >
                        <span className="block mb-1">{getEventIcon(type)}</span>
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
                    {(['critical', 'high', 'medium'] as Priority[]).map(
                      (priority) => (
                        <button
                          key={priority}
                          onClick={() => setFormData({ ...formData, priority })}
                          className={cn(
                            'p-2 rounded-lg border-2 transition-all text-center font-medium capitalize',
                            formData.priority === priority
                              ? priority === 'critical'
                                ? 'border-destructive bg-destructive/10 text-destructive'
                                : priority === 'high'
                                  ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                                  : 'border-yellow-500 bg-yellow-500/10 text-yellow-600'
                              : 'border-border text-muted-foreground',
                          )}
                        >
                          {priority}
                        </button>
                      ),
                    )}
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
