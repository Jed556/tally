// Type definitions for the Tally Counter App

export interface Counter {
    id: number;
    name: string;
    count: number;
}

export interface CounterInstance {
    id: string;
    name: string;
    counters: Counter[];
    createdAt: string;
    totalCount: number;
}

export type ViewMode = 'grid' | 'list';
export type ThemeMode = 'light' | 'dark';
export type SortMode = 'default' | 'count-desc' | 'count-asc' | 'a-z' | 'z-a';

export interface CounterItemProps {
    counter: Counter;
    onIncrement: () => void;
    onDecrement: () => void;
    onDelete: () => void;
    onRename: (newName: string) => void;
    onCountChange: (newCount: number) => void;
    viewMode: ViewMode;
    isDragging?: boolean;
}