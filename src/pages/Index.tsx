import { useState } from 'react';
import { useModuloCycle } from '@/hooks/useModuloCycle';
import { ButterflyCanvas } from '@/components/game/ButterflyCanvas';
import { ProductReveal } from '@/components/game/ProductReveal';
import { getProductFromCycle, type Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { RotateCcw, Zap } from 'lucide-react';

const Index = () => {
  const { current, stepCount, uniqueVisited, step, reset } = useModuloCycle();
  const [revealedProduct, setRevealedProduct] = useState<Product | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleFlap = () => {
    step();
    setIsRevealing(true);
    setRevealedProduct(null);

    // Short delay for the cycle to "spin", then reveal product
    setTimeout(() => {
      const product = getProductFromCycle(current);
      setRevealedProduct(product);
      setIsRevealing(false);
    }, 400);
  };

  const handleDismiss = () => {
    setRevealedProduct(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ButterflyCanvas cycleValue={current} stepCount={stepCount} />

      {/* Product reveal overlay */}
      <ProductReveal
        product={revealedProduct}
        isRevealing={isRevealing}
        onDismiss={handleDismiss}
      />

      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top — brand name */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
          <div className="pointer-events-auto">
            <h1
              className="text-2xl font-mono font-black text-foreground/90 uppercase tracking-[0.3em] leading-none"
              style={{ textShadow: '3px 3px 0 hsl(0,0%,0%), -1px -1px 0 hsl(0,75%,45%)' }}
            >
              life sucks ass
            </h1>
            <p className="text-[9px] font-mono text-muted-foreground tracking-[0.5em] uppercase mt-1">
              click it. buy it. honor system.
            </p>
          </div>
          <div className="pointer-events-auto text-right">
            <div className="font-mono text-xs text-foreground/50">
              {String(current).padStart(3, '0')}
            </div>
            <div className="font-mono text-[9px] text-muted-foreground">
              {stepCount} spins / {uniqueVisited} unique
            </div>
          </div>
        </div>

        {/* Bottom — controls */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="flex gap-3 justify-center pointer-events-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { reset(); setRevealedProduct(null); }}
                className="font-mono text-[10px] uppercase tracking-widest bg-transparent border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                rst
              </Button>
              <Button
                size="lg"
                onClick={handleFlap}
                disabled={isRevealing}
                className="min-w-[160px] font-mono font-black uppercase tracking-[0.2em] bg-primary hover:bg-destructive text-primary-foreground border-2 border-primary"
              >
                <Zap className="h-4 w-4 mr-1" />
                {isRevealing ? '...' : 'spin'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
