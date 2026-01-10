import Image from "next/image";

type props = {
  coverUrl: string;
  title: string;
};

export default function BookCoverImage({ coverUrl, title }: props) {
  return (
    <div className={"relative w-40 h-60 p-0"}>
      <Image src={coverUrl} fill alt={title} className="rounded" />
    </div>
  );
}
