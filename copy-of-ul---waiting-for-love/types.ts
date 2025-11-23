export interface DateItem {
  id: string; // Format YYYY-MM-DD for uniqueness
  dateObject: Date;
  formattedDate: string; // DD/MM/YYYY
  label: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}
