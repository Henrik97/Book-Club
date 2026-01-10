import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "./ui/empty";

export default function MissingBookCover() {
  return (
    <Empty className="border border-dashed" style={{ padding: 2, margin: 12 }}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Upload />
        </EmptyMedia>
        <EmptyTitle>No Book Cover Uploaded</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm">
          Upload Image
        </Button>
      </EmptyContent>
    </Empty>
  );
}
