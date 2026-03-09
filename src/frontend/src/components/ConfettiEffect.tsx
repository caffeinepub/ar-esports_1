import { useEffect, useRef } from "react";

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  speed: number;
  swayDir: number;
  swayAmount: number;
  swaySpeed: number;
  opacity: number;
}

const COLORS = [
  "oklch(65% 0.22 45)",
  "oklch(80% 0.18 80)",
  "oklch(55% 0.25 25)",
  "oklch(70% 0.2 145)",
  "oklch(75% 0.2 290)",
  "oklch(85% 0.15 60)",
  "oklch(60% 0.25 10)",
];

const EMOJIS = ["🎉", "🎊", "🔥", "⚡", "🏆", "💥"];

export function ConfettiEffect({
  active,
  onComplete,
}: { active: boolean; onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    // Spawn emoji burst
    const container = emojiContainerRef.current;
    if (container) {
      container.innerHTML = "";
      for (let i = 0; i < 20; i++) {
        const el = document.createElement("div");
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        el.textContent = emoji;
        el.style.cssText = `
          position: fixed;
          font-size: ${Math.random() * 20 + 20}px;
          left: ${Math.random() * 100}vw;
          top: -40px;
          animation: confetti-fall ${Math.random() * 2 + 2}s linear forwards, confetti-sway ${Math.random() * 2 + 1}s ease-in-out infinite;
          animation-delay: ${Math.random() * 1.5}s;
          z-index: 9999;
          pointer-events: none;
        `;
        container.appendChild(el);
      }
    }

    // Canvas confetti
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: Math.random() * 12 + 4,
        h: Math.random() * 6 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        speed: Math.random() * 3 + 2,
        swayDir: Math.random() > 0.5 ? 1 : -1,
        swayAmount: Math.random() * 2 + 0.5,
        swaySpeed: Math.random() * 0.05 + 0.02,
        opacity: 1,
      });
    }
    piecesRef.current = pieces;

    let elapsed = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed++;

      let allDone = true;
      for (const p of piecesRef.current) {
        if (p.y < canvas.height + 20) {
          allDone = false;
        }
        p.y += p.speed;
        p.x += Math.sin(elapsed * p.swaySpeed) * p.swayDir * p.swayAmount;
        p.rotation += 3;
        if (p.y > canvas.height * 0.6) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (!allDone) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (container) container.innerHTML = "";
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (container) container.innerHTML = "";
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998 }}
      />
      <div ref={emojiContainerRef} />
    </>
  );
}
