import { useRef, useEffect, useCallback } from 'react';

interface ButterflyCanvasProps {
  cycleValue: number;
  stepCount: number;
}

const TAU = Math.PI * 2;

// Derive all visual parameters from the cycle value
function getCycleParams(value: number) {
  const v = value / 1000;
  return {
    // Color: shift hue across warm spectrum (15-45)
    hue: 15 + (value % 300) / 300 * 30,
    saturation: 75 + (value % 250) / 250 * 20,
    lightness: 42 + (value % 200) / 200 * 16,
    // Wing pattern: vein angle offsets
    veinBend: 0.6 + ((value * 3) % 1000) / 1000 * 0.8,
    // Spot count & positions seed
    spotSeed: (value * 13) % 1000,
    spotCount: 3 + ((value * 7) % 5),
    // Size variation: 0.75 - 1.15
    sizeMultiplier: 0.8 + ((value * 11) % 1000) / 1000 * 0.35,
    // Position offset from center
    offsetX: Math.sin(v * TAU * 3) * 40,
    offsetY: Math.cos(v * TAU * 2) * 30,
    // Flap
    flapAngle: Math.abs(Math.sin(v * Math.PI * 2)),
    flapSpeed: 0.5 + ((value * 7) % 1000) / 1000 * 2,
    // Stripe thickness
    stripeWidth: 1 + ((value * 17) % 1000) / 1000 * 2,
  };
}

