import { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { Product } from '@/data/products';

interface ProductRevealProps {
  product: Product | null;
  isRevealing: boolean;
  onDismiss: () => void;
}

export const ProductReveal = ({ product, isRevealing, onDismiss }: ProductRevealProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (product && !isRevealing) {
      const t = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [product, isRevealing]);

  if (!product) return null;

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center transition-all duration-500 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Card */}
      <div
        className={`relative z-10 w-[90vw] max-w-md border-2 border-primary bg-card p-0 font-mono transition-all duration-500 ${
          show ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            you got:
          </span>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Emoji hero */}
        <div className="flex items-center justify-center py-8 text-6xl">
          {product.image}
        </div>

        {/* Info */}
        <div className="border-t border-border p-4 space-y-3">
          <h2 className="text-lg font-black uppercase leading-tight text-foreground">
            {product.name}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-wider border border-border px-2 py-0.5 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price + Source */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xl font-black text-primary">{product.price}</span>
              <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-wider">
                via {product.source}
              </span>
            </div>
          </div>

          {/* Buy link */}
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-sm hover:bg-destructive transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            buy it. you have to.
          </a>

          <p className="text-[8px] text-center text-muted-foreground uppercase tracking-widest pt-1">
            honor system — you clicked it, you own it
          </p>
        </div>
      </div>
    </div>
  );
};
