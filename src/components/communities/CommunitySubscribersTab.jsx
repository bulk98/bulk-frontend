import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getCommunitySubscribers } from '../../services/communityService';
import {
    Box, Typography, CircularProgress, Alert, List, ListItem, ListItemAvatar,
    Avatar, ListItemText, Divider, Stack, Button, ButtonGroup, Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const CommunitySubscribersTab = () => {
    const { communityId } = useParams();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                setLoading(true);
                const data = await getCommunitySubscribers(communityId);
                setSubscribers(data);
            } catch (err) {
                setError(err.message || 'Error al cargar los suscriptores.');
            } finally {
                setLoading(false);
            }
        };
        fetchSubscribers();
    }, [communityId]);

    const sortedSubscribers = useMemo(() => {
        let sortableItems = [...subscribers];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key]?.toLowerCase() || '';
                const valB = b[sortConfig.key]?.toLowerCase() || '';
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [subscribers, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small"/> : <ArrowDownwardIcon fontSize="small"/>;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Suscriptores de la Comunidad ({subscribers.length})</Typography>
            
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Typography sx={{ alignSelf: 'center' }}>Ordenar por:</Typography>
                <ButtonGroup variant="outlined" size="small">
                    <Button onClick={() => requestSort('name')} endIcon={getSortIcon('name')}>Nombre</Button>
                    <Button onClick={() => requestSort('username')} endIcon={getSortIcon('username')}>Username</Button>
                </ButtonGroup>
            </Stack>

            <List>
                {sortedSubscribers.map((subscriber, index) => (
                    <React.Fragment key={subscriber.id}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar component={RouterLink} to={`/perfil/${subscriber.id}`} src={subscriber.avatarUrl} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Link component={RouterLink} to={`/perfil/${subscriber.id}`} color="inherit" underline="hover">{subscriber.name}</Link>}
                                secondary={`@${subscriber.username} - ${subscriber.email}`}
                            />
                        </ListItem>
                        {index < sortedSubscribers.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default CommunitySubscribersTab;