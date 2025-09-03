import React, { useState, useRef } from 'react';
import {
    Drawer,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    Paper,
    useTheme,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Save as SaveIcon,
    Delete as DeleteIcon,
    Download as ExportIcon,
    Upload as ImportIcon,
    Close as CloseIcon,
    History as HistoryIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CounterInstance, Counter, SortMode } from '../types';

interface SortableInstanceItemProps {
    instance: CounterInstance;
    onLoad: (instance: CounterInstance) => void;
    onDelete: (instanceId: string) => void;
    formatDate: (dateString: string) => string;
    isDragDisabled: boolean;
}

const SortableInstanceItem: React.FC<SortableInstanceItemProps> = ({
    instance,
    onLoad,
    onDelete,
    formatDate,
    isDragDisabled
}) => {
    const theme = useTheme();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: instance.id,
        disabled: isDragDisabled
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            sx={{
                border: 1,
                borderColor: isDragging ? 'primary.main' : 'divider',
                borderRadius: 1,
                mb: 1,
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    cursor: isDragDisabled ? 'pointer' : 'grab',
                    borderColor: theme.palette.primary.main,
                }
            }}
            onClick={() => onLoad(instance)}
        >
            {!isDragDisabled && (
                <Box
                    {...attributes}
                    {...listeners}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mr: 1,
                        cursor: 'grab',
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main'
                        }
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <DragIcon fontSize="small" />
                </Box>
            )}

            <ListItemText
                primary={instance.name}
                secondary={
                    <Box>
                        <Typography variant="caption" display="block">
                            {formatDate(instance.createdAt)}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                            <Chip
                                label={`${instance.counters.length} counters`}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                label={`Total: ${instance.totalCount}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                }
            />
            <ListItemSecondaryAction>
                <IconButton
                    edge="end"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(instance.id);
                    }}
                    color="error"
                    size="small"
                >
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

interface InstanceSidebarProps {
    open: boolean;
    onClose: () => void;
    currentCounters: Counter[];
    onLoadInstance: (counters: Counter[]) => void;
    currentSortMode: SortMode;
}

const InstanceSidebar: React.FC<InstanceSidebarProps> = ({
    open,
    onClose,
    currentCounters,
    onLoadInstance,
    currentSortMode
}) => {
    const theme = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [instances, setInstances] = useState<CounterInstance[]>(() => {
        const saved = localStorage.getItem('counterInstances');
        return saved ? JSON.parse(saved) : [];
    });

    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [instanceName, setInstanceName] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = instances.findIndex((item) => item.id === active.id);
            const newIndex = instances.findIndex((item) => item.id === over.id);

            const newInstances = arrayMove(instances, oldIndex, newIndex);
            saveInstancesToStorage(newInstances);
        }
    };

    const saveInstancesToStorage = (newInstances: CounterInstance[]) => {
        localStorage.setItem('counterInstances', JSON.stringify(newInstances));
        setInstances(newInstances);
    };

    const saveCurrentInstance = () => {
        if (!instanceName.trim()) return;

        const newInstance: CounterInstance = {
            id: `instance_${Date.now()}`,
            name: instanceName.trim(),
            counters: currentCounters.map(counter => ({ ...counter })),
            createdAt: new Date().toISOString(),
            totalCount: currentCounters.reduce((sum, counter) => sum + counter.count, 0)
        };

        const newInstances = [...instances, newInstance];
        saveInstancesToStorage(newInstances);

        setSaveDialogOpen(false);
        setInstanceName('');
        setSnackbar({ open: true, message: 'Instance saved successfully!', severity: 'success' });
    };

    const deleteInstance = (instanceId: string) => {
        const newInstances = instances.filter(instance => instance.id !== instanceId);
        saveInstancesToStorage(newInstances);
        setSnackbar({ open: true, message: 'Instance deleted successfully!', severity: 'success' });
    };

    const loadInstance = (instance: CounterInstance) => {
        onLoadInstance(instance.counters);
        onClose();
        setSnackbar({ open: true, message: `Loaded "${instance.name}" instance!`, severity: 'success' });
    };

    const exportInstances = () => {
        const dataStr = JSON.stringify(instances, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `counter-instances-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: 'Instances exported successfully!', severity: 'success' });
    };

    const importInstances = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedInstances = JSON.parse(e.target?.result as string) as CounterInstance[];

                // Validate the imported data
                if (!Array.isArray(importedInstances)) {
                    throw new Error('Invalid file format');
                }

                // Merge with existing instances (avoid duplicates by ID)
                const existingIds = new Set(instances.map(i => i.id));
                const newInstances = importedInstances.filter(i => !existingIds.has(i.id));
                const mergedInstances = [...instances, ...newInstances];

                saveInstancesToStorage(mergedInstances);
                setSnackbar({
                    open: true,
                    message: `Imported ${newInstances.length} new instances!`,
                    severity: 'success'
                });
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to import instances. Invalid file format.',
                    severity: 'error'
                });
            }
        };
        reader.readAsText(file);

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSortedInstances = () => {
        return [...instances]; // Always return in default order for sidebar - dragging enabled
    };

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                transitionDuration={300}
                PaperProps={{
                    sx: {
                        width: 400,
                        backgroundColor: theme.palette.background.default,
                        backgroundImage: 'none',
                    }
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                }}
            >
                <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <HistoryIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                Instance History
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap={1} mb={2}>
                        <Button
                            startIcon={<SaveIcon />}
                            variant="contained"
                            onClick={() => setSaveDialogOpen(true)}
                            disabled={currentCounters.length === 0 || currentSortMode !== 'default'}
                            size="small"
                            fullWidth
                        >
                            Save Current
                        </Button>
                    </Box>

                    {currentSortMode !== 'default' && (
                        <Box mb={2}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Switch to "Default Order" to save current sequence
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" gap={1} mb={3}>
                        <Button
                            startIcon={<ExportIcon />}
                            variant="outlined"
                            onClick={exportInstances}
                            disabled={instances.length === 0}
                            size="small"
                            fullWidth
                        >
                            Export
                        </Button>
                        <Button
                            startIcon={<ImportIcon />}
                            variant="outlined"
                            onClick={() => fileInputRef.current?.click()}
                            size="small"
                            fullWidth
                        >
                            Import
                        </Button>
                        <input
                            type="file"
                            accept=".json"
                            onChange={importInstances}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Instance List */}
                    <Box flex={1} sx={{ overflowY: 'auto' }}>
                        {instances.length === 0 ? (
                            <Paper sx={{
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                                border: 1,
                                borderColor: 'divider'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    No saved instances yet.
                                    <br />
                                    Save your current counter set to get started!
                                </Typography>
                            </Paper>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={instances.map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <List sx={{ p: 0 }}>
                                        {getSortedInstances().map((instance) => (
                                            <SortableInstanceItem
                                                key={instance.id}
                                                instance={instance}
                                                onLoad={loadInstance}
                                                onDelete={deleteInstance}
                                                formatDate={formatDate}
                                                isDragDisabled={false}
                                            />
                                        ))}
                                    </List>
                                </SortableContext>
                            </DndContext>
                        )}
                    </Box>
                </Box>
            </Drawer>

            {/* Save Instance Dialog */}
            <Dialog
                open={saveDialogOpen}
                onClose={() => setSaveDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Save Current Instance</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Instance Name"
                        fullWidth
                        variant="outlined"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && instanceName.trim()) {
                                saveCurrentInstance();
                            }
                        }}
                        placeholder="e.g., Shopping List Counters, Event Tracking..."
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        This will save {currentCounters.length} counter(s) with a total count of{' '}
                        {currentCounters.reduce((sum, counter) => sum + counter.count, 0)}.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={saveCurrentInstance}
                        variant="contained"
                        disabled={!instanceName.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default InstanceSidebar;
