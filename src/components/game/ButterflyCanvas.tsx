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
    // Color: harsh warm tones — burnt orange to sickly yellow-green
    hue: 15 + (value % 300) / 300 * 40,
    saturation: 55 + (value % 250) / 250 * 35,
    lightness: 35 + (value % 200) / 200 * 20,
    // Wing pattern: vein angle offsets
    veinBend: 0.6 + ((value * 3) % 1000) / 1000 * 0.8,
    // Spot count & positions seed
    spotSeed: (value * 13) % 1000,
    spotCount: 3 + ((value * 7) % 5),
    // Size variation
    sizeMultiplier: 0.8 + ((value * 11) % 1000) / 1000 * 0.35,
    // Position offset from center
    offsetX: Math.sin(v * TAU * 3) * 40,
    offsetY: Math.cos(v * TAU * 2) * 30,
    // Flap
    flapAngle: Math.abs(Math.sin(v * Math.PI * 2)),
    flapSpeed: 0.5 + ((value * 7) % 1000) / 1000 * 2,
    // Stripe thickness — thicker, rougher
    stripeWidth: 2 + ((value * 17) % 1000) / 1000 * 3,
    // Distortion seed for "ugly" imperfection
    distortSeed: (value * 31) % 1000,
  };
}

// Jitter a point for hand-drawn feel
function jitter(val: number, seed: number, amount: number): number {
  return val + Math.sin(seed * 137.508) * amount;
}

