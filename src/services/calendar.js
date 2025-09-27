const axios = require('axios');

class CalendarService {
  constructor() {
    this.clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    this.accessToken = null;
    this.refreshToken = null;
    this.cachedEvents = null;
    this.lastFetch = null;
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  // For simplicity, this uses a mock calendar. In production, you'd implement OAuth flow
  async getTodaysEvents() {
    if (this.cachedEvents && this.lastFetch &&
        (Date.now() - this.lastFetch) < this.cacheTimeout) {
      return this.cachedEvents;
    }

    try {
      // Mock events for demonstration - replace with actual Google Calendar API call
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.cachedEvents = {
        today: this.getMockEvents(today),
        tomorrow: this.getMockEvents(tomorrow)
      };

      this.lastFetch = Date.now();
      return this.cachedEvents;
    } catch (error) {
      console.error('Calendar API error:', error.message);
      return this.cachedEvents || {
        today: [],
        tomorrow: []
      };
    }
  }

  getMockEvents(date) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return [
        {
          title: 'Weekend Relaxation',
          time: '10:00 AM',
          duration: '2 hours',
          type: 'personal'
        },
        {
          title: 'Family Time',
          time: '2:00 PM',
          duration: '3 hours',
          type: 'family'
        }
      ];
    }

    return [
      {
        title: 'Morning Standup',
        time: '9:00 AM',
        duration: '30 min',
        type: 'work'
      },
      {
        title: 'Project Review',
        time: '11:00 AM',
        duration: '1 hour',
        type: 'work'
      },
      {
        title: 'Lunch Break',
        time: '12:00 PM',
        duration: '1 hour',
        type: 'personal'
      },
      {
        title: 'Team Meeting',
        time: '2:00 PM',
        duration: '2 hours',
        type: 'work'
      }
    ];
  }

  // This would be used for actual Google Calendar integration
  async authenticateWithGoogle() {
    // OAuth flow implementation would go here
    // For now, return mock authentication
    return {
      authenticated: false,
      authUrl: `https://accounts.google.com/oauth2/auth?client_id=${this.clientId}&redirect_uri=http://localhost:3000/auth/callback&scope=https://www.googleapis.com/auth/calendar.readonly&response_type=code`
    };
  }

  formatEventTime(dateTime) {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

module.exports = CalendarService;