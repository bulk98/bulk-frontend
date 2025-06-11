// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { performSearch } from '../../services/searchService';
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
  ListItemIcon, ListItemText, Avatar, Tooltip, Container, TextField,
  Autocomplete, CircularProgress, InputAdornment, Link, Paper, Stack // Importación de Stack añadida
} from '@mui/material';

// Iconos
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SettingsIcon from '@mui/icons-material/Settings'; // Icono para editar perfil

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para menús
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // Estados para el buscador
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect para el buscador (sin cambios)
  useEffect(() => {
    let active = true;
    if (searchQuery.trim() === '') {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
        try {
            const searchResults = await performSearch(searchQuery);
            if (active) {
                const communities = searchResults.communities.map(c => ({ ...c, type: 'Comunidad' }));
                const posts = searchResults.posts.map(p => ({ ...p, type: 'Post' }));
                setOptions([...communities, ...posts]);
            }
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }, 500);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen) {
      setOptions([]);
    }
  }, [isSearchOpen]);
  
  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/login');
  };

  const commonMenuItemStyles = { minWidth: 180, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } };

  // --- LÓGICA DE ENLACES UNIFICADA ---

  const userMenuItems = user ? [
    { label: 'Mi Perfil', to: `/perfil/${user.id}`, icon: <AccountCircle fontSize="small" /> },
    { label: 'Editar Perfil', to: '/perfil/editar', icon: <SettingsIcon fontSize="small" /> }, // Enlace añadido según el plan
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon fontSize="small" />, role: 'OG' },
    { label: 'Cerrar Sesión', action: handleLogout, icon: <LogoutIcon fontSize="small" /> },
  ].filter(item => !item.role || item.role === user.tipo_usuario) : [];

  const mainNavItems = [
    { label: 'Inicio', to: '/', icon: <HomeIcon />, auth: true },
    { label: 'Explorar', to: '/comunidades', icon: <ExploreIcon />, auth: true },
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon />, role: 'OG' },
    { label: 'Crear Comunidad', to: '/crear-comunidad', icon: <AddCircleOutlineIcon />, role: 'OG' },
  ].filter(item => {
      if (!isAuthenticated) return !item.auth && !item.role; // No mostrar nada en la barra principal si no está autenticado
      if (item.role) return user?.tipo_usuario === item.role;
      return item.auth === true;
  });

  const mobileNavItems = isAuthenticated ? 
    [...mainNavItems, ...userMenuItems.filter(item => item.to)] : 
    [
        { label: 'Explorar', to: '/comunidades', icon: <ExploreIcon /> },
        { label: 'Iniciar Sesión', to: '/login', icon: <LoginIcon /> },
        { label: 'Registrarse', to: '/registro', icon: <HowToRegIcon /> }
    ];

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          
          {/* Logo */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }} component={RouterLink} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Bulk</Typography>
          </Box>

          {/* Menú Móvil */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit" aria-label="Abrir menú de navegación"><MenuIcon /></IconButton>
            <Menu
              id="menu-appbar-nav"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              PaperProps={{ sx: { borderRadius: 2, mt: 1.5, width: 250 } }}
            >
                {mobileNavItems.map((item) => (
                    <MenuItem key={item.label} onClick={item.action || handleCloseNavMenu} component={item.to ? RouterLink : 'div'} to={item.to || '#'}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
          </Box>
          
          {/* Logo Móvil */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, justifyContent: 'center' }} component={RouterLink} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Bulk</Typography>
          </Box>

          {/* Menú Escritorio */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {mainNavItems.map((link) => (
                <Button key={link.label} component={RouterLink} to={link.to} startIcon={link.icon} sx={{ color: 'text.primary', textTransform: 'none' }}>
                    {link.label}
                </Button>
            ))}
          </Box>

          {/* Buscador */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, px: 1, flexGrow: 0.5, maxWidth: 350 }}>
            <Paper component="form" variant='outlined' sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', borderRadius: '50px' }}>
              <Autocomplete
                sx={{ flex: 1 }}
                id="bulk-global-search"
                open={isSearchOpen}
                onOpen={() => setIsSearchOpen(true)}
                onClose={() => setIsSearchOpen(false)}
                options={options}
                loading={loading}
                noOptionsText="No se encontraron resultados"
                loadingText="Buscando..."
                getOptionLabel={(option) => option.name || option.title || ''}
                onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
                groupBy={(option) => option.type}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Link component={RouterLink} to={option.type === 'Comunidad' ? `/comunidades/${option.id}` : `/posts/${option.id}`} sx={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{option.name || option.title}</Typography>
                        {option.type === 'Post' && <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>en {option.community.name}</Typography>}
                      </Box>
                    </Link>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Buscar en Bulk..."
                    size="small"
                    variant="standard"
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: true,
                      startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>),
                      endAdornment: (<>{loading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),
                    }}
                  />
                )}
              />
            </Paper>
          </Box>
          
          {/* Menú de Usuario o Botones de Login/Registro */}
          {isAuthenticated && user ? (
            <Box sx={{ flexGrow: 0, ml: { xs: 0, md: 1.5 } }}>
              <Tooltip title="Opciones de usuario">
                <Button onClick={handleOpenUserMenu} color="inherit" sx={{ p: 0.5, borderRadius: '50px', textTransform: 'none', gap: 0.5 }}>
                    <Avatar src={user.avatarUrl || undefined} sx={{ width: 32, height: 32 }}>{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</Avatar>
                    <ArrowDropDownIcon sx={{ color: 'text.secondary' }} />
                </Button>
              </Tooltip>
              <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} MenuListProps={{ sx: { py: 1 } }} PaperProps={{ elevation: 3, sx: { borderRadius: 2, mt: 1 } }}>
                {userMenuItems.map((item) => (
                    <MenuItem key={item.label} onClick={item.action || handleCloseUserMenu} component={item.to ? RouterLink : 'div'} to={item.to || ''} sx={commonMenuItemStyles}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            <Stack direction="row" spacing={1} sx={{ ml: 2, display: { xs: 'none', md: 'flex'} }}>
                <Button component={RouterLink} to="/login" startIcon={<LoginIcon />} color="primary" variant='outlined'>
                    Ingresar
                </Button>
                <Button component={RouterLink} to="/registro" startIcon={<HowToRegIcon />} variant="contained">
                    Registrarse
                </Button>
            </Stack>
          )}

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;