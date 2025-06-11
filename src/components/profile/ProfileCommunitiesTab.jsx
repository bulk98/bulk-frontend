import React, { useState, useEffect } from 'react';
import { getUserCommunities } from '../../services/userService';
import CommunityListItem from './CommunityListItem';
import { Box, Typography, Stack, CircularProgress, Alert } from '@mui/material';

const ProfileCommunitiesTab = ({ userId }) => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        setError('');
        
        getUserCommunities(userId)
            .then(data => {
                setCommunities(data);
            })
            .catch(err => {
                setError(err.message || 'No se pudo cargar la lista de comunidades.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }
    
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            {communities.length > 0 ? (
                <Stack spacing={2}>
                    {communities.map(community => (
                        <CommunityListItem key={community.id} community={community} />
                    ))}
                </Stack>
            ) : (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', p: 3 }}>
                    Este usuario no pertenece a ninguna comunidad.
                </Typography>
            )}
        </Box>
    );
};

export default ProfileCommunitiesTab;