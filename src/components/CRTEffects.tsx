export default function CRTEffects() {
  return (
    <div
      aria-hidden
      className="crt-flicker pointer-events-none fixed inset-0 z-40"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)",
      }}
    />
  );
}
