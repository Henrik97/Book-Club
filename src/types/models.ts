import { MonthNumber } from "./months";

export type ISOTimestamp = string;

export type Book = {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  image_path?: string | null;
  image_url?: string | null;
  physical_book_link?: string | null;
  audio_book_link?: string | null;
  created_at?: string;
};

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

export type Plan = Record<MonthNumber, string[]>;
