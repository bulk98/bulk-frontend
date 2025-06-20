import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { getCommentsByPost, createComment, deleteComment, updateComment } from '../../services/commentService';
import { 
    Paper, Typography, Box, CircularProgress, Alert, Button, Stack, Avatar, List, 
    ListItem, ListItemAvatar, ListItemText, TextField, IconButton, Tooltip, Link,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { formatDistanceToNow, format } from 'date-fns'; // MODIFICADO: Importar 'format'
import { es } from 'date-fns/locale';

const CommentSection = ({ postId, postAuthorId, communityCreatorId, onCommentCountChange }) => {
    const { isAuthenticated, user: authUser } = useAuth();
    
    const { 
        register, handleSubmit, reset, getValues, setValue, 
        formState: { errors, isSubmitting } 
    } = useForm({ mode: 'onChange' });
    
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalComments, setTotalComments] = useState(0);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [deletingComment, setDeletingComment] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    // El resto de tus funciones (fetchComments, handlers, etc.) no necesitan cambios.
    const fetchComments = useCallback(async (pageNum = 1) => {
        if (pageNum === 1) setComments([]);
        setLoadingComments(true);
        try {
            const data = await getCommentsByPost(postId, pageNum);
            setComments(prev => pageNum === 1 ? data.comments : [...prev, ...data.comments]);
            setPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 0);
            const newTotal = data.totalComments || 0;
            setTotalComments(newTotal);
            if (onCommentCountChange) onCommentCountChange(newTotal);
        } catch (err) {
            setSnackbar({ open: true, message: 'No se pudieron cargar los comentarios.' });
        } finally {
            setLoadingComments(false);
        }
    }, [postId, onCommentCountChange]);

    useEffect(() => { fetchComments(1); }, [fetchComments]);
    
    const handleCreateComment = async (data) => {
        if (!data.newCommentContent?.trim()) return;
        try {
            await createComment(postId, { content: data.newCommentContent });
            reset({ newCommentContent: '' });
            await fetchComments(1);
            setSnackbar({ open: true, message: 'Comentario publicado.' });
        } catch (error) {
            console.error("🔴 Error atrapado en CommentSection:", error);
            setSnackbar({
                open: true,
                message: error?.message || "Error al comentar."
            });
        }
    };

    const handleEditStart = (comment) => {
        setEditingCommentId(comment.id);
        setValue(`editContent_${comment.id}`, comment.content, { shouldValidate: true });
    };

    const handleEditCancel = () => setEditingCommentId(null);

    const handleEditSave = async (commentId) => {
        const content = getValues(`editContent_${commentId}`);
        if (!content || !content.trim()) return;
        try {
            // MODIFICADO: La respuesta de updateComment debe incluir el comentario actualizado
            const updatedComment = await updateComment(commentId, { content: content.trim() });
            setEditingCommentId(null);
            // MODIFICADO: Usar la data del servidor para asegurar que 'updatedAt' es correcto
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, ...updatedComment } : c));
        } catch (error) { 
            const errorMessage = error.response?.data?.error || "No se pudo guardar el comentario.";
            setSnackbar({ open: true, message: errorMessage });
        }
    };
    
    const handleDeleteClick = (comment) => setDeletingComment(comment);
    
    const handleDeleteConfirm = async () => {
        if (!deletingComment) return;
        try {
            await deleteComment(deletingComment.id);
            setSnackbar({ open: true, message: 'Comentario eliminado.' });
            await fetchComments(1);
        } catch (error) { 
            const errorMessage = error.response?.data?.error || "No se pudo eliminar el comentario.";
            setSnackbar({ open: true, message: errorMessage });
        } finally {
            setDeletingComment(null);
        }
    };
    
    const canManageComment = (commentAuthorId) => {
        if (!isAuthenticated || !authUser) return false;
        return authUser.id === commentAuthorId || authUser.id === communityCreatorId;
    };

    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mt: 4 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium', mb: 3 }}>
                Comentarios ({totalComments})
            </Typography>

            {isAuthenticated && (
                <Box component="form" onSubmit={handleSubmit(handleCreateComment)} sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar src={authUser?.avatarUrl} sx={{ mt: 1 }} />
                        <TextField
                            fullWidth multiline rows={3} placeholder="Añade un comentario..."
                            {...register("newCommentContent", { required: "El comentario no puede estar vacío." })}
                            error={!!errors.newCommentContent} helperText={errors.newCommentContent?.message}
                            disabled={isSubmitting}
                        />
                    </Stack>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={24} /> : 'Publicar'}
                        </Button>
                    </Box>
                </Box>
            )}

            {loadingComments && comments.length === 0 && <Box sx={{textAlign: 'center'}}><CircularProgress/></Box>}
            {!loadingComments && comments.length === 0 && (
                <Typography sx={{ fontStyle: 'italic', textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    Aún no hay comentarios. ¡Sé el primero!
                </Typography>
            )}

            {!loadingComments && comments.length > 0 && (
                <List sx={{ width: '100%', p: 0 }}>
                    {comments.map((comment) => {
                        // ===== INICIO DE LA MODIFICACIÓN =====
                        const createdAt = new Date(comment.createdAt);
                        const updatedAt = new Date(comment.updatedAt);
                        // Comprobamos si la diferencia es mayor a 10 segundos para considerarlo editado
                        const isEdited = (updatedAt.getTime() - createdAt.getTime()) > 10000; 
                        // ===== FIN DE LA MODIFICACIÓN =====

                        return (
                            <ListItem 
                                key={comment.id} 
                                alignItems="flex-start" 
                                sx={{ py: 1.5, px: 0, gap: 2, flexDirection: 'column' }} 
                                divider
                            >
                                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                    <ListItemAvatar>
                                        <Link component={RouterLink} to={`/perfil/${comment.author?.id}`}>
                                            <Avatar src={comment.author?.avatarUrl} />
                                        </Link>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                <Link component={RouterLink} to={`/perfil/${comment.author?.id}`} underline="hover" color="text.primary">{comment.author?.username ? `@${comment.author.username}` : (comment.author?.name || 'Usuario Anónimo')}</Link>
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>• {formatDistanceToNow(createdAt, { locale: es })}</Typography>
                                                
                                                {/* ===== INICIO DE LA MODIFICACIÓN ===== */}
                                                {isEdited && (
                                                    <Tooltip title={`Editado el ${format(updatedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                            (editado)
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                                {/* ===== FIN DE LA MODIFICACIÓN ===== */}
                                            </Typography>
                                        }
                                    />
                                    {canManageComment(comment.author?.id) && (
                                        <Stack direction="row">
                                            <Tooltip title="Editar"><IconButton size="small" onClick={() => handleEditStart(comment)}><EditIcon fontSize="inherit" /></IconButton></Tooltip>
                                            <Tooltip title="Eliminar"><IconButton size="small" onClick={() => handleDeleteClick(comment)}><DeleteIcon fontSize="inherit" /></IconButton></Tooltip>
                                        </Stack>
                                    )}
                                </Box>
                                
                                <Box sx={{ width: '100%', pl: '56px', pt: 0.5 }}>
                                    {editingCommentId === comment.id ? (
                                        <Box sx={{width: '100%'}}>
                                            <TextField fullWidth multiline autoFocus size="small"
                                                {...register(`editContent_${comment.id}`, { required: true })}
                                                error={!!errors[`editContent_${comment.id}`]}
                                            />
                                            <Box sx={{mt:1, display:'flex', gap:1, justifyContent:'flex-end'}}>
                                                <Button onClick={handleEditCancel} size="small">Cancelar</Button>
                                                <Button onClick={() => handleEditSave(comment.id)} variant="contained" size="small">Guardar</Button>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography sx={{ whiteSpace: 'pre-wrap' }} component="div" variant="body2">{comment.content}</Typography>
                                    )}
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>
            )}
            
            {page < totalPages && !loadingComments && (
                <Box sx={{textAlign: 'center', mt: 2}}>
                    <Button onClick={() => setPage(p => p + 1)}>Cargar más comentarios</Button>
                </Box>
            )}
            
            <Dialog open={!!deletingComment} onClose={() => setDeletingComment(null)}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent><DialogContentText>¿Estás seguro de que quieres eliminar este comentario?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeletingComment(null)}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}/>
        </Paper>
    );
};

export default CommentSection;