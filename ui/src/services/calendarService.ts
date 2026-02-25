// services/calendarService.ts
import type { CalendarEvent } from '@/hooks/useIndexedDB';

export const defaultCalendarEvents: Omit<CalendarEvent, 'id'>[] = [
  // ============ MAIZE EVENTS ============
  {
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

// Helper functions for calendar operations
export const calendarHelpers = {
  // Get upcoming events (next 7 days)
  getUpcomingEvents: (events: CalendarEvent[]): CalendarEvent[] => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek && !event.completed;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Get overdue events
  getOverdueEvents: (events: CalendarEvent[]): CalendarEvent[] => {
    const today = new Date();
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate < today && !event.completed;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Get events by season
  getEventsBySeason: (events: CalendarEvent[], season: string): CalendarEvent[] => {
    return events.filter(event => event.season === season);
  },

  // Get statistics
  getStats: (events: CalendarEvent[]) => {
    const total = events.length;
    const completed = events.filter(e => e.completed).length;
    const pending = total - completed;
    const overdue = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate < new Date() && !e.completed;
    }).length;
    const upcoming = events.filter(e => {
      const eventDate = new Date(e.date);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return eventDate > new Date() && eventDate <= nextWeek && !e.completed;
    }).length;

    return {
      total,
      completed,
      pending,
      overdue,
      upcoming,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  },

  // Group events by month
  groupByMonth: (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    });
    
    return grouped;
  },

  // Group events by crop
  groupByCrop: (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      if (!grouped[event.crop]) {
        grouped[event.crop] = [];
      }
      grouped[event.crop].push(event);
    });
    
    return grouped;
  }
};