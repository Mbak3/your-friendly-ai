import { useRef, useEffect, useCallback } from 'react';

interface ButterflyCanvasProps {
  cycleValue: number;
  stepCount: number;
}

const TAU = Math.PI * 2;

// Poem fragments that orbit the moth
const POEM_LINES = [
  'asexual gold diggers',
  'life is never arithmetic',
  'your mind is the devil',
  'the rarest really isnt',
  'gods can do no wrong',
  'i accepted her faith',
  'women dont like sex',
  'they actually dont feel it',
  'look like sirens',
  '1 in a million',
  'youre a ten youre 1 in a million',
  'nine or less is where 95% lie',
  'what if she lied?',
  'i wasnt worthy of her face',
  'she was a goddess',
  'importance of arithmetic',
  'live long enough youll forget it',
  'trips and presents',
  'all you can eat dining',
  'he has no appetite',
];

function getCycleParams(value: number) {
  const v = value / 1000;
  return {
    // Acid punk palette — toxic greens, hot pinks, bile yellows
    hue: ((value * 3) % 360),
    saturation: 70 + (value % 200) / 200 * 25,
    lightness: 40 + (value % 150) / 150 * 25,
    veinBend: 0.5 + ((value * 3) % 1000) / 1000 * 1.0,
    spotSeed: (value * 13) % 1000,
    spotCount: 2 + ((value * 7) % 6),
    sizeMultiplier: 0.75 + ((value * 11) % 1000) / 1000 * 0.4,
    offsetX: Math.sin(v * TAU * 3) * 35,
    offsetY: Math.cos(v * TAU * 2) * 25,
    flapAngle: Math.abs(Math.sin(v * Math.PI * 2)),
    flapSpeed: 0.4 + ((value * 7) % 1000) / 1000 * 1.8,
    stripeWidth: 2.5 + ((value * 17) % 1000) / 1000 * 3.5,
    distortSeed: (value * 31) % 1000,
    // Tatter amount — how torn the wings are
    tatterAmount: 0.3 + ((value * 23) % 1000) / 1000 * 0.7,
    // Which acid color scheme
    colorScheme: Math.floor((value * 7) % 4),
  };
}

// Get punk color from scheme
function getPunkColors(scheme: number, hue: number) {
  const schemes = [
    // Toxic green + hot pink
    { primary: `hsl(120, 85%, 40%)`, secondary: `hsl(330, 90%, 50%)`, accent: `hsl(60, 100%, 50%)` },
    // Bile yellow + electric blue
    { primary: `hsl(55, 90%, 45%)`, secondary: `hsl(200, 100%, 50%)`, accent: `hsl(0, 90%, 45%)` },
    // Blood red + acid green
    { primary: `hsl(0, 80%, 40%)`, secondary: `hsl(90, 100%, 45%)`, accent: `hsl(280, 80%, 50%)` },
    // Bruise purple + safety orange
    { primary: `hsl(270, 60%, 35%)`, secondary: `hsl(25, 100%, 55%)`, accent: `hsl(170, 90%, 40%)` },
  ];
  return schemes[scheme % schemes.length];
}

function jitter(val: number, seed: number, amount: number): number {
  return val + Math.sin(seed * 137.508) * amount;
}

