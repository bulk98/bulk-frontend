import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { markNotificationsAsRead } from '../../services/notificationService';
import { 
    Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, 
    Divider, Button, ListItemButton // MODIFICADO: Se importa ListItemButton
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Íconos para cada tipo de notificación
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import StarIcon from '@mui/icons-material/Star';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const notificationConfig = {
    NEW_COMMENT: {
        icon: <CommentIcon fontSize="small" color="primary" />,
        message: (actor) => `${actor} ha comentado en tu post.`
    },
    POST_LIKE: {
        icon: <ThumbUpIcon fontSize="small" sx={{ color: '#2196f3' }}/>,
        message: (actor) => `A ${actor} le ha gustado tu post.`
    },
    NEW_MEMBER: {
        icon: <GroupAddIcon fontSize="small" color="secondary" />,
        message: (actor) => `${actor} se ha unido a tu comunidad.`
    },
    NEW_SUBSCRIBER: {
        icon: <StarIcon fontSize="small" sx={{ color: '#FFD700' }} />,
        message: (actor) => `${actor} se ha suscrito a tu comunidad.`
    },
    PROMOTION_TO_MODERATOR: {
        icon: <SupervisorAccountIcon fontSize="small" color="success" />,
        message: (actor) => `${actor} te ha promovido a moderador.`
    }
};

const NotificationPanel = ({ onClose }) => {
    const { notifications, fetchNotifications } = useAuth();
    const navigate = useNavigate();

    const handleNotificationClick = async (notification) => {
        onClose(); // Cierra el panel
        if (!notification.isRead) {
            await markNotificationsAsRead([notification.id]);
            fetchNotifications();
        }
        
        let path = '/';
        if (notification.postId) {
            path = `/posts/${notification.postId}`;
        } else if (notification.communityId) {
            path = `/comunidades/${notification.communityId}`;
        }
        navigate(path);
    };

    return (
        <Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Notificaciones</Typography>
                {/* Futuro botón para marcar todas como leídas */}
            </Box>
            <Divider />
            <List sx={{ p: 0 }}>
                {notifications.length > 0 ? (
                    notifications.map(notif => {
                        const config = notificationConfig[notif.type];
                        if (!config) return null;
                        
                        return (
                            // ===== INICIO DE LA MODIFICACIÓN =====
                            // Se elimina la prop 'button' de ListItem y se añade 'disablePadding'.
                            // El contenido se envuelve en el nuevo componente ListItemButton.
                            <ListItem
                                key={notif.id}
                                disablePadding
                            >
                                <ListItemButton
                                    onClick={() => handleNotificationClick(notif)}
                                    sx={{ 
                                        backgroundColor: notif.isRead ? 'transparent' : 'action.hover',
                                        '&:hover': {
                                            backgroundColor: notif.isRead ? 'rgba(0, 0, 0, 0.04)' : 'action.selected'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={notif.actor?.avatarUrl}>{config.icon}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2">
                                                {config.message(`@${notif.actor?.username || 'Alguien'}`)}
                                            </Typography>
                                        }
                                        secondary={formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                                    />
                                </ListItemButton>
                            </ListItem>
                            // ===== FIN DE LA MODIFICACIÓN =====
                        );
                    })
                ) : (
                    <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                        No tienes notificaciones nuevas.
                    </Typography>
                )}
            </List>
        </Box>
    );
};

export default NotificationPanel;