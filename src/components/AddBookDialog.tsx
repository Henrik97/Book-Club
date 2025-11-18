import { Dialog, DialogContent } from "./ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddBookDialog({ open }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent> test</DialogContent>
    </Dialog>
  );
}