// Draw a tattered, moth-like wing
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
  const squeeze = 1 - effectiveFlap * 0.6;
  const s = scale / 40;
  const d = params.distortSeed;
  const tatter = params.tatterAmount;
  const colors = getPunkColors(params.colorScheme, params.hue);
  const j = (v: number, i: number) => jitter(v, d + i * 73, 4 * s * tatter);

  ctx.save();
  ctx.translate(cx, cy);

  // === Upper wing — ragged, torn edges ===
  ctx.beginPath();
  ctx.moveTo(0, 0);
  // Build wing with jagged control points
  const upperPoints: [number, number][] = [];
  const wingSpan = 100 * squeeze * s;
  const wingHeight = 85 * s;
  const segments = 14;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Base moth wing shape — broader, more rounded than butterfly
    const baseX = mirror * wingSpan * Math.sin(t * Math.PI * 0.85);
    const baseY = -wingHeight * (1 - t) * Math.sin(t * Math.PI);
    // Add tatter — jagged tears
    const tearX = Math.sin(d + i * 47) * 8 * s * tatter;
    const tearY = Math.cos(d + i * 31) * 6 * s * tatter;
    // Notches — missing chunks
    const notch = Math.sin(d + i * 97) > 0.7 ? -12 * s * tatter : 0;
    upperPoints.push([baseX + tearX + notch * mirror, baseY + tearY]);
  }

  ctx.moveTo(0, 0);
  for (let i = 0; i < upperPoints.length - 1; i++) {
    const [x1, y1] = upperPoints[i];
    const [x2, y2] = upperPoints[i + 1];
    const cpx = (x1 + x2) / 2 + Math.sin(d + i * 13) * 5 * s;
    const cpy = (y1 + y2) / 2 + Math.cos(d + i * 19) * 3 * s;
    ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  }
  ctx.lineTo(0, 0);
  ctx.closePath();

  // Flat punk fill — harsh gradient
  const grad = ctx.createLinearGradient(0, -wingHeight, mirror * wingSpan * 0.5, 0);
  grad.addColorStop(0, colors.primary);
  grad.addColorStop(0.4, colors.primary);
  grad.addColorStop(0.41, colors.secondary);
  grad.addColorStop(0.7, colors.secondary);
  grad.addColorStop(0.71, 'hsl(0, 0%, 5%)');
  grad.addColorStop(1, 'hsl(0, 0%, 5%)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Thick black outline — uneven, punk
  ctx.strokeStyle = 'hsl(0, 0%, 0%)';
  ctx.lineWidth = 5 * s;
  ctx.lineJoin = 'bevel';
  ctx.stroke();

  // X marks and slash marks across wings — punk patches
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const seed = (d + i * 200) % 1000;
    const px = mirror * (20 + seed % 50) * squeeze * s;
    const py = -(20 + seed % 40) * s;
    const sz = (8 + seed % 10) * s;
    // X mark
    ctx.beginPath();
    ctx.moveTo(px - sz / 2, py - sz / 2);
    ctx.lineTo(px + sz / 2, py + sz / 2);
    ctx.moveTo(px + sz / 2, py - sz / 2);
    ctx.lineTo(px - sz / 2, py + sz / 2);
    ctx.stroke();
  }

  // Scratchy veins — aggressive, angular
  ctx.strokeStyle = 'hsla(0, 0%, 0%, 0.8)';
  ctx.lineWidth = params.stripeWidth * s;
  ctx.lineCap = 'butt';
  const veinAngles = [-80, -55, -30, -5, 15];
  for (let vi = 0; vi < veinAngles.length; vi++) {
    const rad = (veinAngles[vi] * Math.PI) / 180;
    const len = (50 + Math.abs(veinAngles[vi]) * 0.3) * params.veinBend;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const segs = 4;
    for (let seg = 1; seg <= segs; seg++) {
      const t = seg / segs;
      const bx = mirror * len * t * squeeze * s * Math.cos(rad);
      const by = len * t * s * Math.sin(rad);
      const w = Math.sin(d + vi * 60 + seg * 40) * 5 * s;
      ctx.lineTo(bx + w, by + w * 0.3);
    }
    ctx.stroke();
  }

  // === Lower wing — smaller, more tattered ===
  ctx.beginPath();
  const lowerPoints: [number, number][] = [];
  const lSpan = 72 * squeeze * s;
  const lHeight = 65 * s;
  const lSegs = 10;
  for (let i = 0; i <= lSegs; i++) {
    const t = i / lSegs;
    const baseX = mirror * lSpan * Math.sin(t * Math.PI * 0.9);
    const baseY = lHeight * t * Math.sin(t * Math.PI * 0.7);
    const tearX = Math.sin(d + i * 53 + 500) * 7 * s * tatter;
    const tearY = Math.cos(d + i * 37 + 500) * 5 * s * tatter;
    const notch = Math.sin(d + i * 83 + 500) > 0.75 ? -10 * s * tatter : 0;
    lowerPoints.push([baseX + tearX + notch * mirror, baseY + tearY]);
  }
  ctx.moveTo(0, 0);
  for (let i = 0; i < lowerPoints.length - 1; i++) {
    const [x1, y1] = lowerPoints[i];
    const [x2, y2] = lowerPoints[i + 1];
    const cpx = (x1 + x2) / 2 + Math.sin(d + i * 17 + 500) * 4 * s;
    const cpy = (y1 + y2) / 2;
    ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  }
  ctx.lineTo(0, 0);
  ctx.closePath();

  const lGrad = ctx.createLinearGradient(0, 0, mirror * lSpan * 0.5, lHeight);
  lGrad.addColorStop(0, colors.secondary);
  lGrad.addColorStop(0.55, colors.secondary);
  lGrad.addColorStop(0.56, colors.primary);
  lGrad.addColorStop(1, 'hsl(0, 0%, 8%)');
  ctx.fillStyle = lGrad;
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 0%)';
  ctx.lineWidth = 5 * s;
  ctx.lineJoin = 'bevel';
  ctx.stroke();

  // Safety pin marks on lower wing
  ctx.strokeStyle = 'hsla(0, 0%, 80%, 0.6)';
  ctx.lineWidth = 1.5 * s;
  for (let i = 0; i < 2; i++) {
    const seed = (d + i * 300 + 700) % 1000;
    const px = mirror * (15 + seed % 40) * squeeze * s;
    const py = (15 + seed % 30) * s;
    // Simple pin shape
    ctx.beginPath();
    ctx.arc(px, py, 4 * s, 0, Math.PI);
    ctx.lineTo(px - 4 * s, py + 8 * s);
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

  // Thick dark body
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12 * s, 5.5 * s, 24 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 4%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 0%)';
  ctx.lineWidth = 4 * s;
  ctx.stroke();

  // Thorax
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8 * s, 7 * s, 12 * s, 0, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 6%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 0%)';
  ctx.lineWidth = 4 * s;
  ctx.stroke();

  // Head — big, expressive
  ctx.beginPath();
  ctx.arc(cx, cy - 22 * s, 8 * s, 0, TAU);
  ctx.fillStyle = 'hsl(0, 0%, 5%)';
  ctx.fill();
  ctx.strokeStyle = 'hsl(0, 0%, 0%)';
  ctx.lineWidth = 4 * s;
  ctx.stroke();

  // Eyes — dead, hollow, punk
  for (const dir of [-1, 1]) {
    const ex = cx + dir * 4 * s;
    const ey = cy - 23 * s;
    // Hollow circle eye
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5 * s, 0, TAU);
    ctx.fillStyle = 'hsl(0, 0%, 0%)';
    ctx.fill();
    ctx.strokeStyle = 'hsl(0, 80%, 45%)';
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    // Tiny angry pupil
    ctx.beginPath();
    ctx.arc(ex, ey + 0.5 * s, 1 * s, 0, TAU);
    ctx.fillStyle = 'hsl(0, 90%, 50%)';
    ctx.fill();
    // X through the eye (dead punk)
    if (Math.sin(time * 0.5 + dir) > 0.3) {
      ctx.strokeStyle = 'hsl(0, 90%, 50%)';
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(ex - 2 * s, ey - 2 * s);
      ctx.lineTo(ex + 2 * s, ey + 2 * s);
      ctx.moveTo(ex + 2 * s, ey - 2 * s);
      ctx.lineTo(ex - 2 * s, ey + 2 * s);
      ctx.stroke();
    }
  }

  // Antennae — sharp, aggressive
  for (const dir of [-1, 1]) {
    ctx.strokeStyle = 'hsl(0, 0%, 2%)';
    ctx.lineWidth = 3 * s;
    ctx.lineCap = 'round';
    const twitch = Math.sin(time * 5 + dir * 3) * 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx + dir * 4 * s, cy - 29 * s);
    ctx.lineTo(cx + dir * 18 * s + twitch, cy - 52 * s);
    ctx.lineTo(cx + dir * 30 * s + twitch * 0.5, cy - 48 * s);
    ctx.stroke();
    // Spike tip
    ctx.beginPath();
    ctx.arc(cx + dir * 30 * s + twitch * 0.5, cy - 48 * s, 2.5 * s, 0, TAU);
    ctx.fillStyle = 'hsl(0, 0%, 2%)';
    ctx.fill();
  }

  // Body segments — harsh scratches
  ctx.strokeStyle = 'hsla(0, 0%, 30%, 0.5)';
  ctx.lineWidth = 1.5 * s;
  for (let i = 0; i < 6; i++) {
    const y = cy + i * 6 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 5 * s, y);
    ctx.lineTo(cx + 5 * s, y);
    ctx.stroke();
  }
}

