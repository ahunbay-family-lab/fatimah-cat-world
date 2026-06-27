import { Counter } from "@/components/Counter";
import { WelcomeAnimation } from "@/components/WelcomeAnimation";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-gradient-to-br from-violet-200 via-fuchsia-100 to-orange-100 px-6 py-12">
      <WelcomeAnimation />

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 text-center">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-700">
            Ahunbay Family Lab
          </p>
          <h1 className="animate-wiggle text-4xl font-extrabold text-indigo-900 sm:text-6xl">
            Welcome to Family Lab!
          </h1>
          <p className="text-lg text-indigo-800 sm:text-xl">
            This is your starter app. Change it, break it, and make it yours.
          </p>
        </header>

        <Counter />
      </main>
    </div>
  );
}
