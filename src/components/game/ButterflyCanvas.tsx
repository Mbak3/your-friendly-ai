import { useRef, useEffect, useCallback } from 'react';

interface ButterflyCanvasProps {
  cycleValue: number;
  stepCount: number;
}

const TAU = Math.PI * 2;

function drawWing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  flapAngle: number,
  side: 'left' | 'right'
) {
  const mirror = side === 'left' ? -1 : 1;
  const squeeze = 1 - flapAngle * 0.65;

  ctx.save();
  ctx.translate(cx, cy);

  // === Upper wing ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    mirror * 15 * squeeze * scale / 40, -60 * scale / 40,
    mirror * 80 * squeeze * scale / 40, -90 * scale / 40,
    mirror * 95 * squeeze * scale / 40, -55 * scale / 40
  );
  ctx.bezierCurveTo(
    mirror * 105 * squeeze * scale / 40, -30 * scale / 40,
    mirror * 90 * squeeze * scale / 40, -5 * scale / 40,
    mirror * 50 * squeeze * scale / 40, 5 * scale / 40
  );
  ctx.bezierCurveTo(
    mirror * 25 * squeeze * scale / 40, 10 * scale / 40,
    mirror * 5 * squeeze * scale / 40, 5 * scale / 40,
    0, 0
  );
  ctx.closePath();

  // Orange gradient fill for upper wing
  const ugx = cx + mirror * 50 * squeeze * scale / 40;
  const ugy = cy - 45 * scale / 40;
  const upperGrad = ctx.createRadialGradient(
    mirror * 40 * squeeze * scale / 40, -40 * scale / 40, 0,
    mirror * 40 * squeeze * scale / 40, -40 * scale / 40, 90 * scale / 40
  );
  upperGrad.addColorStop(0, 'hsl(28, 95%, 55%)');
  upperGrad.addColorStop(0.4, 'hsl(25, 90%, 50%)');
  upperGrad.addColorStop(0.7, 'hsl(20, 85%, 42%)');
  upperGrad.addColorStop(1, 'hsl(15, 80%, 30%)');
  ctx.fillStyle = upperGrad;
  ctx.fill();

  // Black border
  ctx.strokeStyle = 'hsl(0, 0%, 5%)';
  ctx.lineWidth = 2.5 * scale / 40;
  ctx.stroke();

  // === Upper wing veins ===
  ctx.strokeStyle = 'hsla(0, 0%, 5%, 0.8)';
  ctx.lineWidth = 1.5 * scale / 40;

  // Vein 1
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    mirror * 30 * squeeze * scale / 40, -50 * scale / 40,
    mirror * 70 * squeeze * scale / 40, -75 * scale / 40
  );
  ctx.stroke();

  // Vein 2
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    mirror * 45 * squeeze * scale / 40, -35 * scale / 40,
    mirror * 90 * squeeze * scale / 40, -45 * scale / 40
  );
  ctx.stroke();

  // Vein 3
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    mirror * 35 * squeeze * scale / 40, -15 * scale / 40,
    mirror * 75 * squeeze * scale / 40, -15 * scale / 40
  );
  ctx.stroke();

  // White spots near wing tips (monarch style)
  const spots = [
    { x: mirror * 85 * squeeze, y: -60, r: 3 },
    { x: mirror * 78 * squeeze, y: -70, r: 2.5 },
    { x: mirror * 92 * squeeze, y: -45, r: 2.5 },
    { x: mirror * 88 * squeeze, y: -35, r: 2 },
    { x: mirror * 95 * squeeze, y: -52, r: 2 },
  ];
  ctx.fillStyle = 'hsla(0, 0%, 100%, 0.85)';
  for (const s of spots) {
    ctx.beginPath();
    ctx.arc(s.x * scale / 40, s.y * scale / 40, s.r * scale / 40, 0, TAU);
    ctx.fill();
  }

  // === Lower wing ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    mirror * 30 * squeeze * scale / 40, 10 * scale / 40,
    mirror * 75 * squeeze * scale / 40, 15 * scale / 40,
    mirror * 70 * squeeze * scale / 40, 45 * scale / 40
  );
  ctx.bezierCurveTo(
    mirror * 65 * squeeze * scale / 40, 65 * scale / 40,
    mirror * 35 * squeeze * scale / 40, 70 * scale / 40,
    mirror * 15 * squeeze * scale / 40, 55 * scale / 40
  );
  ctx.bezierCurveTo(
    mirror * 5 * squeeze * scale / 40, 40 * scale / 40,
    0, 20 * scale / 40,
    0, 0
  );
  ctx.closePath();

  // Orange gradient for lower wing
  const lowerGrad = ctx.createRadialGradient(
    mirror * 35 * squeeze * scale / 40, 35 * scale / 40, 0,
    mirror * 35 * squeeze * scale / 40, 35 * scale / 40, 70 * scale / 40
  );
  lowerGrad.addColorStop(0, 'hsl(30, 95%, 55%)');
  lowerGrad.addColorStop(0.5, 'hsl(22, 90%, 48%)');
  lowerGrad.addColorStop(1, 'hsl(15, 80%, 30%)');
  ctx.fillStyle = lowerGrad;
  ctx.fill();

  ctx.strokeStyle = 'hsl(0, 0%, 5%)';
  ctx.lineWidth = 2.5 * scale / 40;
  ctx.stroke();

  // Lower wing veins
  ctx.strokeStyle = 'hsla(0, 0%, 5%, 0.7)';
  ctx.lineWidth = 1.3 * scale / 40;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    mirror * 40 * squeeze * scale / 40, 20 * scale / 40,
    mirror * 65 * squeeze * scale / 40, 40 * scale / 40
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    mirror * 25 * squeeze * scale / 40, 35 * scale / 40,
    mirror * 40 * squeeze * scale / 40, 60 * scale / 40
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    mirror * 10 * squeeze * scale / 40, 30 * scale / 40,
    mirror * 20 * squeeze * scale / 40, 55 * scale / 40
  );
  ctx.stroke();

  // Lower wing edge spots
  const lowerSpots = [
    { x: mirror * 60 * squeeze, y: 50, r: 2.5 },
    { x: mirror * 50 * squeeze, y: 58, r: 2 },
    { x: mirror * 38 * squeeze, y: 63, r: 2 },
    { x: mirror * 25 * squeeze, y: 58, r: 2 },
  ];
  ctx.fillStyle = 'hsla(0, 0%, 100%, 0.8)';
  for (const s of lowerSpots) {
    ctx.beginPath();
    ctx.arc(s.x * scale / 40, s.y * scale / 40, s.r * scale / 40, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number
) {
  const s = scale / 40;

  // Abdomen
  ctx.beginPath();
  ctx.ellipse(cx, cy + 15 * s, 4 * s, 20 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 8%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(30, 40%, 25%)';
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();

  // Thorax
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5 * s, 5 * s, 10 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 10%)';
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 18 * s, 5 * s, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 8%)';
  ctx.fill();

  // Eyes
  ctx.fillStyle = 'hsl(30, 60%, 40%)';
  ctx.beginPath();
  ctx.arc(cx - 3 * s, cy - 19 * s, 1.5 * s, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3 * s, cy - 19 * s, 1.5 * s, 0, TAU);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = 'hsl(0, 0%, 12%)';
  ctx.lineWidth = 1.2 * s;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * 2 * s, cy - 22 * s);
    ctx.quadraticCurveTo(
      cx + dir * 20 * s, cy - 55 * s,
      cx + dir * 25 * s, cy - 50 * s
    );
    ctx.stroke();
    // Antenna clubs
    ctx.beginPath();
    ctx.arc(cx + dir * 25 * s, cy - 50 * s, 2 * s, 0, TAU);
    ctx.fillStyle = 'hsl(25, 70%, 35%)';
    ctx.fill();
  }

  // Body segments
  ctx.strokeStyle = 'hsla(30, 30%, 30%, 0.5)';
  ctx.lineWidth = 0.5 * s;
  for (let i = 0; i < 5; i++) {
    const segY = cy + 5 * s + i * 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 3.5 * s, segY);
    ctx.lineTo(cx + 3.5 * s, segY);
    ctx.stroke();
  }
}

