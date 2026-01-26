import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const MathExplainer = () => {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">The Mathematics Behind It</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="lcg">
            <AccordionTrigger className="text-sm">What is this pattern?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This is a <strong>Linear Congruential Generator (LCG)</strong> — one of the oldest 
                and most well-known pseudorandom number generator algorithms.
              </p>
              <p className="font-mono bg-muted p-2 rounded text-center">
                x<sub>n+1</sub> = (x<sub>n</sub> - 101) mod 1000
              </p>
              <p>
                It produces a deterministic sequence that appears random but is completely 
                predictable if you know the algorithm and current state.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="coprime">
            <AccordionTrigger className="text-sm">Why 101 and 1000?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                101 is <strong>coprime</strong> with 1000, meaning they share no common factors 
                other than 1 (gcd(101, 1000) = 1).
              </p>
              <p>
                This guarantees a <strong>full-period</strong> generator — it will visit every 
                single value from 0-999 exactly once before repeating.
              </p>
              <p>
                If we used 100 instead (which divides 1000), we'd only get a cycle of length 10!
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="games">
            <AccordionTrigger className="text-sm">Why use this in games?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Guaranteed fairness:</strong> Every outcome appears exactly once per full cycle.</p>
              <p><strong>Memory efficient:</strong> Only need to store current value, not history.</p>
              <p><strong>Reproducible:</strong> Same seed = same sequence, perfect for replays.</p>
              <p><strong>No streaks:</strong> Can't get "unlucky" forever — rare items WILL appear.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prediction">
            <AccordionTrigger className="text-sm">Can players predict this?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Yes! If a player knows the algorithm and observes a few outputs, they can 
                calculate the exact state and predict all future values.
              </p>
              <p>
                This is why LCGs shouldn't be used for security-critical applications, but 
                are fine for games where predictability isn't a concern.
              </p>
              <p>
                Some games even let players exploit this for "seed manipulation" speedruns!
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
