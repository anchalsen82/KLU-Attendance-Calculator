import { AcademicCalendar, CollegeNotification } from '../types/attendance';

const API_BASE = '/api';

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// Local storage key for persistent admin session token on the client
const ADMIN_TOKEN_KEY = 'kare_admin_auth_token';

export const apiService = {
  // Check if admin is currently authenticated in this browser
  isAdminAuthenticated(): boolean {
    return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
  },

  setAdminToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearAdminToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  async loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setAdminToken(data.token);
      }
      return data;
    } catch (err) {
      console.warn('Backend login request error:', err);
      return { success: false, error: 'Unable to connect to authentication server. Please check your connection.' };
    }
  },

  async loginAdminWithGoogle(email: string): Promise<AdminLoginResponse> {
    try {
      const res = await fetch(`${API_BASE}/admin/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setAdminToken(data.token);
      }
      return data;
    } catch (err) {
      console.warn('Backend google login error:', err);
      return { success: false, error: 'Unable to connect to Google authentication server.' };
    }
  },

  // Calendars
  async getCalendars(): Promise<AcademicCalendar[]> {
    try {
      const res = await fetch(`${API_BASE}/calendars`);
      if (res.ok) {
        const data = await res.json();
        return data.calendars || [];
      }
    } catch (err) {
      console.warn('API getCalendars error:', err);
    }
    return [];
  },

  async createCalendar(calendar: Omit<AcademicCalendar, 'id' | 'uploadedAt'>): Promise<{ success: boolean; calendar?: AcademicCalendar; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/calendars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendar),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload calendar' };
    }
  },

  async updateCalendar(id: string, updates: Partial<AcademicCalendar>): Promise<{ success: boolean; calendar?: AcademicCalendar; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/calendars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update calendar' };
    }
  },

  async deleteCalendar(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/calendars/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete calendar' };
    }
  },

  // Notifications
  async getNotifications(): Promise<CollegeNotification[]> {
    try {
      const res = await fetch(`${API_BASE}/notifications`);
      if (res.ok) {
        const data = await res.json();
        return data.notifications || [];
      }
    } catch (err) {
      console.warn('API getNotifications error:', err);
    }
    return [];
  },

  async createNotification(notification: Omit<CollegeNotification, 'id' | 'uploadedAt'>): Promise<{ success: boolean; notification?: CollegeNotification; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to publish notification' };
    }
  },

  async updateNotification(id: string, updates: Partial<CollegeNotification>): Promise<{ success: boolean; notification?: CollegeNotification; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update notification' };
    }
  },

  async deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete notification' };
    }
  },

  // AI Attendance Advisor
  async askAiAdvisor(
    message: string,
    attendanceContext: any
  ): Promise<{ success: boolean; reply: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ai/attendance-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, attendanceContext }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('askAiAdvisor API request failed:', err);
    }
    // Client-side fallback if server unreachable
    return {
      success: true,
      reply: `🎓 **Academic Advisory Notice:** You currently have **${attendanceContext?.overallPercentage ?? 0}%** overall attendance. ${
        (attendanceContext?.overallPercentage ?? 0) >= (attendanceContext?.targetPercentage ?? 75)
          ? `You have **${attendanceContext?.safeBunks ?? 0} safe bunks** available before reaching ${attendanceContext?.targetPercentage ?? 75}%.`
          : `You need to attend **${attendanceContext?.recoveryNeeded ?? 0} consecutive classes** to restore your eligibility.`
      }`,
    };
  },
};
