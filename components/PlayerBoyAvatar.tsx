type PlayerBoyAvatarProps = {
  className?: string;
};

export function PlayerBoyAvatar({ className }: PlayerBoyAvatarProps) {
  return (
    <svg
      viewBox="0 0 52 88"
      role="img"
      aria-label="Player 1 boy with topi, white t-shirt, and black pants"
      className={className}
    >
      <rect x="14" y="58" width="10" height="24" fill="#111827" />
      <rect x="28" y="58" width="10" height="24" fill="#111827" />
      <rect x="10" y="34" width="32" height="26" rx="4" fill="#ffffff" />
      <rect x="10" y="34" width="32" height="4" fill="#e2e8f0" />
      <circle cx="26" cy="24" r="12" fill="#f5c99b" />
      <circle cx="22" cy="23" r="1.5" fill="#1e293b" />
      <circle cx="30" cy="23" r="1.5" fill="#1e293b" />
      <path
        d="M22 27 Q26 31 30 27"
        fill="none"
        stroke="#b45309"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="26" cy="12" rx="14" ry="7" fill="#f8fafc" stroke="#cbd5e1" />
    </svg>
  );
}