// Scattered particles for ambiance
function drawParticles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    const px = ((seed * 7.3) % w);
    const py = ((seed * 3.7 + time * 15) % (h + 40)) - 20;
    const size = 1 + (seed % 3);
    const alpha = 0.15 + Math.sin(time + i) * 0.1;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fillStyle = `hsla(30, 80%, 60%, ${alpha})`;
    ctx.fill();
  }
}

export const ButterflyCanvas = ({ cycleValue, stepCount }: ButterflyCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const prevFlapRef = useRef(0);

  const flapPhase = (cycleValue % 1000) / 1000;
  const flapAngle = Math.abs(Math.sin(flapPhase * Math.PI * 2));
  const flapSpeed = 0.5 + ((cycleValue * 7) % 1000) / 1000 * 2;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.28;

    timeRef.current += 0.016 * flapSpeed;
    prevFlapRef.current += (flapAngle - prevFlapRef.current) * 0.08;
    const currentFlap = prevFlapRef.current;

    // Subtle breathing motion
    const breathe = Math.sin(timeRef.current * 1.5) * 0.03;
    const effectiveFlap = Math.max(0, Math.min(1, currentFlap + breathe));

    // Clear
    ctx.fillStyle = 'hsl(240, 10%, 3.9%)';
    ctx.fillRect(0, 0, w, h);

    // Ambient particles
    drawParticles(ctx, w, h, timeRef.current);

    // Soft glow behind butterfly
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.5);
    glow.addColorStop(0, 'hsla(28, 80%, 50%, 0.08)');
    glow.addColorStop(0.5, 'hsla(28, 70%, 40%, 0.03)');
    glow.addColorStop(1, 'hsla(28, 60%, 30%, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Draw wings (back to front: right then left for layering)
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'right');
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'left');

    // Draw body on top
    drawBody(ctx, cx, cy, scale);

    animFrameRef.current = requestAnimationFrame(draw);
  }, [flapAngle, flapSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: 'hsl(240, 10%, 3.9%)' }}
    />
  );
};