// Floating poem fragments + glitch effects
function drawSurroundingEffects(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  cycleValue: number,
  stepCount: number,
  time: number,
  history: number[],
  w: number,
  h: number
) {
  // Orbiting poem fragments
  const lineCount = Math.min(8, POEM_LINES.length);
  for (let i = 0; i < lineCount; i++) {
    const lineIdx = (Math.floor(cycleValue / 100) + i) % POEM_LINES.length;
    const line = POEM_LINES[lineIdx];
    const age = i / lineCount;
    const angle = (i / lineCount) * TAU + time * 0.08;
    const orbitR = radius * (0.7 + age * 0.5);
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR;

    const alpha = 0.5 - age * 0.4;
    const size = 11 - age * 4;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 0.3 + i) * 0.15);
    ctx.font = `italic ${Math.max(7, size)}px monospace`;
    ctx.fillStyle = `hsla(0, 0%, 70%, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line, 0, 0);
    ctx.restore();
  }

  // Cycle progress — rough dashed ring
  const progress = (stepCount % 1000) / 1000;
  ctx.setLineDash([6, 8]);
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    ctx.arc(cx + (pass - 0.5) * 1.5, cy, radius * 0.5, -Math.PI / 2, -Math.PI / 2 + TAU * progress);
    ctx.strokeStyle = `hsla(0, 70%, 50%, ${0.1 + progress * 0.2})`;
    ctx.lineWidth = 2 + pass;
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Orbiting numbers — raw
  const displayCount = Math.min(10, history.length);
  for (let i = 0; i < displayCount; i++) {
    const val = history[history.length - 1 - i];
    const age = i / displayCount;
    const angle = -Math.PI / 2 + (i / displayCount) * TAU + time * 0.15;
    const orbitR = radius * 0.45 * (0.8 + age * 0.3);
    const px = cx + Math.cos(angle) * orbitR;
    const py = cy + Math.sin(angle) * orbitR;

    const alpha = 0.6 - age * 0.5;
    ctx.font = `bold ${Math.max(8, 12 - age * 5)}px monospace`;
    ctx.fillStyle = `hsla(55, 80%, 55%, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.fillText(String(val).padStart(3, '0'), px, py);
  }

  // Glitch lines — horizontal tears across screen
  const glitchIntensity = Math.sin(time * 7) > 0.85 ? 1 : Math.sin(time * 13) > 0.95 ? 0.5 : 0;
  if (glitchIntensity > 0) {
    for (let i = 0; i < 5; i++) {
      const gy = (Math.sin(time * 17 + i * 100) * 0.5 + 0.5) * h;
      const gw = 50 + Math.sin(time * 23 + i * 50) * 200;
      const gx = Math.sin(time * 11 + i * 70) * 40;
      ctx.fillStyle = `hsla(${(cycleValue + i * 60) % 360}, 90%, 50%, ${0.15 * glitchIntensity})`;
      ctx.fillRect(gx, gy, gw, 2 + Math.random() * 3);
    }
  }
}

