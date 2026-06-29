import { PingPongGame } from "@/components/PingPongGame";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gradient-to-br from-sky-200 via-indigo-100 to-violet-200 px-4 py-10 sm:px-6">
      <main className="flex w-full flex-col items-center">
        <PingPongGame />
      </main>
    </div>
  );
}
