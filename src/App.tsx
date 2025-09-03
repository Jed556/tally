import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import {
    ViewModule as GridIcon,
    ViewList as ListIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import CssBaseline from '@mui/material/CssBaseline';
import CounterItem from './components/CounterItem';
import AddCounterItem from './components/AddCounterItem';
import InstanceSidebar from './components/InstanceSidebar';
import { CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { Counter, ViewMode, SortMode } from './types';
import './App.css';

const AppContent: React.FC = () => {
    const { themeMode, toggleTheme } = useTheme();
    const [counters, setCounters] = useState<Counter[]>(() => {
        const saved = localStorage.getItem('currentCounters');
        return saved ? JSON.parse(saved) : [{ id: 1, name: 'Counter 1', count: 0 }];
    });
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const saved = localStorage.getItem('viewMode');
        return (saved as ViewMode) || 'grid';
    });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>(() => {
        const saved = localStorage.getItem('sortMode');
        return (saved as SortMode) || 'default';
    });

    // Save counters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('currentCounters', JSON.stringify(counters));
    }, [counters]);

    // Save view mode to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('viewMode', viewMode);
    }, [viewMode]);

    // Save sort mode to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sortMode', sortMode);
    }, [sortMode]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const addCounter = (): void => {
        // Find the next counter number by looking for existing "Counter #" names
        const counterNumbers = counters
            .map(counter => {
                const match = counter.name.match(/^Counter (\d+)$/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(num => num > 0);

        const nextNumber = counterNumbers.length > 0 ? Math.max(...counterNumbers) + 1 : counters.length + 1;

        const newCounter: Counter = {
            id: Date.now(),
            name: `Counter ${nextNumber}`,
            count: 0
        };

        setCounters(prev => [...prev, newCounter]);
    };

    const updateCounter = (id: number, change: number): void => {
        setCounters(counters.map(counter =>
            counter.id === id
                ? { ...counter, count: Math.max(0, counter.count + change) }
                : counter
        ));
    };

    const updateCounterCount = (id: number, newCount: number): void => {
        setCounters(counters.map(counter =>
            counter.id === id
                ? { ...counter, count: Math.max(0, newCount) }
                : counter
        ));
    };

    const renameCounter = (id: number, newName: string): void => {
        setCounters(counters.map(counter =>
            counter.id === id
                ? { ...counter, name: newName }
                : counter
        ));
    };

    const deleteCounter = (id: number): void => {
        setCounters(prev => prev.filter(counter => counter.id !== id));
    };

    const loadInstance = (newCounters: Counter[]): void => {
        setCounters(newCounters);
    };

    const getSortedCounters = () => {
        const countersCopy = [...counters];

        switch (sortMode) {
            case 'count-desc':
                return countersCopy.sort((a, b) => b.count - a.count);
            case 'count-asc':
                return countersCopy.sort((a, b) => a.count - b.count);
            case 'a-z':
                return countersCopy.sort((a, b) => a.name.localeCompare(b.name));
            case 'z-a':
                return countersCopy.sort((a, b) => b.name.localeCompare(a.name));
            case 'default':
            default:
                return countersCopy; // Keep original order
        }
    };

    const handleDragStart = (event: any) => {
        console.log('Drag started:', event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        console.log('Drag end event:', { active: active.id, over: over?.id });

        if (over && active.id !== over.id && sortMode === 'default') {
            setCounters((items) => {
                const oldIndex = items.findIndex((item) => item.id.toString() === active.id);
                const newIndex = items.findIndex((item) => item.id.toString() === over.id);

                console.log('Moving from index', oldIndex, 'to index', newIndex);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="static" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Tally Counter App
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as SortMode)}
                                displayEmpty
                                sx={{
                                    color: 'inherit',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.23)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                    },
                                    '& .MuiSvgIcon-root': {
                                        color: 'inherit',
                                    },
                                }}
                            >
                                <MenuItem value="default">Default Order</MenuItem>
                                <MenuItem value="count-desc">Count (Decreasing)</MenuItem>
                                <MenuItem value="count-asc">Count (Increasing)</MenuItem>
                                <MenuItem value="a-z">Name (A-Z)</MenuItem>
                                <MenuItem value="z-a">Name (Z-A)</MenuItem>
                            </Select>
                        </FormControl>

                        <Tooltip title="Instance History">
                            <IconButton
                                onClick={() => setSidebarOpen(true)}
                                color="inherit"
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                <HistoryIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
                            <IconButton
                                onClick={toggleTheme}
                                color="inherit"
                                sx={{
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1) rotate(15deg)',
                                    }
                                }}
                            >
                                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}>
                            <IconButton
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                color="inherit"
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                {viewMode === 'list' ? <ListIcon /> : <GridIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={counters.map(c => c.id.toString())}
                        strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
                    >
                        <Box className="view-container" sx={{
                            padding: 3,
                            paddingTop: 4,
                        }}>
                            {viewMode === 'grid' ? (
                                <Box
                                    className="grid-container multi-layout"
                                    display="grid"
                                    gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                                    gap={3}
                                    sx={{
                                        justifyItems: "center",
                                        width: "100%",
                                    }}
                                >
                                    {getSortedCounters().map((counter: Counter, index: number) => (
                                        <Box
                                            key={counter.id}
                                            className="counter-card multi-mode"
                                            sx={{
                                                width: "100%",
                                                aspectRatio: "1 / 1",
                                                maxWidth: "250px",
                                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <CounterItem
                                                counter={counter}
                                                onIncrement={() => updateCounter(counter.id, 1)}
                                                onDecrement={() => updateCounter(counter.id, -1)}
                                                onDelete={() => deleteCounter(counter.id)}
                                                onRename={(newName: string) => renameCounter(counter.id, newName)}
                                                onCountChange={(newCount: number) => updateCounterCount(counter.id, newCount)}
                                                viewMode={viewMode}
                                            />
                                        </Box>
                                    ))}

                                    <Box
                                        className="counter-card add-counter multi-mode"
                                        sx={{
                                            width: "100%",
                                            aspectRatio: "1 / 1",
                                            maxWidth: "250px",
                                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        <AddCounterItem
                                            onAdd={addCounter}
                                            viewMode={viewMode}
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    width: '100%'
                                }}>
                                    {getSortedCounters().map((counter: Counter, index: number) => (
                                        <Box key={counter.id} className="counter-card">
                                            <CounterItem
                                                counter={counter}
                                                onIncrement={() => updateCounter(counter.id, 1)}
                                                onDecrement={() => updateCounter(counter.id, -1)}
                                                onDelete={() => deleteCounter(counter.id)}
                                                onRename={(newName: string) => renameCounter(counter.id, newName)}
                                                onCountChange={(newCount: number) => updateCounterCount(counter.id, newCount)}
                                                viewMode={viewMode}
                                            />
                                        </Box>
                                    ))}

                                    <Box className="counter-card add-counter">
                                        <AddCounterItem
                                            onAdd={addCounter}
                                            viewMode={viewMode}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </SortableContext>
                </DndContext>
            </Box>

            <InstanceSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentCounters={counters}
                onLoadInstance={loadInstance}
                currentSortMode={sortMode}
            />

        </>
    );
};

const App: React.FC = () => {
    return (
        <CustomThemeProvider>
            <AppContent />
        </CustomThemeProvider>
    );
};

export default App;