// Ambient — floating ash, embers, debris
function drawAmbient(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  for (let i = 0; i < 35; i++) {
    const seed = i * 137.508;
    const px = (seed * 7.3 + Math.sin(time * 0.5 + i) * 20) % w;
    const py = ((seed * 3.7 + time * 8) % (h + 40)) - 20;
    const alpha = 0.04 + Math.sin(time * 0.5 + i) * 0.03;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 0.2 + i * 0.5);

    if (i % 4 === 0) {
      // Tiny X
      const sz = 2 + (seed % 3);
      ctx.strokeStyle = `hsla(0, 60%, 50%, ${alpha * 3})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-sz, -sz); ctx.lineTo(sz, sz);
      ctx.moveTo(sz, -sz); ctx.lineTo(-sz, sz);
      ctx.stroke();
    } else if (i % 3 === 0) {
      // Dash
      ctx.strokeStyle = `hsla(55, 70%, 50%, ${alpha * 2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-3, 0); ctx.lineTo(3, 0);
      ctx.stroke();
    } else {
      // Dot
      ctx.beginPath();
      ctx.arc(0, 0, 1 + (seed % 2), 0, TAU);
      ctx.fillStyle = `hsla(0, 0%, 60%, ${alpha})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

// Scanlines + VHS noise
function drawNoiseOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Scanlines
  ctx.fillStyle = 'hsla(0, 0%, 0%, 0.04)';
  for (let y = 0; y < h; y += 2) {
    ctx.fillRect(0, y, w, 1);
  }
  // VHS tracking error
  const trackingError = Math.sin(time * 11) > 0.92;
  if (trackingError) {
    const bandY = (time * 100) % h;
    const bandH = 15 + Math.sin(time * 30) * 10;
    ctx.save();
    ctx.globalAlpha = 0.08;
    // Shift a horizontal band
    ctx.drawImage(ctx.canvas, 0, bandY, w, bandH, 8, bandY, w, bandH);
    ctx.restore();
  }
  // Occasional full-screen flicker
  if (Math.sin(time * 19) > 0.98) {
    ctx.fillStyle = 'hsla(0, 0%, 100%, 0.03)';
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
    const baseScale = Math.min(w, h) * 0.18;

    timeRef.current += 0.016 * params.flapSpeed;

    prevFlapRef.current += (params.flapAngle - prevFlapRef.current) * 0.08;
    const breathe = Math.sin(timeRef.current * 1.5) * 0.03;
    const effectiveFlap = Math.max(0, Math.min(1, prevFlapRef.current + breathe));

    const targetX = baseCx + params.offsetX;
    const targetY = baseCy + params.offsetY;
    const targetScale = baseScale * params.sizeMultiplier;
    prevPosRef.current.x += (targetX - prevPosRef.current.x) * 0.05;
    prevPosRef.current.y += (targetY - prevPosRef.current.y) * 0.05;
    prevPosRef.current.scale += (targetScale - prevPosRef.current.scale) * 0.05;

    const cx = prevPosRef.current.x;
    const cy = prevPosRef.current.y;
    const scale = prevPosRef.current.scale;

    // Near-black background
    ctx.fillStyle = 'hsl(0, 0%, 2%)';
    ctx.fillRect(0, 0, w, h);

    // Ambient debris
    drawAmbient(ctx, w, h, timeRef.current);

    // Dim toxic glow behind moth
    const colors = getPunkColors(params.colorScheme, params.hue);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 4);
    glow.addColorStop(0, 'hsla(0, 70%, 30%, 0.06)');
    glow.addColorStop(0.3, 'hsla(0, 50%, 20%, 0.03)');
    glow.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Surrounding effects
    const effectRadius = scale * 3.5;
    drawSurroundingEffects(ctx, cx, cy, effectRadius, cycleValue, stepCount, timeRef.current, historyRef.current, w, h);

    // Moth
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'right', params, timeRef.current);
    drawWing(ctx, cx, cy, scale, effectiveFlap, 'left', params, timeRef.current);
    drawBody(ctx, cx, cy, scale, timeRef.current);

    // Noise overlay
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
      style={{ background: 'hsl(0, 0%, 2%)' }}
    />
  );
};
