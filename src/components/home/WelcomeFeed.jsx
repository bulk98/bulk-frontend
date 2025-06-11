// src/components/home/WelcomeFeed.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getSuggestedCommunities, joinCommunity } from '../../services/communityService';
import { Box, Typography, Button, Grid, Card, CardHeader, Avatar, IconButton, CircularProgress, Tooltip } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import AddIcon from '@mui/icons-material/Add';

const WelcomeFeed = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);

    useEffect(() => {
        getSuggestedCommunities()
            .then(data => setSuggestions(data))
            .finally(() => setLoading(false));
    }, []);

    const handleJoin = async (communityId) => {
        setJoiningId(communityId);
        try {
            await joinCommunity(communityId);
            // Opcional: recargar la página para que el feed se actualice, o manejar el estado de forma más compleja.
            // Por ahora, simplemente recargamos como una solución simple.
            window.location.reload();
        } catch (error) {
            console.error("Error al unirse a la comunidad:", error);
            setJoiningId(null); // Resetea en caso de error
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                ¡Bienvenido a Bulk!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Tu feed está vacío. Empieza por unirte a algunas comunidades.
            </Typography>
            <Button component={RouterLink} to="/comunidades" variant="contained" size="large" startIcon={<ExploreIcon />}>
                Explorar Todas las Comunidades
            </Button>
            
            {suggestions.length > 0 && (
                <Box sx={{ mt: 5, textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Comunidades Sugeridas</Typography>
                    <Grid container spacing={2}>
                        {suggestions.map(community => (
                            <Grid item xs={12} md={4} key={community.id}>
                                <Card variant="outlined">
                                    <CardHeader
                                        avatar={<Avatar variant="rounded" src={community.logoUrl} />}
                                        title={community.name}
                                        subheader={`${community._count?.memberships || 0} miembros`}
                                        action={
                                            <Tooltip title="Unirse">
                                                <IconButton onClick={() => handleJoin(community.id)} disabled={joiningId === community.id}>
                                                    {joiningId === community.id ? <CircularProgress size={24} /> : <AddIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        }
                                    />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default WelcomeFeed;