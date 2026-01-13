"use client";

type GateProps = {
  open: boolean;
};

export default function Gate({ open }: GateProps) {
  const doorBox = {
    leftPct: 0.247,
    topPct: 0.205,
    widthPct: 0.48,
    heightPct: 0.6,
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl aspect-[3/2] overflow-hidden bg-black">
      {/* Inside */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-[1200ms] ${
          open ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url('/The_School_of_Athens.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7) contrast(1.1)",
        }}
      />

      {/* DOOR BOX */}
      <div
        className="absolute z-30 [perspective:1400px]"
        style={{
          left: `${doorBox.leftPct * 100}%`,
          top: `${doorBox.topPct * 100}%`,
          width: `${doorBox.widthPct * 100}%`,
          height: `${doorBox.heightPct * 100}%`,
        }}
      >
        <img
          src="/left-gate3.png"
          className={`absolute left-0 top-0 h-full w-1/2 object-contain block
            transition-transform duration-[1200ms]
            ease-[cubic-bezier(.22,1,.36,1)]
            [transform-origin:left_center]
            ${open ? "[transform:rotateY(70deg)]" : ""}
          `}
        />

        <img
          src="/right-gate3.png"
          className={`absolute right-0 top-0 h-full w-1/2 object-contain block
            transition-transform duration-[1200ms]
            ease-[cubic-bezier(.22,1,.36,1)]
            [transform-origin:right_center]
            ${open ? "[transform:rotateY(-70deg)]" : ""}
          `}
        />
      </div>

      {/* FRAME */}
      <img
        src="/frame.png"
        className="absolute inset-0 z-20 h-full w-full object-cover pointer-events-none"
      />

      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div className="fog fog-1" />
        <div className="fog fog-2" />
        <div className="fog fog-3" />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />

      {/* FOG (CSS-only) */}
    </div>
  );
}
