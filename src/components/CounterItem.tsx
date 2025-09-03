import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    CardActions,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    useTheme,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText as MenuListItemText
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    MoreVert as MoreVertIcon,
    AddCircle as AddSubtractIcon,
    Settings as SettingsIcon,
    Refresh as ResetIcon
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CounterItemProps } from '../types';

// Helper function to format large numbers with exponential notation
const formatNumber = (num: number): string => {
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num < 1000000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else {
        return num.toExponential(2);
    }
};

const CounterItem: React.FC<CounterItemProps> = ({
    counter,
    onIncrement,
    onDecrement,
    onDelete,
    onRename,
    onCountChange,
    viewMode,
    isDragging = false
}) => {
    const theme = useTheme();
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingCount, setIsEditingCount] = useState(false);
    const [editName, setEditName] = useState(counter.name);
    const [editCount, setEditCount] = useState(counter.count.toString());
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(menuAnchorEl);
    const editNameRef = useRef<HTMLInputElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: counter.id.toString() });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 9999 : 'auto',
        position: isDragging ? 'relative' : 'static',
    };

    const handleNameSave = () => {
        if (editName.trim() && editName !== counter.name) {
            onRename(editName.trim());
        }
        setIsEditingName(false);
    };

    const handleNameCancel = useCallback(() => {
        setEditName(counter.name);
        setIsEditingName(false);
    }, [counter.name]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isEditingName && editNameRef.current && !editNameRef.current.contains(event.target as Node)) {
                handleNameCancel();
            }
        };

        if (isEditingName) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditingName, handleNameCancel]);

    const handleCountSave = () => {
        const newCount = parseInt(editCount);
        if (!isNaN(newCount) && newCount >= 0 && newCount !== counter.count) {
            onCountChange(newCount);
        }
        setIsEditingCount(false);
    };

    const handleCountCancel = () => {
        setEditCount(counter.count.toString());
        setIsEditingCount(false);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleAddSubtract = () => {
        // This would open a dialog to add/subtract from total
        handleMenuClose();
        // TODO: Implement add/subtract functionality
    };

    const handleSetCounterTo = () => {
        // This would open a dialog to set counter to specific value
        handleMenuClose();
        setIsEditingCount(true);
    };

    const handleResetCounter = () => {
        handleMenuClose();
        onCountChange(0);
    };

    const handleCounterSettings = () => {
        // This would open counter settings dialog
        handleMenuClose();
        // TODO: Implement counter settings
    };

    const handleDeleteCounter = () => {
        handleMenuClose();
        onDelete();
    };

    const addPulseAnimation = (element: HTMLElement | null) => {
        if (element) {
            element.classList.add('counter-pulse');
            setTimeout(() => element.classList.remove('counter-pulse'), 400);
        }
    };

    if (viewMode === 'list') {
        return (
            <Paper
                ref={setNodeRef}
                style={style}
                elevation={1}
                className="sortable-item list-item"
                sx={{
                    mb: 1,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid transparent',
                    borderRadius: 1,
                    overflow: 'hidden',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        borderColor: theme.palette.primary.main + '33',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }
                }}
            >
                <ListItem sx={{ py: 2, pl: 1 }}>
                    {/* Drag handle on the left */}
                    <Box sx={{ mr: 2 }}>
                        <IconButton
                            {...attributes}
                            {...listeners}
                            size="small"
                            className="drag-handle"
                            sx={{
                                cursor: 'grab',
                                '&:active': { cursor: 'grabbing' },
                                transition: 'all 0.2s ease',
                                '&:hover': { transform: 'scale(1.1)' },
                                touchAction: 'none'
                            }}
                            aria-label="Drag to reorder"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            <DragIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <ListItemText
                        primary={
                            isEditingName ? (
                                <TextField
                                    ref={editNameRef}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleNameSave();
                                        } else if (e.key === 'Escape') {
                                            handleNameCancel();
                                        }
                                    }}
                                    onBlur={handleNameSave}
                                    size="small"
                                    autoFocus
                                    variant="standard"
                                    InputProps={{
                                        disableUnderline: true,
                                        style: {
                                            fontSize: '1rem',
                                            fontWeight: 400,
                                            padding: 0,
                                            maxWidth: '200px'
                                        }
                                    }}
                                    sx={{
                                        maxWidth: '200px',
                                        '& .MuiInput-input': {
                                            padding: '2px 4px',
                                            border: '1px solid transparent',
                                            borderRadius: 1,
                                            maxWidth: '200px',
                                            lineHeight: 1.43,
                                            '&:focus': {
                                                borderColor: 'primary.main'
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <Typography
                                    variant="subtitle1"
                                    onClick={() => setIsEditingName(true)}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                            color: theme.palette.primary.main,
                                        }
                                    }}
                                >
                                    {counter.name}
                                </Typography>
                            )
                        }
                        secondary={`Current count: ${formatNumber(counter.count)}`}
                    />

                    {/* Counter actions on the right */}
                    <Box display="flex" alignItems="center" gap={1} sx={{ ml: 2 }}>
                        <IconButton
                            color="secondary"
                            onClick={(e) => {
                                onDecrement();
                                addPulseAnimation(e.currentTarget);
                            }}
                            disabled={counter.count === 0}
                            size="small"
                            aria-label={`Decrease ${counter.name} count`}
                            sx={{
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'scale(1.15)',
                                    backgroundColor: 'rgba(220, 0, 78, 0.1)',
                                },
                                '&:active': {
                                    transform: 'scale(0.95)',
                                }
                            }}
                        >
                            <RemoveIcon />
                        </IconButton>

                        {isEditingCount ? (
                            <Box
                                component="input"
                                type="number"
                                value={editCount}
                                onChange={(e) => setEditCount((e.target as HTMLInputElement).value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCountSave();
                                    } else if (e.key === 'Escape') {
                                        handleCountCancel();
                                    }
                                }}
                                onBlur={handleCountSave}
                                autoFocus
                                sx={{
                                    minWidth: 60,
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: theme.palette.primary.main,
                                    fontFamily: 'inherit',
                                    borderRadius: '16px',
                                    padding: '4px 12px',
                                    width: '60px',
                                    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                        WebkitAppearance: 'none',
                                        margin: 0,
                                    },
                                    '&[type=number]': {
                                        MozAppearance: 'textfield',
                                    },
                                }}
                            />
                        ) : (
                            <Chip
                                label={formatNumber(counter.count)}
                                color="primary"
                                variant="outlined"
                                size="small"
                                onClick={() => setIsEditingCount(true)}
                                className="count-chip"
                                sx={{
                                    minWidth: 60,
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                    }
                                }}
                            />
                        )}

                        <IconButton
                            color="primary"
                            onClick={(e) => {
                                onIncrement();
                                addPulseAnimation(e.currentTarget);
                            }}
                            size="small"
                            aria-label={`Increase ${counter.name} count`}
                            sx={{
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'scale(1.15)',
                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                },
                                '&:active': {
                                    transform: 'scale(0.95)',
                                }
                            }}
                        >
                            <AddIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            sx={{
                                ml: 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                }
                            }}
                            aria-label={`${counter.name} counter menu`}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </ListItem>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleAddSubtract}>
                        <ListItemIcon>
                            <AddSubtractIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Add/Subtract From Total</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleSetCounterTo}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Set Counter To...</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleResetCounter}>
                        <ListItemIcon>
                            <ResetIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Reset Counter</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleCounterSettings}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Counter Settings</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteCounter}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Delete Counter</MenuListItemText>
                    </MenuItem>
                </Menu>
            </Paper>
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            elevation={3}
            className="sortable-item"
            {...attributes}
            {...listeners}
            sx={{
                height: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid transparent',
                borderRadius: 2,
                cursor: 'grab',
                touchAction: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                '&:active': {
                    cursor: 'grabbing',
                },
                '&:hover': {
                    borderColor: theme.palette.primary.main + '33',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                }
            }}
        >
            <CardContent sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                p: 1.5
            }}>
                {/* Menu button in top-right corner */}
                <IconButton
                    onClick={handleMenuOpen}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        opacity: 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            opacity: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                    }}
                    aria-label={`${counter.name} counter menu`}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleAddSubtract}>
                        <ListItemIcon>
                            <AddSubtractIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Add/Subtract From Total</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleSetCounterTo}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Set Counter To...</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleResetCounter}>
                        <ListItemIcon>
                            <ResetIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Reset Counter</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleCounterSettings}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Counter Settings</MenuListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteCounter}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <MenuListItemText>Delete Counter</MenuListItemText>
                    </MenuItem>
                </Menu>

                {/* Counter name near the top with a bit more spacing */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    mt={1.5}
                    mb={1}
                    minHeight="48px"
                    maxHeight="48px"
                    position="relative"
                >
                    {isEditingName ? (
                        <Box
                            component="textarea"
                            ref={editNameRef}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleNameSave();
                                } else if (e.key === 'Escape') {
                                    handleNameCancel();
                                }
                            }}
                            onBlur={handleNameSave}
                            autoFocus
                            sx={{
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: counter.name.length > 12 ? '1rem' : '1.1rem',
                                fontWeight: 500,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis',
                                maxWidth: '120px',
                                minHeight: '48px',
                                maxHeight: '48px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                wordBreak: 'break-word',
                                textAlign: 'center',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                backgroundColor: 'transparent',
                                color: 'inherit',
                                fontFamily: 'inherit',
                                padding: 0,
                                margin: 0,
                                width: '100%',
                                '&:focus': {
                                    outline: 'none',
                                    border: 'none'
                                }
                            }}
                        />
                    ) : (
                        <Typography
                            className="counter-title"
                            variant="h6"
                            component="h2"
                            textAlign="center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingName(true);
                            }}
                            sx={{
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                fontSize: counter.name.length > 12 ? '1rem' : '1.1rem',
                                fontWeight: 500,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis',
                                maxWidth: '120px',
                                minHeight: '48px',
                                maxHeight: '48px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                wordBreak: 'break-word',
                                '&:hover': {
                                    textDecoration: 'underline',
                                    color: theme.palette.primary.main,
                                }
                            }}
                        >
                            {counter.name}
                        </Typography>
                    )}
                </Box>

                {/* Main number display - takes most of the remaining space */}
                <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                    {isEditingCount ? (
                        <Box
                            component="input"
                            type="number"
                            value={editCount}
                            onChange={(e) => setEditCount((e.target as HTMLInputElement).value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCountSave();
                                } else if (e.key === 'Escape') {
                                    handleCountCancel();
                                }
                            }}
                            onBlur={handleCountSave}
                            autoFocus
                            sx={{
                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                                fontWeight: 'bold',
                                textAlign: 'center',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: theme.palette.primary.main,
                                fontFamily: 'inherit',
                                width: '100%',
                                maxWidth: '200px',
                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0,
                                },
                                '&[type=number]': {
                                    MozAppearance: 'textfield',
                                },
                            }}
                        />
                    ) : (
                        <Typography
                            className="counter-number"
                            variant="h2"
                            color="primary"
                            fontWeight="bold"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingCount(true);
                            }}
                            sx={{
                                cursor: 'pointer',
                                fontSize: counter.count >= 1000 ? '2.2rem' : '3rem',
                                lineHeight: 1,
                                textAlign: 'center',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    opacity: 0.8,
                                }
                            }}
                        >
                            {formatNumber(counter.count)}
                        </Typography>
                    )}
                </Box>
            </CardContent>
            <CardActions
                className="counter-buttons"
                sx={{
                    justifyContent: 'center',
                    p: 0,
                    display: 'flex',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    height: '50px'
                }}
            >
                <Box display="flex" width="100%" height="100%">
                    <IconButton
                        color="secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDecrement();
                            addPulseAnimation(e.currentTarget);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        disabled={counter.count === 0}
                        size="medium"
                        aria-label={`Decrease ${counter.name} count`}
                        sx={{
                            flex: 1,
                            borderRadius: 0,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            height: '100%',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(220, 0, 78, 0.1)',
                                transform: 'none',
                            },
                            '&:active': {
                                backgroundColor: 'rgba(220, 0, 78, 0.2)',
                            }
                        }}
                    >
                        <RemoveIcon />
                    </IconButton>

                    <IconButton
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onIncrement();
                            addPulseAnimation(e.currentTarget);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        size="medium"
                        aria-label={`Increase ${counter.name} count`}
                        sx={{
                            flex: 1,
                            borderRadius: 0,
                            height: '100%',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                transform: 'none',
                            },
                            '&:active': {
                                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            }
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>
            </CardActions>
        </Card>
    );
};

export default CounterItem;
