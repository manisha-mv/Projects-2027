// services/dashboardService.js
import api from '../lib/apiClient';
import {
  mockDashboardStats,
  mockTodayAppointments,
  mockActiveAdmissions,
  mockDepartments,
  mockActivities,
  mockPendingTasks,
  mockPendingLabOrders,
  mockCriticalAlerts,
  mockShiftInfo,
} from '../data/mockData';

export const dashboardService = {
  getStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res && res.success && res.data) {
        return { data: res.data, role: res.role, isLiveApi: true };
      }
    } catch (e) {
      console.warn('Dashboard stats API offline/fallback:', e.message);
    }
    return { data: null, isLiveApi: false };
  },

  getActivity: async () => {
    try {
      const res = await api.get('/dashboard/activity');
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      /* fallback */
    }
    return mockActivities;
  },

  getCensus: async () => {
    try {
      const res = await api.get('/dashboard/census');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch {
      /* fallback */
    }
    return mockShiftInfo;
  },
};

export default dashboardService;
