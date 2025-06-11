import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserPosts } from '../../services/userService';
import ArticlePostItem from '../posts/ArticlePostItem';
import ArticlePostItemSkeleton from '../posts/ArticlePostItemSkeleton';
import { Box, Typography, Stack, Divider, CircularProgress, Alert } from '@mui/material';

const ProfileActivityTab = ({ userId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < totalPages) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, page, totalPages]);

    useEffect(() => {
        // Reiniciar estado cuando cambia el userId (al navegar entre perfiles)
        setPosts([]);
        setPage(1);
        setTotalPages(0);
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        setError('');
        
        getUserPosts(userId, page)
            .then(data => {
                setPosts(prevPosts => {
                    // Evitar duplicados si la petición se dispara varias veces
                    const existingIds = new Set(prevPosts.map(p => p.id));
                    const newPosts = data.posts.filter(p => !existingIds.has(p.id));
                    return [...prevPosts, ...newPosts];
                });
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => {
                setError(err.message || 'No se pudo cargar la actividad del usuario.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId, page]);


    return (
        <Box>
            {loading && posts.length === 0 && (
                <Stack divider={<Divider />} sx={{mt:0}}>
                    {[...Array(3)].map((_, i) => <ArticlePostItemSkeleton key={i} />)}
                </Stack>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!loading && posts.length === 0 && !error && (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', p: 3 }}>
                    Este usuario aún no ha publicado nada.
                </Typography>
            )}

            {posts.length > 0 && (
                <Stack divider={<Divider />}>
                    {posts.map((post, index) => {
                         const postItem = (
                            // NOTA: Los handlers de like/comment/share se deben pasar aquí si quieres que funcionen
                            <ArticlePostItem key={post.id} post={post} />
                        );
                        if (posts.length === index + 1) {
                            return <div ref={lastPostElementRef} key={post.id}>{postItem}</div>;
                        }
                        return postItem;
                    })}
                </Stack>
            )}

            {loading && posts.length > 0 && (
                <Box sx={{display:'flex', justifyContent:'center', py:3}}>
                    <CircularProgress size={30}/>
                </Box>
            )}
        </Box>
    );
};

export default ProfileActivityTab;