function drawWing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  effectiveFlap: number,
  side: 'left' | 'right',
  params: ReturnType<typeof getCycleParams>,
  time: number
) {
  const mirror = side === 'left' ? -1 : 1;
  const squeeze = 1 - effectiveFlap * 0.65;
  const s = scale / 40;
  const bend = params.veinBend;
  const d = params.distortSeed;
  const j = (v: number, i: number) => jitter(v, d + i * 73, 3 * s);

  ctx.save();
  ctx.translate(cx, cy);

  // === Upper wing — cel-shaded with thick rough outline ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    j(mirror * 15 * squeeze * s, 1), j(-60 * s, 2),
    j(mirror * 80 * squeeze * s, 3), j(-90 * s, 4),
    j(mirror * 95 * squeeze * s, 5), j(-55 * s, 6)
  );
  ctx.bezierCurveTo(
    j(mirror * 105 * squeeze * s, 7), j(-30 * s, 8),
    j(mirror * 90 * squeeze * s, 9), j(-5 * s, 10),
    j(mirror * 50 * squeeze * s, 11), j(5 * s, 12)
  );
  ctx.bezierCurveTo(
    j(mirror * 25 * squeeze * s, 13), j(10 * s, 14),
    j(mirror * 5 * squeeze * s, 15), j(5 * s, 16),
    0, 0
  );
  ctx.closePath();

  // Flat cel-shaded fill — harsh two-tone
  const upperGrad = ctx.createLinearGradient(
    0, -80 * s,
    mirror * 60 * squeeze * s, 10 * s
  );
  upperGrad.addColorStop(0, `hsl(${params.hue + 8}, ${params.saturation}%, ${params.lightness + 18}%)`);
  upperGrad.addColorStop(0.45, `hsl(${params.hue}, ${params.saturation}%, ${params.lightness + 5}%)`);
  upperGrad.addColorStop(0.46, `hsl(${params.hue - 5}, ${params.saturation - 10}%, ${params.lightness - 8}%)`);
  upperGrad.addColorStop(1, `hsl(${params.hue - 12}, ${params.saturation - 15}%, ${params.lightness - 18}%)`);
  ctx.fillStyle = upperGrad;
  ctx.fill();

  // Thick, rough black outline — anime style
  ctx.strokeStyle = 'hsl(0, 0%, 2%)';
  ctx.lineWidth = 4 * s;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Second inner outline for depth
  ctx.strokeStyle = `hsla(${params.hue - 10}, 40%, 20%, 0.5)`;
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  // Rough scratchy veins — uneven, hand-drawn
  ctx.lineCap = 'round';
  const veinAngles = [-75, -50, -25, 0, 10];
  for (let vi = 0; vi < veinAngles.length; vi++) {
    const angle = veinAngles[vi];
    const rad = (angle * Math.PI) / 180;
    const len = (55 + Math.abs(angle) * 0.4) * bend;

    // Draw as multiple short jagged segments
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const segments = 6;
    for (let seg = 1; seg <= segments; seg++) {
      const t = seg / segments;
      const baseX = mirror * len * t * squeeze * s * Math.cos(rad);
      const baseY = len * t * s * Math.sin(rad);
      const wobble = Math.sin(d + vi * 50 + seg * 30) * 4 * s;
      ctx.lineTo(baseX + wobble, baseY + wobble * 0.5);
    }
    ctx.strokeStyle = `hsla(0, 0%, 3%, ${0.6 + Math.sin(d + vi) * 0.2})`;
    ctx.lineWidth = params.stripeWidth * s * (0.7 + Math.sin(d + vi * 20) * 0.4);
    ctx.stroke();
  }

  // Rough spots — imperfect circles
  ctx.fillStyle = `hsla(45, 80%, 85%, 0.7)`;
  for (let i = 0; i < params.spotCount; i++) {
    const seed = (params.spotSeed + i * 197) % 1000;
    const sx = mirror * (55 + (seed % 40)) * squeeze * s;
    const sy = (-65 + (seed % 55)) * s;
    const spotR = (2 + (seed % 4)) * s;
    // Draw as wobbly ellipse
    ctx.beginPath();
    ctx.ellipse(
      jitter(sx, seed, 2 * s),
      jitter(sy, seed + 50, 2 * s),
      spotR * 1.2, spotR * 0.8,
      (seed % 30) * 0.1, 0, TAU
    );
    ctx.fill();
    // Dark ring around spot
    ctx.strokeStyle = 'hsla(0, 0%, 5%, 0.4)';
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
  }

  // === Lower wing ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    j(mirror * 30 * squeeze * s, 20), j(10 * s, 21),
    j(mirror * 75 * squeeze * s, 22), j(15 * s, 23),
    j(mirror * 70 * squeeze * s, 24), j(45 * s, 25)
  );
  ctx.bezierCurveTo(
    j(mirror * 65 * squeeze * s, 26), j(65 * s, 27),
    j(mirror * 35 * squeeze * s, 28), j(70 * s, 29),
    j(mirror * 15 * squeeze * s, 30), j(55 * s, 31)
  );
  ctx.bezierCurveTo(
    j(mirror * 5 * squeeze * s, 32), j(40 * s, 33),
    0, 20 * s,
    0, 0
  );
  ctx.closePath();

  // Cel-shaded lower wing
  const lowerGrad = ctx.createLinearGradient(
    mirror * 20 * squeeze * s, 10 * s,
    mirror * 50 * squeeze * s, 65 * s
  );
  lowerGrad.addColorStop(0, `hsl(${params.hue + 3}, ${params.saturation - 5}%, ${params.lightness + 12}%)`);
  lowerGrad.addColorStop(0.5, `hsl(${params.hue - 4}, ${params.saturation - 8}%, ${params.lightness - 2}%)`);
  lowerGrad.addColorStop(0.51, `hsl(${params.hue - 10}, ${params.saturation - 15}%, ${params.lightness - 12}%)`);
  lowerGrad.addColorStop(1, `hsl(${params.hue - 15}, ${params.saturation - 20}%, ${params.lightness - 22}%)`);
  ctx.fillStyle = lowerGrad;
  ctx.fill();

  // Thick outline
  ctx.strokeStyle = 'hsl(0, 0%, 2%)';
  ctx.lineWidth = 4 * s;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Inner outline
  ctx.strokeStyle = `hsla(${params.hue - 10}, 30%, 18%, 0.4)`;
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  // Lower veins — jagged
  const lowerVeins = [15, 35, 55];
  for (let vi = 0; vi < lowerVeins.length; vi++) {
    const angle = lowerVeins[vi];
    const rad = (angle * Math.PI) / 180;
    const len = 50 * bend;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const segments = 5;
    for (let seg = 1; seg <= segments; seg++) {
      const t = seg / segments;
      const baseX = mirror * len * t * squeeze * s * Math.cos(rad) * 0.8;
      const baseY = len * t * s * Math.sin(rad);
      const wobble = Math.sin(d + vi * 80 + seg * 40) * 3 * s;
      ctx.lineTo(baseX + wobble, baseY + wobble * 0.3);
    }
    ctx.strokeStyle = `hsla(0, 0%, 3%, ${0.5 + Math.sin(d + vi * 11) * 0.15})`;
    ctx.lineWidth = params.stripeWidth * 0.8 * s * (0.6 + Math.sin(d + vi * 30) * 0.4);
    ctx.stroke();
  }

  // Lower spots
  ctx.fillStyle = `hsla(40, 70%, 80%, 0.6)`;
  for (let i = 0; i < Math.max(2, params.spotCount - 1); i++) {
    const seed = (params.spotSeed + i * 251 + 500) % 1000;
    const sx = mirror * (28 + (seed % 35)) * squeeze * s;
    const sy = (38 + (seed % 25)) * s;
    const spotR = (1.5 + (seed % 3)) * s;
    ctx.beginPath();
    ctx.ellipse(
      jitter(sx, seed + 100, 2 * s),
      jitter(sy, seed + 150, 2 * s),
      spotR, spotR * 0.7,
      (seed % 20) * 0.15, 0, TAU
    );
    ctx.fill();
    ctx.strokeStyle = 'hsla(0, 0%, 5%, 0.35)';
    ctx.lineWidth = 1.2 * s;
    ctx.stroke();
  }

  ctx.restore();
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  time: number
) {
  const s = scale / 40;

  // Abdomen — thick outline
  ctx.beginPath();
  ctx.ellipse(cx, cy + 15 * s, 5 * s, 22 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 6%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 2%)';
  ctx.lineWidth = 3 * s;
  ctx.stroke();

  // Thorax
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5 * s, 6 * s, 11 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 8%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 2%)';
  ctx.lineWidth = 3 * s;
  ctx.stroke();

  // Head — slightly oversized, anime-style
  ctx.beginPath();
  ctx.arc(cx, cy - 19 * s, 7 * s, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 6%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 2%)';
  ctx.lineWidth = 3 * s;
  ctx.stroke();

  // Big anime eyes — dramatic highlights
  for (const dir of [-1, 1]) {
    const ex = cx + dir * 3.5 * s;
    const ey = cy - 20 * s;
    // Eye white
    ctx.beginPath();
    ctx.arc(ex, ey, 3 * s, 0, TAU);
    ctx.fillStyle = 'hsl(30, 60%, 35%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(0, 0%, 2%)';
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    // Pupil
    ctx.beginPath();
    ctx.arc(ex + dir * 0.5 * s, ey + 0.3 * s, 1.8 * s, 0, TAU);
    ctx.fillStyle = 'hsl(0, 0%, 3%)';
    ctx.fill();
    // Anime highlight
    ctx.beginPath();
    ctx.arc(ex + dir * 1 * s, ey - 1 * s, 0.8 * s, 0, TAU);
    ctx.fillStyle = 'hsla(0, 0%, 100%, 0.9)';
    ctx.fill();
  }

  // Antennae — wiggly, expressive
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const dir of [-1, 1]) {
    ctx.strokeStyle = 'hsl(0, 0%, 4%)';
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 3 * s, cy - 25 * s);
    const wiggle = Math.sin(time * 3 + dir * 2) * 5 * s;
    ctx.bezierCurveTo(
      cx + dir * 12 * s + wiggle, cy - 45 * s,
      cx + dir * 22 * s - wiggle * 0.5, cy - 55 * s,
      cx + dir * 28 * s + wiggle * 0.3, cy - 52 * s
    );
    ctx.stroke();
    // Antenna tip — small blob
    ctx.beginPath();
    ctx.arc(cx + dir * 28 * s + wiggle * 0.3, cy - 52 * s, 3 * s, 0, TAU);
    ctx.fillStyle = 'hsl(25, 60%, 30%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(0, 0%, 2%)';
    ctx.lineWidth = 2 * s;
    ctx.stroke();
  }

  // Body segments — scratchy lines
  ctx.strokeStyle = 'hsla(30, 20%, 25%, 0.6)';
  ctx.lineWidth = 1 * s;
  for (let i = 0; i < 5; i++) {
    const y = cy + 5 * s + i * 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, y + Math.sin(i * 2.3) * s);
    ctx.lineTo(cx + 4 * s, y - Math.sin(i * 1.7) * s);
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
  // Outer ring — rough, hand-drawn style (draw multiple offset arcs)
  const progress = (stepCount % 1000) / 1000;
  for (let pass = 0; pass < 3; pass++) {
    const offsetR = radius + (Math.sin(pass * 50) * 2);
    ctx.beginPath();
    ctx.arc(cx + Math.sin(pass) * 0.5, cy + Math.cos(pass) * 0.5, offsetR, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
    ctx.strokeStyle = `hsla(28, 70%, 50%, ${0.08 + progress * 0.15})`;
    ctx.lineWidth = 1.5 + pass * 0.5;
    ctx.stroke();
  }

  // Full ring — faint scratchy
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.04)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);

  // Orbiting values — monospace, fading
  const displayCount = Math.min(12, history.length);
  for (let i = 0; i < displayCount; i++) {
    const val = history[history.length - 1 - i];
    const age = i / displayCount;
    const angle = -Math.PI / 2 + (i / displayCount) * TAU + time * 0.12;
    const orbitR = radius * (0.82 + age * 0.25);
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR;

    const alpha = 0.7 - age * 0.6;
    const size = 13 - age * 5;

    ctx.font = `bold ${Math.max(8, size)}px monospace`;
    ctx.fillStyle = `hsla(35, 60%, 60%, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(val).padStart(3, '0'), px, py);
  }

  // Pulsing dots — rough, irregular
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * TAU + time * 0.25;
    const wobble = Math.sin(time * 2 + i * 3) * 3;
    const px = cx + Math.cos(angle) * (radius + wobble);
    const py = cy + Math.sin(angle) * (radius + wobble);
    const pulse = 1.5 + Math.sin(time * 3 + i) * 0.8;
    ctx.beginPath();
    ctx.arc(px, py, pulse, 0, TAU);
    ctx.fillStyle = `hsla(30, 80%, 55%, ${0.15 + Math.sin(time * 2 + i) * 0.1})`;
    ctx.fill();
  }

  // Radiating scratch marks on step flash
  const flash = Math.max(0, 1 - (time % 1) * 3);
  if (flash > 0) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * TAU + cycleValue * 0.01;
      const innerR = radius * 0.25;
      const outerR = radius * (0.45 + flash * 0.35);
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(angle) * innerR + Math.sin(i * 7) * 2,
        cy + Math.sin(angle) * innerR + Math.cos(i * 5) * 2
      );
      ctx.lineTo(
        cx + Math.cos(angle) * outerR,
        cy + Math.sin(angle) * outerR
      );
      ctx.strokeStyle = `hsla(35, 70%, 55%, ${flash * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

// Floating debris — dust motes, pollen, imperfect particles
function drawAmbient(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, hue: number) {
  for (let i = 0; i < 30; i++) {
    const seed = i * 137.508;
    const px = (seed * 7.3) % w;
    const py = ((seed * 3.7 + time * 10) % (h + 40)) - 20;
    const size = 0.8 + (seed % 4);
    const alpha = 0.06 + Math.sin(time * 0.7 + i) * 0.04;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 0.3 + i);
    // Some are dots, some are tiny scratches
    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.strokeStyle = `hsla(${hue + 10}, 50%, 50%, ${alpha * 2})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, TAU);
      ctx.fillStyle = `hsla(${hue}, 40%, 45%, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

// Scanline / noise overlay for gritty feel
function drawNoiseOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Faint horizontal scanlines
  ctx.fillStyle = 'hsla(0, 0%, 0%, 0.03)';
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
  // Occasional flicker
  const flicker = Math.sin(time * 17) > 0.97 ? 0.04 : 0;
  if (flicker > 0) {
    ctx.fillStyle = `hsla(0, 0%, 100%, ${flicker})`;
    ctx.fillRect(0, 0, w, h);
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

    // Dark muted background — not pure black, slightly warm
    ctx.fillStyle = 'hsl(20, 8%, 4%)';
    ctx.fillRect(0, 0, w, h);

    // Ambient debris
    drawAmbient(ctx, w, h, timeRef.current, params.hue);

    // Glow — muted, sickly
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 3.5);
    glow.addColorStop(0, `hsla(${params.hue}, 50%, 35%, 0.08)`);
    glow.addColorStop(0.4, `hsla(${params.hue}, 40%, 25%, 0.04)`);
    glow.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Surrounding effects
    const effectRadius = scale * 3.2;
    drawSurroundingEffects(ctx, cx, cy, effectRadius, cycleValue, stepCount, timeRef.current, historyRef.current);

    // Wings & body
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'right', params, timeRef.current);
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'left', params, timeRef.current);
    drawBody(ctx, cx, cy, scale, timeRef.current);

    // Noise overlay for grit
    drawNoiseOverlay(ctx, w, h, timeRef.current);

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
      style={{ background: 'hsl(20, 8%, 4%)' }}
    />
  );
};
