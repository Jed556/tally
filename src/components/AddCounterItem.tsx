import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Paper,
    ListItem,
    ListItemText,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import { ViewMode } from '../types';

interface AddCounterItemProps {
    onAdd: () => void;
    viewMode: ViewMode;
}

const AddCounterItem: React.FC<AddCounterItemProps> = ({
    onAdd,
    viewMode
}) => {
    const theme = useTheme();

    const handleAdd = () => {
        onAdd();
    };

    if (viewMode === 'list') {
        return (
            <Paper
                elevation={1}
                className="add-counter-item list-item"
                onClick={handleAdd}
                sx={{
                    mb: 1,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px dashed',
                    borderColor: theme.palette.primary.main + '40',
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        borderColor: theme.palette.primary.main + '80',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }
                }}
            >
                <ListItem sx={{ py: 2, pl: 3 }}>
                    <Box
                        display="flex"
                        alignItems="center"
                        width="100%"
                        sx={{ cursor: 'pointer' }}
                    >
                        <AddIcon
                            color="primary"
                            sx={{
                                mr: 2,
                                opacity: 0.7,
                                transition: 'all 0.2s ease',
                                '&:hover': { opacity: 1 }
                            }}
                        />
                        <ListItemText
                            primary={
                                <Typography
                                    variant="subtitle1"
                                    color="primary"
                                    sx={{
                                        fontWeight: 500,
                                        opacity: 0.8,
                                        transition: 'all 0.2s ease',
                                        '&:hover': { opacity: 1 }
                                    }}
                                >
                                    Add New Counter
                                </Typography>
                            }
                            secondary="Click to create a new counter"
                        />
                    </Box>
                </ListItem>
            </Paper>
        );
    }

    return (
        <Card
            elevation={3}
            className="add-counter-item"
            onClick={handleAdd}
            sx={{
                height: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px dashed',
                borderColor: theme.palette.primary.main + '40',
                borderRadius: 2,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    borderColor: theme.palette.primary.main + '80',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                }
            }}
        >
            <CardContent sx={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                p: 2
            }}>
                <Box>
                    <AddIcon
                        color="primary"
                        sx={{
                            fontSize: '2.5rem',
                            mb: 1.5,
                            opacity: 0.7,
                            transition: 'all 0.2s ease',
                            '&:hover': { opacity: 1, transform: 'scale(1.1)' }
                        }}
                    />
                    <Typography
                        variant="subtitle1"
                        color="primary"
                        sx={{
                            fontWeight: 500,
                            opacity: 0.8,
                            fontSize: '0.95rem',
                            lineHeight: 1.2,
                            transition: 'all 0.2s ease',
                            '&:hover': { opacity: 1 }
                        }}
                    >
                        Add New Counter
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            opacity: 0.6,
                            fontSize: '0.8rem'
                        }}
                    >
                        Click to create
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AddCounterItem;
