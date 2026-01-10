import { Book } from "@/types/models";

export type TierKey = "S" | "A" | "B" | "C" | "D" | "F";

export type TierState = Record<TierKey, string[]> & {
  UNRATED: string[];
};

export type ReadingRow = {
  id: string;
  book_id: string;
  year: number;
  start_month: number;
  end_month: number;
  notes?: string | null;
};

export type RatingRow = {
  reading_id: string;
  tier: TierKey;
  position: number;
};
