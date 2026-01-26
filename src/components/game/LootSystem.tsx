import { useEffect, useState } from 'react';
import { Sword, Shield, Heart, Star, Gem, Crown, Zap, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LootItem {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: React.ReactNode;
  value: number;
}

const LOOT_TABLE: LootItem[] = [
  { id: 'sword', name: 'Iron Sword', rarity: 'common', icon: <Sword className="h-6 w-6" />, value: 10 },
  { id: 'shield', name: 'Wooden Shield', rarity: 'common', icon: <Shield className="h-6 w-6" />, value: 8 },
  { id: 'heart', name: 'Health Potion', rarity: 'common', icon: <Heart className="h-6 w-6" />, value: 5 },
  { id: 'star', name: 'Lucky Charm', rarity: 'uncommon', icon: <Star className="h-6 w-6" />, value: 25 },
  { id: 'gem', name: 'Ruby Gem', rarity: 'rare', icon: <Gem className="h-6 w-6" />, value: 100 },
  { id: 'crown', name: 'Golden Crown', rarity: 'epic', icon: <Crown className="h-6 w-6" />, value: 500 },
  { id: 'zap', name: 'Thunder Staff', rarity: 'epic', icon: <Zap className="h-6 w-6" />, value: 450 },
  { id: 'flame', name: 'Dragon Essence', rarity: 'legendary', icon: <Flame className="h-6 w-6" />, value: 1000 },
  { id: 'sparkle', name: 'Cosmic Artifact', rarity: 'legendary', icon: <Sparkles className="h-6 w-6" />, value: 2000 },
];

const RARITY_COLORS = {
  common: 'bg-muted text-muted-foreground border-border',
  uncommon: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  epic: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  legendary: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'shadow-emerald-500/30',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/40',
  legendary: 'shadow-amber-500/50 animate-pulse',
};

interface LootSystemProps {
  cycleValue: number;
  onDrop: () => void;
  dropCount: number;
}

const getLootFromCycle = (value: number): LootItem => {
  // Map the 0-999 cycle value to loot probabilities
  // Common: 0-599 (60%), Uncommon: 600-799 (20%), Rare: 800-899 (10%)
  // Epic: 900-974 (7.5%), Legendary: 975-999 (2.5%)
  
  const commons = LOOT_TABLE.filter(l => l.rarity === 'common');
  const uncommons = LOOT_TABLE.filter(l => l.rarity === 'uncommon');
  const rares = LOOT_TABLE.filter(l => l.rarity === 'rare');
  const epics = LOOT_TABLE.filter(l => l.rarity === 'epic');
  const legendaries = LOOT_TABLE.filter(l => l.rarity === 'legendary');

  if (value >= 975) {
    return legendaries[value % legendaries.length];
  } else if (value >= 900) {
    return epics[value % epics.length];
  } else if (value >= 800) {
    return rares[value % rares.length];
  } else if (value >= 600) {
    return uncommons[value % uncommons.length];
  } else {
    return commons[value % commons.length];
  }
};

export const LootSystem = ({ cycleValue, onDrop, dropCount }: LootSystemProps) => {
  const [inventory, setInventory] = useState<LootItem[]>([]);
  const [lastDrop, setLastDrop] = useState<LootItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rarityStats, setRarityStats] = useState({
    common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0
  });

  const handleDrop = () => {
    setIsAnimating(true);
    const loot = getLootFromCycle(cycleValue);
    
    setTimeout(() => {
      setLastDrop(loot);
      setInventory(prev => [...prev.slice(-19), loot]);
      setRarityStats(prev => ({
        ...prev,
        [loot.rarity]: prev[loot.rarity] + 1
      }));
      onDrop();
      setIsAnimating(false);
    }, 300);
  };

  const totalDrops = Object.values(rarityStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Drop Button & Current Value */}
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Loot Drop System</span>
            <Badge variant="outline" className="font-mono text-lg">
              Seed: {String(cycleValue).padStart(3, '0')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleDrop}
              disabled={isAnimating}
              className="w-full h-16 text-xl font-bold transition-all hover:scale-105"
            >
              {isAnimating ? '✨ Opening...' : '🎁 Open Loot Chest'}
            </Button>
          </div>

          {/* Last Drop Display */}
          {lastDrop && (
            <div className={`p-4 rounded-lg border-2 transition-all duration-500 shadow-lg ${RARITY_COLORS[lastDrop.rarity]} ${RARITY_GLOW[lastDrop.rarity]}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-background/50">
                  {lastDrop.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{lastDrop.name}</p>
                  <p className="text-sm opacity-80 capitalize">{lastDrop.rarity} • {lastDrop.value} gold</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Drop Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(rarityStats).map(([rarity, count]) => (
            <div key={rarity} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{rarity}</span>
                <span className="text-muted-foreground">
                  {count} ({totalDrops > 0 ? ((count / totalDrops) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <Progress 
                value={totalDrops > 0 ? (count / totalDrops) * 100 : 0} 
                className="h-2"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            Total drops: {totalDrops} | Cycle position: {dropCount % 1000}/1000
          </p>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      {inventory.length > 0 && (
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {inventory.slice().reverse().map((item, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg border flex items-center justify-center transition-all hover:scale-110 ${RARITY_COLORS[item.rarity]}`}
                  title={`${item.name} (${item.rarity})`}
                >
                  {item.icon}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
