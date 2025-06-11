// src/components/comments/CommentDialog.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createComment, getCommentsByPost } from '../../services/commentService';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Box, CircularProgress, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CommentDialog = ({ open, onClose, post, onCommentAdded }) => {
    const { user } = useAuth();
    // Toda la lógica y estado de comentarios ahora vive aquí
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');

    useEffect(() => {
        // Solo carga comentarios si el diálogo está abierto y tenemos un post
        if (open && post) {
            setLoadingComments(true);
            getCommentsByPost(post.id, 1, 20)
                .then(data => {
                    setComments(data.comments || []);
                })
                .catch(error => {
                    console.error("Error cargando comentarios:", error);
                    // Aquí podrías manejar un estado de error si quisieras
                })
                .finally(() => {
                    setLoadingComments(false);
                });
        }
    }, [open, post]); // Se ejecuta cada vez que el diálogo se abre con un nuevo post

    const handleSubmitComment = async () => {
        if (!newCommentText.trim() || !post) return;
        try {
            const newCommentData = await createComment(post.id, { content: newCommentText.trim() });
            setNewCommentText('');
            // Añade el nuevo comentario a la lista localmente
            const commentWithAuthor = {
                ...newCommentData,
                author: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
            };
            setComments(prevComments => [commentWithAuthor, ...prevComments]);
            // Llama a la función del padre para que actualice el contador en el feed
            if(onCommentAdded) {
                onCommentAdded(post.id);
            }
        } catch (error) {
            console.error('Error al enviar el comentario:', error);
            // Aquí podrías usar el Snackbar del padre o uno local
        }
    };

    const handleClose = () => {
        setNewCommentText('');
        setComments([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5 }}>
                Comentarios
                <IconButton aria-label="Cerrar" onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2 }}>
                {loadingComments ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : (
                    <List>
                        {comments.map(comment => (
                            <ListItem key={comment.id} alignItems="flex-start">
                                <ListItemAvatar><Avatar variant="rounded" src={comment.author?.avatarUrl} /></ListItemAvatar>
                                <ListItemText
                                    primary={<Typography variant="body2" sx={{ fontWeight: 'medium' }}>{comment.author?.name || comment.author?.email}</Typography>}
                                    secondary={comment.content}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
                {(!loadingComments && comments.length === 0) && (
                    <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                        No hay comentarios. ¡Sé el primero!
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    label="Añadir un comentario..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    size="small"
                    sx={{ mb: 1 }}
                />
                <Button onClick={handleSubmitComment} disabled={!newCommentText.trim()}>Enviar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CommentDialog;