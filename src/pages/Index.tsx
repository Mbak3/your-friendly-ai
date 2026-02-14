import { useModuloCycle } from '@/hooks/useModuloCycle';
import { ButterflyCanvas } from '@/components/game/ButterflyCanvas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Sparkles } from 'lucide-react';

const Index = () => {
  const { current, stepCount, uniqueVisited, step, reset } = useModuloCycle();

  // Derive flap info for display
  const flapPhase = (current % 1000) / 1000;
  const flapAngle = Math.abs(Math.sin(flapPhase * Math.PI * 2));
  const flapSpeed = 0.5 + ((current * 7) % 1000) / 1000 * 2;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Canvas background */}
      <ButterflyCanvas cycleValue={current} stepCount={stepCount} />

      {/* Overlay UI */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top info bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
          <div className="pointer-events-auto space-y-2">
            <h1 className="text-xl font-bold text-foreground/90 drop-shadow-lg">
              Modulo Butterfly
            </h1>
            <p className="text-xs text-muted-foreground max-w-xs">
              x<sub>n+1</sub> = (x<sub>n</sub> - 101) mod 1000 — each step changes the flap pattern
            </p>
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <Badge variant="outline" className="font-mono text-sm bg-background/60 backdrop-blur">
              Seed: {String(current).padStart(3, '0')}
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs bg-background/60 backdrop-blur">
              Step {stepCount} · {uniqueVisited}/1000
            </Badge>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-md mx-auto space-y-4">
            {/* Flap stats */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Angle: {(flapAngle * 100).toFixed(0)}%</span>
              <span>•</span>
              <span>Speed: {flapSpeed.toFixed(2)}x</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center pointer-events-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={() => reset()}
                className="bg-background/60 backdrop-blur border-border/50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="lg"
                onClick={step}
                className="min-w-[200px] text-lg font-bold bg-primary/80 backdrop-blur hover:bg-primary transition-all hover:scale-105"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Flap Wings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
