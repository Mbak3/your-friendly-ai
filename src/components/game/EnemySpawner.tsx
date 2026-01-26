import { useState, useEffect, useRef } from 'react';
import { Skull, Ghost, Bug, Flame, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Enemy {
  id: number;
  name: string;
  type: 'minion' | 'normal' | 'elite' | 'boss';
  health: number;
  position: { x: number; y: number };
  icon: React.ReactNode;
  spawnValue: number;
}

const ENEMY_TYPES = [
  { name: 'Slime', type: 'minion' as const, icon: <Bug className="h-full w-full" />, healthMod: 0.5 },
  { name: 'Ghost', type: 'minion' as const, icon: <Ghost className="h-full w-full" />, healthMod: 0.6 },
  { name: 'Skeleton', type: 'normal' as const, icon: <Skull className="h-full w-full" />, healthMod: 1 },
  { name: 'Fire Elemental', type: 'elite' as const, icon: <Flame className="h-full w-full" />, healthMod: 2 },
  { name: 'Thunder Lord', type: 'elite' as const, icon: <Zap className="h-full w-full" />, healthMod: 2.5 },
  { name: 'Demon King', type: 'boss' as const, icon: <Crown className="h-full w-full" />, healthMod: 5 },
];

const TYPE_COLORS = {
  minion: 'bg-muted/80 text-muted-foreground border-muted',
  normal: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  elite: 'bg-purple-500/30 text-purple-300 border-purple-400',
  boss: 'bg-red-500/40 text-red-300 border-red-400 animate-pulse',
};

const TYPE_SIZES = {
  minion: 'h-8 w-8',
  normal: 'h-10 w-10',
  elite: 'h-12 w-12',
  boss: 'h-16 w-16',
};

interface EnemySpawnerProps {
  cycleValue: number;
  onSpawn: () => void;
  stepCount: number;
}

const getEnemyFromCycle = (value: number, id: number): Enemy => {
  // Position determined by cycle value
  const x = (value % 100) * 3; // 0-297 -> maps to grid
  const y = Math.floor(value / 100) * 30; // 0-270

  // Enemy type determined by value ranges
  // Minions: 0-699 (70%), Normal: 700-849 (15%), Elite: 850-949 (10%), Boss: 950-999 (5%)
  let typeIndex: number;
  let type: 'minion' | 'normal' | 'elite' | 'boss';
  
  if (value >= 950) {
    type = 'boss';
    typeIndex = 5;
  } else if (value >= 850) {
    type = 'elite';
    typeIndex = 3 + (value % 2);
  } else if (value >= 700) {
    type = 'normal';
    typeIndex = 2;
  } else {
    type = 'minion';
    typeIndex = value % 2;
  }

  const enemyType = ENEMY_TYPES[typeIndex];
  const baseHealth = 20 + (value % 50);

  return {
    id,
    name: enemyType.name,
    type,
    health: Math.floor(baseHealth * enemyType.healthMod),
    position: { x, y },
    icon: enemyType.icon,
    spawnValue: value,
  };
};

export const EnemySpawner = ({ cycleValue, onSpawn, stepCount }: EnemySpawnerProps) => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [isSpawning, setIsSpawning] = useState(false);
  const [spawnStats, setSpawnStats] = useState({
    minion: 0, normal: 0, elite: 0, boss: 0
  });
  const arenaRef = useRef<HTMLDivElement>(null);
  const enemyIdRef = useRef(0);

  const handleSpawn = () => {
    setIsSpawning(true);
    const newEnemy = getEnemyFromCycle(cycleValue, enemyIdRef.current++);
    
    setTimeout(() => {
      setEnemies(prev => [...prev.slice(-24), newEnemy]);
      setSpawnStats(prev => ({
        ...prev,
        [newEnemy.type]: prev[newEnemy.type] + 1
      }));
      onSpawn();
      setIsSpawning(false);
    }, 150);
  };

  const handleDefeat = (id: number) => {
    setEnemies(prev => prev.filter(e => e.id !== id));
  };

  const totalSpawns = Object.values(spawnStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Spawn Control */}
      <Card className="border-destructive/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Enemy Spawner</span>
            <Badge variant="outline" className="font-mono text-lg">
              Wave Seed: {String(cycleValue).padStart(3, '0')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            size="lg" 
            variant="destructive"
            onClick={handleSpawn}
            disabled={isSpawning}
            className="w-full h-14 text-lg font-bold"
          >
            {isSpawning ? '⚔️ Spawning...' : '👹 Spawn Enemy'}
          </Button>

          {/* Next spawn preview */}
          <div className="text-center text-sm text-muted-foreground">
            Next spawn type: {' '}
            <span className="font-bold">
              {cycleValue >= 950 ? '👑 BOSS' : 
               cycleValue >= 850 ? '⚡ Elite' : 
               cycleValue >= 700 ? '💀 Normal' : '🐛 Minion'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Arena */}
      <Card className="bg-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Battle Arena</span>
            <span className="text-sm font-normal text-muted-foreground">
              {enemies.length} enemies active
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={arenaRef}
            className="relative h-[300px] bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg border border-border overflow-hidden"
          >
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-foreground/20" />
              ))}
            </div>

            {/* Enemies */}
            {enemies.map((enemy) => (
              <div
                key={enemy.id}
                className={`absolute cursor-pointer transition-all duration-300 hover:scale-125 rounded-full border-2 p-1 ${TYPE_COLORS[enemy.type]} ${TYPE_SIZES[enemy.type]}`}
                style={{
                  left: `${(enemy.position.x / 300) * 100}%`,
                  top: `${(enemy.position.y / 300) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => handleDefeat(enemy.id)}
                title={`${enemy.name} (HP: ${enemy.health}) - Click to defeat`}
              >
                {enemy.icon}
              </div>
            ))}

            {enemies.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Arena is clear! Spawn enemies to begin.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Spawn Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(spawnStats).map(([type, count]) => (
            <div key={type} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{type}</span>
                <span className="text-muted-foreground">
                  {count} ({totalSpawns > 0 ? ((count / totalSpawns) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Progress 
                value={totalSpawns > 0 ? (count / totalSpawns) * 100 : 0} 
                className="h-2"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            Total spawns: {totalSpawns} | Cycle uses deterministic LCG pattern
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
