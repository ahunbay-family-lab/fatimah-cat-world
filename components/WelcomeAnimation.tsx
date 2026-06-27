const floatingItems = [
  { emoji: "🌟", className: "left-[8%] top-[12%] animation-delay-0" },
  { emoji: "✨", className: "right-[10%] top-[18%] [animation-delay:0.5s]" },
  { emoji: "🚀", className: "left-[15%] bottom-[20%] [animation-delay:1s]" },
  { emoji: "🎨", className: "right-[12%] bottom-[15%] [animation-delay:1.5s]" },
];

export function WelcomeAnimation() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {floatingItems.map((item) => (
        <span
          key={item.emoji}
          className={`animate-float absolute text-4xl sm:text-5xl ${item.className}`}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
