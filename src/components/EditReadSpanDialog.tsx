import { ReadingsDraft } from "@/app/readingplan/[year]/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCoverUrl } from "@/helpers/coverUrl";
import { Book } from "@/types/models";
import { MONTH_LABELS } from "@/types/months";
import { useEffect, useState } from "react";
import BookCoverImage from "./BookCoverImage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reading: ReadingsDraft;
  book?: Book;
  handleSave: (endMonth: number) => void;
};

export default function EditReadSpanDialog({
  open,
  onOpenChange,
  reading,
  book,
  handleSave,
}: Props) {
  const [endMonth, setEndMonth] = useState<number>(reading.endMonth);
  useEffect(() => {
    setEndMonth(reading.endMonth);
  }, [reading.id, reading.endMonth]);

  if (!book) return <div>something went wrong</div>;

  const coverUrl =
    book.image_url ||
    (book.image_path
      ? getCoverUrl(book.image_path)
      : "/no_cover_available.png");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Change Period</DialogTitle>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <BookCoverImage coverUrl={coverUrl} title={book.title} />
            </div>

            <div className="flex-1 space-y-3">
              <p className="font-semibold">{book.title}</p>

              <div>
                <Label>Start month</Label>
                <p className="text-sm text-muted-foreground">
                  {MONTH_LABELS[reading.startMonth]}
                </p>
              </div>

              <div>
                <Label>End month</Label>
                <Select onValueChange={(value) => setEndMonth(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MONTH_LABELS)
                      .filter(([m]) => Number(m) >= reading.startMonth)
                      .map(([m, label]) => (
                        <SelectItem key={m} value={m}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSave(endMonth)}>Save</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
