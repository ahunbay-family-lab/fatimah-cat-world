type PlayerGirlAvatarProps = {
  className?: string;
};

export function PlayerGirlAvatar({ className }: PlayerGirlAvatarProps) {
  return (
    <svg
      viewBox="0 0 52 88"
      role="img"
      aria-label="Player 2 girl with black hijab, pink cat t-shirt, and jeans"
      className={className}
    >
      <rect x="14" y="62" width="10" height="22" fill="#2563eb" />
      <rect x="28" y="62" width="10" height="22" fill="#2563eb" />
      <rect x="14" y="62" width="10" height="4" fill="#1d4ed8" />
      <rect x="28" y="62" width="10" height="4" fill="#1d4ed8" />
      <rect x="8" y="34" width="36" height="30" rx="6" fill="#f472b6" />
      <circle cx="19" cy="46" r="3" fill="#ffffff" />
      <circle cx="33" cy="46" r="3" fill="#ffffff" />
      <circle cx="19" cy="46" r="1.5" fill="#1e293b" />
      <circle cx="33" cy="46" r="1.5" fill="#1e293b" />
      <polygon points="26,49 24,52 28,52" fill="#ffffff" />
      <path
        d="M12 48 L6 46 M12 52 L6 52 M40 48 L46 46 M40 52 L46 52"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="26" cy="26" r="10" fill="#f5c99b" />
      <circle cx="23" cy="25" r="1.5" fill="#1e293b" />
      <circle cx="29" cy="25" r="1.5" fill="#1e293b" />
      <ellipse cx="26" cy="16" rx="18" ry="14" fill="#111827" />
      <path
        d="M2 20 Q26 42 50 20 L50 34 Q26 48 2 34 Z"
        fill="#111827"
      />
    </svg>
  );
}
