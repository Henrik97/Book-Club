import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/The_School_of_Athens.jpg"
          alt="Next.js logo"
          width={2000}
          height={2000}
          priority
        />
      </main>
    </div>
  );
}
