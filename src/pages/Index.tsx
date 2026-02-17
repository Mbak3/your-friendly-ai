import { useModuloCycle } from '@/hooks/useModuloCycle';
import { ButterflyCanvas } from '@/components/game/ButterflyCanvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Sparkles } from 'lucide-react';

const Index = () => {
  const { current, stepCount, uniqueVisited, step, reset } = useModuloCycle();

  const flapPhase = (current % 1000) / 1000;
  const flapAngle = Math.abs(Math.sin(flapPhase * Math.PI * 2));
  const flapSpeed = 0.5 + ((current * 7) % 1000) / 1000 * 2;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ButterflyCanvas cycleValue={current} stepCount={stepCount} />

      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top info — raw, monospace */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
          <div className="pointer-events-auto space-y-1">
            <h1 className="text-lg font-mono font-bold text-foreground/80 tracking-widest uppercase"
                style={{ textShadow: '2px 2px 0 hsla(0,0%,0%,0.8)' }}>
              蝶 Modulo Butterfly
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-wide">
              x<sub>n+1</sub> = (x<sub>n</sub> − 101) mod 1000
            </p>
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <Badge variant="outline" className="font-mono text-xs bg-card/70 backdrop-blur border-border/40 text-foreground/70">
              {String(current).padStart(3, '0')}
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] bg-card/50 backdrop-blur text-muted-foreground">
              {stepCount} · {uniqueVisited}/1000
            </Badge>
          </div>
        </div>

        {/* Bottom controls — minimal, rough */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="flex justify-center gap-4 text-[10px] font-mono text-muted-foreground/60 tracking-wider">
              <span>angle {(flapAngle * 100).toFixed(0)}%</span>
              <span>·</span>
              <span>speed {flapSpeed.toFixed(1)}x</span>
            </div>

            <div className="flex gap-3 justify-center pointer-events-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reset()}
                className="bg-card/50 backdrop-blur border-border/40 font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                reset
              </Button>
              <Button
                size="lg"
                onClick={step}
                className="min-w-[180px] font-mono font-bold tracking-wider bg-primary/70 backdrop-blur hover:bg-primary transition-all border border-primary/30"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                flap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
