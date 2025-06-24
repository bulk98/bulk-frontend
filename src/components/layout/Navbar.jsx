// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { performSearch } from '../../services/searchService';

import {
    AppBar, Box, Toolbar, Typography, Button, IconButton, Menu, MenuItem,
    ListItemIcon, ListItemText, Avatar, Tooltip, Container, TextField,
    Autocomplete, CircularProgress, InputAdornment, Link, Paper, Stack, Divider, Badge // MODIFICADO: Se añade Divider
} from '@mui/material';

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
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import NotificationsIcon from '@mui/icons-material/Notifications'; // NUEVO: Ícono de notificaciones
import NotificationPanel from './NotificationPanel';
import { useThemeContext } from '../../contexts/ThemeContext'; // NUEVO
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Ícono de luna (modo oscuro)
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Ícono de sol (modo claro)

const Navbar = () => {
    const { user, isAuthenticated, logout, unreadCount } = useAuth();
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElNotif, setAnchorElNotif] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { mode, toggleColorMode } = useThemeContext(); // NUEVO: Obtenemos el modo y la función de cambio

    // Debounce manual
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [inputValue]);

    useEffect(() => {
        let active = true;
        if (searchTerm.trim() === '') {
            setOptions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        performSearch(searchTerm).then(results => {
            if (!active) return;
            const communities = results.communities.map(c => ({ ...c, type: 'Comunidad' }));
            const posts = results.posts.map(p => ({ ...p, type: 'Post' }));
            const users = results.users.map(u => ({ ...u, type: 'Usuario' }));
            setOptions([...users, ...communities, ...posts]);
            setLoading(false);
        }).catch(() => {
            if (active) setLoading(false);
        });

        return () => { active = false; };
    }, [searchTerm]);

    useEffect(() => {
        if (!isSearchOpen) setOptions([]);
    }, [isSearchOpen]);

    const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
    const handleCloseNavMenu = () => setAnchorElNav(null);
    const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);
    
    const handleOpenNotifMenu = (e) => setAnchorElNotif(e.currentTarget);
    const handleCloseNotifMenu = () => setAnchorElNotif(null);

    const handleLogout = () => {
        logout();
        handleCloseUserMenu();
        navigate('/login');
    };

    // ===== INICIO DE LA MODIFICACIÓN =====
    const userMenuItems = user ? [
        { label: 'Mi Perfil', to: `/perfil/${user.id}`, icon: <AccountCircle fontSize="small" /> },
        { label: 'Editar Perfil', to: '/perfil/editar', icon: <SettingsIcon fontSize="small" /> },
        // NUEVO: Enlace a la página de gestión
        { label: 'Roles y Membresias', to: '/gestionar-suscripciones', icon: <SubscriptionsIcon fontSize="small" /> },
        { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon fontSize="small" />, role: 'OG' },
        // NUEVO: Separador para agrupar visualmente
        { isDivider: true }, 
        { label: 'Cerrar Sesión', action: handleLogout, icon: <LogoutIcon fontSize="small" /> },
    ].filter(item => !item.role || item.role === user.tipo_usuario) : [];
    // ===== FIN DE LA MODIFICACIÓN =====

    const mainNavItems = [
        { label: 'Inicio', to: '/', icon: <HomeIcon />, auth: true },
        { label: 'Explorar', to: '/comunidades', icon: <ExploreIcon />, auth: true },
        { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon />, role: 'OG' },
        { label: 'Crear Comunidad', to: '/crear-comunidad', icon: <AddCircleOutlineIcon />, role: 'OG' },
    ].filter(item => {
        if (!isAuthenticated) return !item.auth && !item.role;
        if (item.role) return user?.tipo_usuario === item.role;
        return item.auth === true;
    });

    const mobileNavItems = isAuthenticated
        ? [...mainNavItems, ...userMenuItems.filter(item => item.to)]
        : [
            { label: 'Explorar', to: '/comunidades', icon: <ExploreIcon /> },
            { label: 'Iniciar Sesión', to: '/login', icon: <LoginIcon /> },
            { label: 'Registrarse', to: '/registro', icon: <HowToRegIcon /> }
        ];

    return (
        <AppBar position="static" color="inherit" elevation={1}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }} component={RouterLink} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Bulk</Typography>
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton size="large" onClick={handleOpenNavMenu} color="inherit" aria-label="Abrir menú de navegación"><MenuIcon /></IconButton>
                        <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu} PaperProps={{ sx: { borderRadius: 2, mt: 1.5, width: 250 } }}>
                            {mobileNavItems.map((item) => (
                                <MenuItem key={item.label} onClick={item.action || handleCloseNavMenu} component={item.to ? RouterLink : 'div'} to={item.to || '#'}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText>{item.label}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, justifyContent: 'center' }} component={RouterLink} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Bulk</Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                        {mainNavItems.map((link) => (
                            <Button key={link.label} component={RouterLink} to={link.to} startIcon={link.icon} sx={{ color: 'text.primary', textTransform: 'none' }}>
                                {link.label}
                            </Button>
                        ))}
                    </Box>

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
                                getOptionLabel={(option) => option.name || option.username || option.title || ''}
                                onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                                groupBy={(option) => option.type}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Link component={RouterLink} to={option.type === 'Comunidad' ? `/comunidades/${option.id}` : option.type === 'Usuario' ? `/perfil/${option.id}` : `/posts/${option.id}`} sx={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{option.name || option.username || option.title}</Typography>
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

                    {isAuthenticated && user ? (
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 0, md: 1.5 } }}>
                           
                           {/* NUEVO: Botón para cambiar el tema */}
                            <Tooltip title={mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}>
                                <IconButton onClick={toggleColorMode} color="inherit">
                                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                </IconButton>
                            </Tooltip>

                           {/* NUEVO: Botón de Notificaciones */}
                            <Tooltip title="Notificaciones">
                                <IconButton onClick={handleOpenNotifMenu} color="inherit">
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Opciones de usuario">
                                <Button onClick={handleOpenUserMenu} color="inherit" sx={{ p: 0.5, borderRadius: '50px', textTransform: 'none', gap: 0.5 }}>
                                    <Avatar src={user.avatarUrl || undefined} sx={{ width: 32, height: 32 }}>{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</Avatar>
                                    <ArrowDropDownIcon sx={{ color: 'text.secondary' }} />
                                </Button>
                            </Tooltip>
                            <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} MenuListProps={{ sx: { py: 1 } }} PaperProps={{ elevation: 3, sx: { borderRadius: 2, mt: 1 } }}>
                                {/* ===== INICIO DE LA MODIFICACIÓN ===== */}
                                {userMenuItems.map((item, index) => {
                                    if (item.isDivider) {
                                        return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
                                    }
                                    return (
                                        <MenuItem key={item.label} onClick={item.action || handleCloseUserMenu} component={item.to ? RouterLink : 'div'} to={item.to || ''}>
                                            <ListItemIcon>{item.icon}</ListItemIcon>
                                            <ListItemText>{item.label}</ListItemText>
                                        </MenuItem>
                                    );
                                })}
                                {/* ===== FIN DE LA MODIFICACIÓN ===== */}
                            </Menu>

                            <Menu
                                anchorEl={anchorElNotif}
                                open={Boolean(anchorElNotif)}
                                onClose={handleCloseNotifMenu}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                MenuListProps={{ sx: { p: 0 } }}
                                PaperProps={{
                                    sx: { width: 380, maxHeight: 500, mt: 1.5, borderRadius: 2 }
                                }}
                            >
                                <NotificationPanel onClose={handleCloseNotifMenu} />
                            </Menu>

                        </Box>
                    ) : (
                        <Stack direction="row" spacing={1} sx={{ ml: 2, display: { xs: 'none', md: 'flex' } }}>
                            <Button component={RouterLink} to="/login" startIcon={<LoginIcon />} color="primary" variant='outlined'>Ingresar</Button>
                            <Button component={RouterLink} to="/register" startIcon={<HowToRegIcon />} variant="contained">Registrarse</Button>
                        </Stack>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;