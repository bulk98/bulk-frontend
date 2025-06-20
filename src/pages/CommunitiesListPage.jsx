// src/pages/CommunitiesListPage.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getPublicCommunities, joinCommunity } from '../services/communityService';
import { useAuth } from '../contexts/AuthContext';
import CommunityCardSkeleton from '../components/communities/CommunityCardSkeleton';
import useDebouncedState from '../hooks/useDebouncedState';

import {
  Container, Typography, CircularProgress, Alert, Button, Box, Grid, Card,
  CardContent, CardActions, CardHeader, CardMedia, Avatar, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Paper, Chip, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';

const CommunitiesListPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useDebouncedState('', 500);
  const [sortBy, setSortBy] = useState('members_desc');
  const [joiningId, setJoiningId] = useState(null);

  const observer = useRef();
  const lastCommunityCardRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < totalPages) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, page, totalPages]);

  const userMembershipIds = useMemo(() => {
    if (!isAuthenticated || !user?.memberships) return new Set();
    return new Set(user.memberships.map(m => m.communityId));
  }, [user, isAuthenticated]);

  useEffect(() => {
    setSearchTerm(inputValue);
  }, [inputValue]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPublicCommunities(page, 12, searchTerm, sortBy)
      .then(data => {
        let communitiesData = data.comunidades || [];
        if (searchTerm) {
          communitiesData = communitiesData.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        const communitiesWithAffiliation = communitiesData.map(comm => {
          const isMember = userMembershipIds.has(comm.id);
          const isCreator = isAuthenticated && user?.id === comm.createdBy?.id;
          return {
            ...comm,
            isAffiliated: isMember || isCreator,
            isCreator: isCreator,
          };
        });

        setCommunities(prev => page === 1 ? communitiesWithAffiliation : [...prev, ...communitiesWithAffiliation]);
        setTotalPages(data.totalPages || 0);
      })
      .catch(err => {
        console.error("Error al obtener comunidades:", err);
        setError(err.message || 'Error al cargar las comunidades.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, searchTerm, sortBy, userMembershipIds, isAuthenticated, user]);

  useEffect(() => {
    setPage(1);
    setCommunities([]);
  }, [searchTerm, sortBy]);

  const handleJoin = async (communityId) => {
    setJoiningId(communityId);
    try {
      await joinCommunity(communityId);
      setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, isAffiliated: true } : c));
    } catch (error) {
      console.error("Error al unirse a la comunidad:", error);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Explorar Comunidades</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Encuentra y únete a comunidades de tu interés.</Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nombre..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}>
          <InputLabel id="sort-by-label">Ordenar por</InputLabel>
          <Select
            labelId="sort-by-label"
            id="sort-by-select"
            value={sortBy}
            label="Ordenar por"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="members_desc">Más Populares</MenuItem>
            <MenuItem value="createdAt_desc">Más Recientes</MenuItem>
            <MenuItem value="name_asc">Alfabéticamente (A-Z)</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading && communities.length === 0 ? (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {[...Array(12)].map((_, i) => (<CommunityCardSkeleton key={i} />))}
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : communities.length === 0 ? (
        <Typography sx={{ mt: 3, textAlign: 'center' }}>No se encontraron comunidades con esos criterios.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {communities.map((community, index) => {
            const isLastElement = communities.length === index + 1;
            return (
              <div key={community.id} ref={isLastElement ? lastCommunityCardRef : null}>
                <Card style={{ height: '330px', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={community.bannerUrl || 'https://placehold.co/600x200/ECEFF1/B0BEC5?text=Bulk'}
                    alt={`Banner de ${community.name}`}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Avatar
                      variant="rounded"
                      src={community.logoUrl || undefined}
                      sx={{ mt: -6, width: 60, height: 60, border: '3px solid white', bgcolor: 'background.paper' }}
                    />
                    <Typography
                      variant="h6"
                      component="h2"
                      title={community.name}
                      sx={{
                        mt: 1,
                        fontWeight: 'bold',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '3rem'
                      }}
                    >
                      {community.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {community._count?.memberships ?? 0} Miembros
                    </Typography>
                    <Tooltip title={community.createdBy?.email || 'Creador no disponible'}>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                        Creada por {community.createdBy?.name || community.createdBy?.email.split('@')[0]}
                      </Typography>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                    <Button component={RouterLink} to={`/comunidades/${community.id}`} size="small">Ver</Button>
                    {isAuthenticated && (
                      community.isAffiliated ? (
                        <Chip
                          icon={<CheckIcon />}
                          label={community.isCreator ? "Creador" : "Miembro"}
                          color={community.isCreator ? "secondary" : "success"}
                          size="small"
                        />
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleJoin(community.id)}
                          disabled={joiningId === community.id}
                        >
                          {joiningId === community.id ? <CircularProgress size={20} color="inherit" /> : <AddIcon fontSize="small" />}
                        </Button>
                      )
                    )}
                  </CardActions>
                </Card>
              </div>
            );
          })}
        </Box>
      )}

      {loading && communities.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default CommunitiesListPage;
