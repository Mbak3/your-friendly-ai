import { useState, useCallback } from 'react';

interface ModuloCycleState {
  current: number;
  history: number[];
  stepCount: number;
  visitedSet: Set<number>;
}

export const useModuloCycle = (initialValue = 500, decrement = 101, modulus = 1000) => {
  const [state, setState] = useState<ModuloCycleState>({
    current: initialValue,
    history: [initialValue],
    stepCount: 0,
    visitedSet: new Set([initialValue]),
  });

  const step = useCallback(() => {
    setState((prev) => {
      let next = prev.current - decrement;
      if (next < 0) {
        next += modulus;
      }
      const newHistory = [...prev.history.slice(-99), next];
      const newVisited = new Set(prev.visitedSet);
      newVisited.add(next);
      
      return {
        current: next,
        history: newHistory,
        stepCount: prev.stepCount + 1,
        visitedSet: newVisited,
      };
    });
  }, [decrement, modulus]);

  const reset = useCallback((newInitial?: number) => {
    const initial = newInitial ?? initialValue;
    setState({
      current: initial,
      history: [initial],
      stepCount: 0,
      visitedSet: new Set([initial]),
    });
  }, [initialValue]);

  const getValueAtStep = useCallback((steps: number, startValue = initialValue) => {
    let value = startValue;
    for (let i = 0; i < steps; i++) {
      value = value - decrement;
      if (value < 0) value += modulus;
    }
    return value;
  }, [decrement, modulus, initialValue]);

  return {
    current: state.current,
    history: state.history,
    stepCount: state.stepCount,
    uniqueVisited: state.visitedSet.size,
    cycleComplete: state.visitedSet.size === modulus,
    step,
    reset,
    getValueAtStep,
  };
};
