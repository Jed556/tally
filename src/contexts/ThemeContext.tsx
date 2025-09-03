import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { ThemeMode } from '../types';

interface ThemeContextType {
    themeMode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a CustomThemeProvider');
    }
    return context;
};

interface CustomThemeProviderProps {
    children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('themeMode');
        return (saved as ThemeMode) || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
    };

    const theme: Theme = createTheme({
        palette: {
            mode: themeMode,
            primary: {
                main: themeMode === 'light' ? '#1976d2' : '#90caf9',
            },
            secondary: {
                main: themeMode === 'light' ? '#dc004e' : '#f48fb1',
            },
            background: {
                default: themeMode === 'light' ? '#f5f5f5' : '#121212',
                paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: themeMode === 'light'
                            ? '0 2px 8px rgba(0,0,0,0.1)'
                            : '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: themeMode === 'light'
                                ? '0 4px 16px rgba(0,0,0,0.15)'
                                : '0 4px 16px rgba(0,0,0,0.4)',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.2s ease-in-out',
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
