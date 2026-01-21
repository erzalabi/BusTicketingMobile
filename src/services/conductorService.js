import api from './api';

export const conductorService = {
  getTodaySchedule: async () => {
    const response = await api.get('/conductor/today-schedule');
    return response;
  },

  getPassengerList: async (scheduleId) => {
    const response = await api.get(`/conductor/schedules/${scheduleId}/passengers`);
    return response;
  },

  scanTicket: async (ticketCode) => {
    const response = await api.post('/conductor/scan-ticket', { ticket_code: ticketCode });
    return response;
  },

  updatePassengerStatus: async (passengerId, status) => {
    const response = await api.put(`/conductor/passengers/${passengerId}/status`, { status });
    return response;
  },
};