function drawWing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  effectiveFlap: number,
  side: 'left' | 'right',
  params: ReturnType<typeof getCycleParams>
) {
  const mirror = side === 'left' ? -1 : 1;
  const squeeze = 1 - effectiveFlap * 0.65;
  const s = scale / 40;
  const bend = params.veinBend;

  ctx.save();
  ctx.translate(cx, cy);

  // === Upper wing ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    mirror * 15 * squeeze * s, -60 * s,
    mirror * 80 * squeeze * s, -90 * s,
    mirror * 95 * squeeze * s, -55 * s
  );
  ctx.bezierCurveTo(
    mirror * 105 * squeeze * s, -30 * s,
    mirror * 90 * squeeze * s, -5 * s,
    mirror * 50 * squeeze * s, 5 * s
  );
  ctx.bezierCurveTo(
    mirror * 25 * squeeze * s, 10 * s,
    mirror * 5 * squeeze * s, 5 * s,
    0, 0
  );
  ctx.closePath();

  const upperGrad = ctx.createRadialGradient(
    mirror * 40 * squeeze * s, -40 * s, 0,
    mirror * 40 * squeeze * s, -40 * s, 90 * s
  );
  upperGrad.addColorStop(0, `hsl(${params.hue + 5}, ${params.saturation}%, ${params.lightness + 10}%)`);
  upperGrad.addColorStop(0.4, `hsl(${params.hue}, ${params.saturation}%, ${params.lightness}%)`);
  upperGrad.addColorStop(0.7, `hsl(${params.hue - 5}, ${params.saturation - 5}%, ${params.lightness - 8}%)`);
  upperGrad.addColorStop(1, `hsl(${params.hue - 10}, ${params.saturation - 10}%, ${params.lightness - 15}%)`);
  ctx.fillStyle = upperGrad;
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 5%)';
  ctx.lineWidth = 2.5 * s;
  ctx.stroke();

  // Dynamic veins based on veinBend
  ctx.strokeStyle = 'hsla(0, 0%, 5%, 0.75)';
  ctx.lineWidth = params.stripeWidth * s;

  const veinAngles = [-75, -45, -15, 5];
  for (const angle of veinAngles) {
    const rad = (angle * Math.PI) / 180;
    const len = (65 + Math.abs(angle) * 0.3) * bend;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      mirror * (len * 0.5) * squeeze * s * Math.cos(rad - mirror * 0.2),
      (len * 0.5) * s * Math.sin(rad),
      mirror * len * squeeze * s * Math.cos(rad),
      len * s * Math.sin(rad)
    );
    ctx.stroke();
  }

  // Dynamic spots
  const spotR = 2.5 * s;
  ctx.fillStyle = 'hsla(0, 0%, 100%, 0.85)';
  for (let i = 0; i < params.spotCount; i++) {
    const seed = (params.spotSeed + i * 197) % 1000;
    const sx = mirror * (60 + (seed % 35)) * squeeze * s;
    const sy = (-70 + (seed % 60)) * s;
    ctx.beginPath();
    ctx.arc(sx, sy, spotR * (0.7 + (seed % 5) / 10), 0, TAU);
    ctx.fill();
  }

  // === Lower wing ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    mirror * 30 * squeeze * s, 10 * s,
    mirror * 75 * squeeze * s, 15 * s,
    mirror * 70 * squeeze * s, 45 * s
  );
  ctx.bezierCurveTo(
    mirror * 65 * squeeze * s, 65 * s,
    mirror * 35 * squeeze * s, 70 * s,
    mirror * 15 * squeeze * s, 55 * s
  );
  ctx.bezierCurveTo(
    mirror * 5 * squeeze * s, 40 * s,
    0, 20 * s,
    0, 0
  );
  ctx.closePath();

  const lowerGrad = ctx.createRadialGradient(
    mirror * 35 * squeeze * s, 35 * s, 0,
    mirror * 35 * squeeze * s, 35 * s, 70 * s
  );
  lowerGrad.addColorStop(0, `hsl(${params.hue + 3}, ${params.saturation}%, ${params.lightness + 8}%)`);
  lowerGrad.addColorStop(0.5, `hsl(${params.hue - 2}, ${params.saturation - 3}%, ${params.lightness - 4}%)`);
  lowerGrad.addColorStop(1, `hsl(${params.hue - 10}, ${params.saturation - 10}%, ${params.lightness - 15}%)`);
  ctx.fillStyle = lowerGrad;
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 5%)';
  ctx.lineWidth = 2.5 * s;
  ctx.stroke();

  // Lower veins
  ctx.strokeStyle = 'hsla(0, 0%, 5%, 0.65)';
  ctx.lineWidth = params.stripeWidth * 0.9 * s;
  const lowerVeins = [15, 35, 50];
  for (const angle of lowerVeins) {
    const rad = (angle * Math.PI) / 180;
    const len = 55 * bend;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      mirror * (len * 0.4) * squeeze * s,
      (len * 0.5) * s * Math.sin(rad),
      mirror * len * squeeze * s * Math.cos(rad) * 0.8,
      len * s * Math.sin(rad)
    );
    ctx.stroke();
  }

  // Lower spots
  ctx.fillStyle = 'hsla(0, 0%, 100%, 0.75)';
  for (let i = 0; i < Math.max(2, params.spotCount - 1); i++) {
    const seed = (params.spotSeed + i * 251 + 500) % 1000;
    const sx = mirror * (30 + (seed % 35)) * squeeze * s;
    const sy = (40 + (seed % 25)) * s;
    ctx.beginPath();
    ctx.arc(sx, sy, spotR * (0.6 + (seed % 4) / 10), 0, TAU);
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

  ctx.beginPath();
  ctx.ellipse(cx, cy + 15 * s, 4 * s, 20 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 8%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(30, 40%, 25%)';
  ctx.lineWidth = 0.8 * s;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy - 5 * s, 5 * s, 10 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 10%)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy - 18 * s, 5 * s, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 8%)';
  ctx.fill();

  ctx.fillStyle = 'hsl(30, 60%, 40%)';
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + dir * 3 * s, cy - 19 * s, 1.5 * s, 0, TAU);
    ctx.fill();
  }

  ctx.strokeStyle = 'hsl(0, 0%, 12%)';
  ctx.lineWidth = 1.2 * s;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * 2 * s, cy - 22 * s);
    ctx.quadraticCurveTo(cx + dir * 20 * s, cy - 55 * s, cx + dir * 25 * s, cy - 50 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + dir * 25 * s, cy - 50 * s, 2 * s, 0, TAU);
    ctx.fillStyle = 'hsl(25, 70%, 35%)';
    ctx.fill();
  }

  ctx.strokeStyle = 'hsla(30, 30%, 30%, 0.5)';
  ctx.lineWidth = 0.5 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 3.5 * s, cy + 5 * s + i * 6 * s);
    ctx.lineTo(cx + 3.5 * s, cy + 5 * s + i * 6 * s);
    ctx.stroke();
  }
}

