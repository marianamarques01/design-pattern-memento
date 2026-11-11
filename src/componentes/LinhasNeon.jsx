export function LinhasNeon() {
  return (
    <div className="neon-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
        <defs>
          <linearGradient id="neon" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#7a2cff" />
            <stop offset="0.55" stopColor="#b72cff" />
            <stop offset="1" stopColor="#ff2a8b" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#neon)" vectorEffect="non-scaling-stroke">
          <path d="M-180 960 C 80 780 80 630 310 530 C 490 450 500 260 430 60" />
          <path d="M-110 1040 C 180 860 160 690 370 600 C 540 525 570 340 500 140" />
          <path d="M0 1120 C 290 950 250 760 450 670 C 610 600 640 420 570 220" />
          <path d="M1560 960 C 1260 830 1250 660 1390 550 C 1510 460 1500 280 1430 140" />
          <path d="M1490 1060 C 1210 900 1200 720 1350 610 C 1480 510 1470 330 1400 200" />
        </g>
      </svg>
    </div>
  );
}
