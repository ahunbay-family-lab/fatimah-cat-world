import { CatGame } from "@/components/CatGame";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#9fd4e8_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#f4c15d55_0%,transparent_35%),linear-gradient(180deg,#8fc9de_0%,#d7ecc4_55%,#c4a35a_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(90deg,transparent,transparent_18px,#2f463214_18px,#2f463214_19px)]"
      />
      <main className="relative z-10 flex w-full flex-col items-center">
        <CatGame />
      </main>
    </div>
  );
}
