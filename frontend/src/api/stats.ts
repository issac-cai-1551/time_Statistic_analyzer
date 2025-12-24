import apiClient from './client';
import type { TimeRecord } from './timer';

export interface DailyStats {
  date: string;
  total_seconds: number;
  total_minutes: number;
  total_hours: number;
  breakdown: Record<string, number>; // category_name -> seconds
  records: TimeRecord[];
}

export interface RangeStats {
  start_date: string;
  end_date: string;
  total_seconds: number;
  total_minutes: number;
  total_hours: number;
  breakdown: Record<string, number>;
  daily_trend: Record<string, number>; // date -> seconds
}

export const getDailyStats = async (date?: string): Promise<DailyStats> => {
  const response = await apiClient.get<DailyStats>('/stats/daily', {
    params: { date },
  });
  return response.data;
};

export const getRangeStats = async (start: string, end: string): Promise<RangeStats> => {
  const response = await apiClient.get<RangeStats>('/stats/range', {
    params: { start, end },
  });
  return response.data;
};
