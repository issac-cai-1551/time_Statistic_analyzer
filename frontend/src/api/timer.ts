import apiClient from './client';

export interface TimerSession {
  start_time: string;
  category_key?: string;
}

export interface TimeRecord {
  id: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  date: string;
  category_key?: string;
  category_name: string;
  category_color?: string;
  created_at: string;
}

export const getCurrentSession = async (): Promise<TimerSession | null> => {
  const response = await apiClient.get<TimerSession | null>('/current');
  return response.data;
};

export const startTimer = async (categoryKey?: string): Promise<TimerSession> => {
  const response = await apiClient.post<TimerSession>('/start', { category_key: categoryKey });
  return response.data;
};

export const updateCurrentSession = async (categoryKey: string): Promise<TimerSession> => {
  const response = await apiClient.put<TimerSession>('/current', { category_key: categoryKey });
  return response.data;
};

export const stopTimer = async (): Promise<TimeRecord> => {
  const response = await apiClient.post<TimeRecord>('/stop');
  return response.data;
};
