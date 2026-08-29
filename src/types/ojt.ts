import type { AttendanceRecord } from "../store/useOjtStore";

export type { AttendanceRecord };
export interface OjtSettings {
  totalRequiredDays: number;
  startDate: string;
  workingDays: string[];
}
