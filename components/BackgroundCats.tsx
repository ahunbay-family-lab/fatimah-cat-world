import Image from "next/image";

const backgroundCats = [
  { className: "left-[6%] top-[14%] [animation-delay:0s]", size: 56 },
  { className: "right-[8%] top-[22%] [animation-delay:0.8s]", size: 48 },
  { className: "left-[12%] bottom-[18%] [animation-delay:1.4s]", size: 64 },
  { className: "right-[14%] bottom-[24%] [animation-delay:2s]", size: 52 },
  { className: "left-[42%] top-[8%] [animation-delay:1.1s]", size: 44 },
];

export function BackgroundCats() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {backgroundCats.map((cat, index) => (
        <div
          key={index}
          className={`animate-float absolute ${cat.className}`}
        >
          <span className="absolute -top-5 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-extrabold text-violet-700 shadow-md">
            ?
          </span>
          <Image
            src="/cat.png"
            alt=""
            width={cat.size}
            height={cat.size}
            className="rounded-full opacity-70"
          />
        </div>
      ))}
    </div>
  );
}
