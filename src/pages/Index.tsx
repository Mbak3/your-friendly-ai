import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useModuloCycle } from '@/hooks/useModuloCycle';
import { LootSystem } from '@/components/game/LootSystem';
import { EnemySpawner } from '@/components/game/EnemySpawner';
import { CycleVisualizer } from '@/components/game/CycleVisualizer';
import { MathExplainer } from '@/components/game/MathExplainer';
import { RotateCcw, Play, Pause, FastForward } from 'lucide-react';

const Index = () => {
  const [autoPlay, setAutoPlay] = useState(false);
  const { current, history, stepCount, uniqueVisited, cycleComplete, step, reset } = useModuloCycle();

  // Auto-play functionality
  useState(() => {
    if (!autoPlay) return;
    const interval = setInterval(step, 200);
    return () => clearInterval(interval);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Modulo Cycle Game Mechanics
              </h1>
              <p className="text-sm text-muted-foreground">
                Demonstrating deterministic pseudorandomness using x<sub>n+1</sub> = (x<sub>n</sub> - 101) mod 1000
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => reset()}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={step}>
                <FastForward className="h-4 w-4 mr-2" />
                Step
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Visualizer */}
          <div className="space-y-6">
            <CycleVisualizer
              current={current}
              history={history}
              stepCount={stepCount}
              uniqueVisited={uniqueVisited}
              cycleComplete={cycleComplete}
            />
            <MathExplainer />
          </div>

          {/* Right Column - Game Demos */}
          <div>
            <Tabs defaultValue="loot" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="loot" className="flex-1">🎁 Loot Drops</TabsTrigger>
                <TabsTrigger value="enemies" className="flex-1">👹 Enemy Spawns</TabsTrigger>
              </TabsList>
              
              <TabsContent value="loot" className="mt-0">
                <LootSystem 
                  cycleValue={current} 
                  onDrop={step}
                  dropCount={stepCount}
                />
              </TabsContent>
              
              <TabsContent value="enemies" className="mt-0">
                <EnemySpawner 
                  cycleValue={current} 
                  onSpawn={step}
                  stepCount={stepCount}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Because 101 is coprime with 1000, this sequence visits all 1000 values exactly once before repeating.
          </p>
          <p className="mt-1">
            This pattern is used in games for fair loot tables, procedural generation, and reproducible randomness.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
