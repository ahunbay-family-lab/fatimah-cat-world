"use client";

import Image from "next/image";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  const [isPopping, setIsPopping] = useState(false);

  function handleClick() {
    setCount((previous) => previous + 1);
    setIsPopping(true);
    window.setTimeout(() => setIsPopping(false), 350);
  }

  return (
    <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
      <p className="text-lg font-medium text-indigo-900">Your click count</p>
      <p
        className={`text-6xl font-bold text-fuchsia-600 ${isPopping ? "animate-pop" : ""}`}
        aria-live="polite"
      >
        {count}
      </p>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Click Me!"
        className="flex min-h-14 min-w-44 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-8 py-4 text-xl font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg active:scale-95"
      >
        <Image
          src="/cat.png"
          alt="Cute cat"
          width={36}
          height={36}
          className="rounded-full"
        />
        Click Me!
      </button>
    </section>
  );
}
