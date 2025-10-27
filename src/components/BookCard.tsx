import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
interface Props {
  title: string;
  author: string;
  imageUrl: string;
  onClick: () => void;
}
export default function BookCard({ title, author, imageUrl, onClick }: Props) {
  return (
    <Card onClick={onClick}>
      <CardHeader>
        <div className="relative w-full h-56 mb-2">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{author}</CardDescription>
      </CardHeader>
    </Card>
  );
}
