export type ISOTimestamp = string;

export interface Book {
  id: string;
  title: string;
  author: string;
  image_path: string;
  description?: string | null;
  created_at: ISOTimestamp;
}

export interface Reading {
  id: string;
  book_id: string;
  year: number;
  start_date: string;
  end_date?: string | null;
  final_tier?: TierRating | null;
  avg_score?: number | null;
}

export type TierRating = "S" | "A" | "B" | "C" | "D" | "E" | "F";
