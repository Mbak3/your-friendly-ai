import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  hue: number;
  alpha: number;
  wing: 'left' | 'right';
}

interface ButterflyCanvasProps {
  cycleValue: number;
  stepCount: number;
}

const TAU = Math.PI * 2;

// Generate butterfly wing shape points using parametric equations
function generateButterflyPoints(
  cx: number,
  cy: number,
  scale: number,
  flapAngle: number,
  side: 'left' | 'right'
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const steps = 80;
  const mirror = side === 'left' ? -1 : 1;
  // flapAngle: 0 = fully open, 1 = fully closed
  const squeeze = 1 - flapAngle * 0.7;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI;
    // Butterfly curve (modified polar rose)
    const r =
      Math.exp(Math.sin(t)) -
      2 * Math.cos(4 * t) +
      Math.pow(Math.sin((2 * t - Math.PI) / 24), 5);
    const bx = r * Math.sin(t) * mirror * squeeze;
    const by = -r * Math.cos(t);
    points.push({
      x: cx + bx * scale,
      y: cy + by * scale,
    });
  }
  return points;
}

function createParticles(
  cx: number,
  cy: number,
  scale: number,
  flapAngle: number
): Particle[] {
  const particles: Particle[] = [];
  const sides: ('left' | 'right')[] = ['left', 'right'];

  for (const side of sides) {
    const pts = generateButterflyPoints(cx, cy, scale, flapAngle, side);
    // Fill wings with particles
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      // Add particles along the edge and fill inward
      const edgeDist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const density = Math.max(1, Math.floor(edgeDist / 3));

      for (let d = 0; d < density; d++) {
        const t = d / density;
        const ex = p1.x + (p2.x - p1.x) * t;
        const ey = p1.y + (p2.y - p1.y) * t;
        // Fill from edge toward center
        const fillSteps = Math.max(1, Math.floor(Math.abs(ex - cx) / 8));
        for (let f = 0; f <= fillSteps; f++) {
          const ft = f / fillSteps;
          const fx = ex + (cx - ex) * ft * 0.3;
          const fy = ey + (cy - ey) * ft * 0.15;
          const distFromCenter = Math.sqrt((fx - cx) ** 2 + (fy - cy) ** 2);
          const normalizedDist = distFromCenter / (scale * 3);
          particles.push({
            x: fx + (Math.random() - 0.5) * 4,
            y: fy + (Math.random() - 0.5) * 4,
            baseX: fx,
            baseY: fy,
            size: 1.5 + Math.random() * 2.5,
            hue: 262 + (normalizedDist * 60) + (Math.random() - 0.5) * 30,
            alpha: 0.4 + Math.random() * 0.5,
            wing: side,
          });
        }
      }
    }
  }
  return particles;
}

export const ButterflyCanvas = ({ cycleValue, stepCount }: ButterflyCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const prevFlapRef = useRef(0);

  // Map cycle value to flap parameters
  // Flap angle: 0-999 → 0-1 (how closed the wings are)
  const flapPhase = (cycleValue % 1000) / 1000;
  // Use sine to make it oscillate naturally
  const flapAngle = Math.abs(Math.sin(flapPhase * Math.PI * 2));
  // Speed: derived from different part of cycle value
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
    const scale = Math.min(w, h) * 0.08;

    timeRef.current += 0.016 * flapSpeed;

    // Smooth interpolation toward target flap angle
    prevFlapRef.current += (flapAngle - prevFlapRef.current) * 0.08;
    const currentFlap = prevFlapRef.current;

    // Regenerate particles for new flap position
    particlesRef.current = createParticles(cx, cy, scale, currentFlap);

    // Clear with trail effect
    ctx.fillStyle = `hsla(240, 10%, 4%, 0.15)`;
    ctx.fillRect(0, 0, w, h);

    // Draw body
    ctx.beginPath();
    ctx.ellipse(cx, cy, 2, scale * 1.2, 0, 0, TAU);
    ctx.fillStyle = `hsla(262, 60%, 40%, 0.9)`;
    ctx.fill();

    // Draw antennae
    const antennaLen = scale * 0.8;
    ctx.strokeStyle = `hsla(262, 60%, 50%, 0.7)`;
    ctx.lineWidth = 1.5;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - scale * 0.8);
      ctx.quadraticCurveTo(
        cx + dir * scale * 0.4,
        cy - scale * 1.5,
        cx + dir * scale * 0.5,
        cy - scale * 1.3 - antennaLen * 0.3
      );
      ctx.stroke();
      // Antenna tip
      ctx.beginPath();
      ctx.arc(
        cx + dir * scale * 0.5,
        cy - scale * 1.3 - antennaLen * 0.3,
        3,
        0,
        TAU
      );
      ctx.fillStyle = `hsla(262, 83%, 58%, 0.9)`;
      ctx.fill();
    }

    // Draw particles
    const breathe = Math.sin(timeRef.current * 2) * 2;

    for (const p of particlesRef.current) {
      const jitterX = (Math.random() - 0.5) * 1.5;
      const jitterY = (Math.random() - 0.5) * 1.5;
      const bx = p.wing === 'left' ? -breathe * 0.3 : breathe * 0.3;

      ctx.beginPath();
      ctx.arc(p.x + jitterX + bx, p.y + jitterY + breathe * 0.2, p.size, 0, TAU);
      const saturation = 60 + currentFlap * 25;
      const lightness = 45 + (1 - currentFlap) * 20;
      ctx.fillStyle = `hsla(${p.hue}, ${saturation}%, ${lightness}%, ${p.alpha})`;
      ctx.fill();
    }

    // Glow effect at center
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.5);
    gradient.addColorStop(0, `hsla(262, 83%, 58%, 0.3)`);
    gradient.addColorStop(1, `hsla(262, 83%, 58%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - scale, cy - scale, scale * 2, scale * 2);

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