// Surrounding effects: orbiting cycle values + energy ring
function drawSurroundingEffects(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  cycleValue: number,
  stepCount: number,
  time: number,
  history: number[]
) {
  // Outer ring showing cycle progress
  const progress = (stepCount % 1000) / 1000;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
  ctx.strokeStyle = `hsla(28, 80%, 55%, ${0.15 + progress * 0.3})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Full ring outline
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.05)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Orbiting recent values as floating numbers
  const displayCount = Math.min(12, history.length);
  for (let i = 0; i < displayCount; i++) {
    const val = history[history.length - 1 - i];
    const age = i / displayCount;
    const angle = -Math.PI / 2 + (i / displayCount) * TAU + time * 0.15;
    const orbitR = radius * (0.85 + age * 0.2);
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR;

    const alpha = 0.8 - age * 0.65;
    const size = 12 - age * 5;

    ctx.font = `${Math.max(8, size)}px monospace`;
    ctx.fillStyle = `hsla(28, 70%, 65%, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(val).padStart(3, '0'), px, py);
  }

  // Pulsing energy dots on the ring at cardinal points
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * TAU + time * 0.3;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    const pulse = 1 + Math.sin(time * 3 + i) * 0.5;
    ctx.beginPath();
    ctx.arc(px, py, 2 * pulse, 0, TAU);
    ctx.fillStyle = `hsla(28, 90%, 60%, ${0.2 + Math.sin(time * 2 + i * 0.8) * 0.15})`;
    ctx.fill();
  }

  // Radiating lines from butterfly on each step (brief flash)
  const flash = Math.max(0, 1 - (time % 1) * 3);
  if (flash > 0) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TAU + cycleValue * 0.01;
      const innerR = radius * 0.3;
      const outerR = radius * (0.5 + flash * 0.3);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.strokeStyle = `hsla(30, 80%, 60%, ${flash * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// Floating ambient particles
function drawAmbient(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, hue: number) {
  for (let i = 0; i < 25; i++) {
    const seed = i * 137.508;
    const px = (seed * 7.3) % w;
    const py = ((seed * 3.7 + time * 12) % (h + 40)) - 20;
    const size = 1 + (seed % 3);
    const alpha = 0.1 + Math.sin(time + i) * 0.08;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, TAU);
    ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${alpha})`;
    ctx.fill();
  }
}

export const ButterflyCanvas = ({ cycleValue, stepCount }: ButterflyCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const prevFlapRef = useRef(0);
  const prevPosRef = useRef({ x: 0, y: 0, scale: 1 });
  const historyRef = useRef<number[]>([cycleValue]);

  // Track history
  useEffect(() => {
    historyRef.current = [...historyRef.current.slice(-20), cycleValue];
  }, [cycleValue]);

  const params = getCycleParams(cycleValue);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const baseCx = w / 2;
    const baseCy = h / 2;
    const baseScale = Math.min(w, h) * 0.2;

    timeRef.current += 0.016 * params.flapSpeed;

    // Smooth interpolation for flap
    prevFlapRef.current += (params.flapAngle - prevFlapRef.current) * 0.08;
    const breathe = Math.sin(timeRef.current * 1.5) * 0.03;
    const effectiveFlap = Math.max(0, Math.min(1, prevFlapRef.current + breathe));

    // Smooth interpolation for position and size
    const targetX = baseCx + params.offsetX;
    const targetY = baseCy + params.offsetY;
    const targetScale = baseScale * params.sizeMultiplier;
    prevPosRef.current.x += (targetX - prevPosRef.current.x) * 0.05;
    prevPosRef.current.y += (targetY - prevPosRef.current.y) * 0.05;
    prevPosRef.current.scale += (targetScale - prevPosRef.current.scale) * 0.05;

    const cx = prevPosRef.current.x;
    const cy = prevPosRef.current.y;
    const scale = prevPosRef.current.scale;

    // Clear
    ctx.fillStyle = 'hsl(240, 10%, 3.9%)';
    ctx.fillRect(0, 0, w, h);

    // Ambient
    drawAmbient(ctx, w, h, timeRef.current, params.hue);

    // Glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 3);
    glow.addColorStop(0, `hsla(${params.hue}, 70%, 45%, 0.07)`);
    glow.addColorStop(0.5, `hsla(${params.hue}, 60%, 35%, 0.03)`);
    glow.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Surrounding effects
    const effectRadius = scale * 3.2;
    drawSurroundingEffects(ctx, cx, cy, effectRadius, cycleValue, stepCount, timeRef.current, historyRef.current);

    // Wings & body
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'right', params);
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'left', params);
    drawBody(ctx, cx, cy, scale);

    animFrameRef.current = requestAnimationFrame(draw);
  }, [params, cycleValue, stepCount]);

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
