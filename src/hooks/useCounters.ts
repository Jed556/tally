import { useState, useCallback } from 'react';
import { Counter } from '../types';

export const useCounters = (initialCounters: Counter[] = []) => {
    const [counters, setCounters] = useState<Counter[]>(initialCounters);

    const addCounter = useCallback((name: string): void => {
        if (name.trim()) {
            const newCounter: Counter = {
                id: Date.now(),
                name: name.trim(),
                count: 0
            };
            setCounters(prev => [...prev, newCounter]);
        }
    }, []);

    const updateCounter = useCallback((id: number, change: number): void => {
        setCounters(prev => prev.map(counter =>
            counter.id === id
                ? { ...counter, count: Math.max(0, counter.count + change) }
                : counter
        ));
    }, []);

    const deleteCounter = useCallback((id: number): void => {
        setCounters(prev => prev.filter(counter => counter.id !== id));
    }, []);
    
    const resetCounter = useCallback((id: number): void => {
        setCounters(prev => prev.map(counter =>
            counter.id === id
                ? { ...counter, count: 0 }
                : counter
        ));
    }, []);

    const resetAllCounters = useCallback((): void => {
        setCounters(prev => prev.map(counter => ({ ...counter, count: 0 })));
    }, []);

    return {
        counters,
        addCounter,
        updateCounter,
        deleteCounter,
        resetCounter,
        resetAllCounters
    };
};
