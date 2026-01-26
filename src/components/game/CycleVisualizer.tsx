import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CycleVisualizerProps {
  current: number;
  history: number[];
  stepCount: number;
  uniqueVisited: number;
  cycleComplete: boolean;
}

export const CycleVisualizer = ({
  current,
  history,
  stepCount,
  uniqueVisited,
  cycleComplete,
}: CycleVisualizerProps) => {
  // Create a 32x32 grid (1024 cells, but only 1000 used)
  const gridSize = 32;
  const totalCells = gridSize * gridSize;

  const visitedCells = useMemo(() => {
    const cells = new Set<number>();
    // Calculate all visited values based on step count
    let value = history[0] || 500;
    cells.add(value);
    for (let i = 0; i < stepCount; i++) {
      value = value - 101;
      if (value < 0) value += 1000;
      if (value < totalCells) cells.add(value);
    }
    return cells;
  }, [stepCount, history, totalCells]);

  const recentCells = useMemo(() => {
    return new Set(history.slice(-10));
  }, [history]);

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>Cycle Visualization</span>
          <div className="flex gap-2">
            <Badge variant={cycleComplete ? "default" : "outline"} className="font-mono">
              {uniqueVisited}/1000 visited
            </Badge>
            <Badge variant="secondary" className="font-mono">
              Step {stepCount}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current value display */}
        <div className="mb-4 text-center">
          <div className="text-6xl font-mono font-bold text-primary">
            {String(current).padStart(3, '0')}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            x<sub>n+1</sub> = (x<sub>n</sub> - 101) mod 1000
          </p>
        </div>

        {/* Grid visualization */}
        <div 
          className="grid gap-px bg-border rounded-lg overflow-hidden mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: '100%',
            aspectRatio: '1/1',
          }}
        >
          {Array.from({ length: totalCells }).map((_, i) => {
            const isValid = i < 1000;
            const isCurrent = i === current;
            const isRecent = recentCells.has(i);
            const isVisited = visitedCells.has(i);

            let cellClass = 'bg-muted/30';
            if (!isValid) {
              cellClass = 'bg-background';
            } else if (isCurrent) {
              cellClass = 'bg-primary animate-pulse';
            } else if (isRecent) {
              cellClass = 'bg-primary/60';
            } else if (isVisited) {
              cellClass = 'bg-primary/30';
            }

            return (
              <div
                key={i}
                className={`aspect-square transition-colors duration-150 ${cellClass}`}
                title={isValid ? `Value: ${i}` : 'Unused'}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-primary animate-pulse" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <span>Recent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/30" />
            <span>Unvisited</span>
          </div>
        </div>

        {/* History trail */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Recent sequence:</p>
          <div className="flex flex-wrap gap-1">
            {history.slice(-20).map((val, i) => (
              <Badge 
                key={i} 
                variant={i === history.slice(-20).length - 1 ? "default" : "outline"}
                className="font-mono text-xs"
              >
                {String(val).padStart(3, '0')}
              </Badge>
            ))}
          </div>
        </div>

        {cycleComplete && (
          <div className="mt-4 p-4 bg-primary/20 rounded-lg text-center border border-primary/30">
            <p className="font-bold text-primary">🎉 Full Cycle Complete!</p>
            <p className="text-sm text-muted-foreground">
              All 1000 values visited exactly once
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
