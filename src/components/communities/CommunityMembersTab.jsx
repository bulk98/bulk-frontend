// src/components/communities/CommunityMembersTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCommunityMembers, updateMemberRole, removeMemberFromCommunity, toggleMemberPremiumPermission } from '../../services/communityService';
import {
  Typography, Box, CircularProgress, Alert, Switch, Tooltip, IconButton, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, Snackbar, Select, FormControl, InputLabel, Avatar
} from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CommunityMembersTab = ({ communityId, isVisible }) => {
  const { user: authUser } = useAuth();
  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dialogState, setDialogState] = useState({ type: null, member: null, loading: false, error: '', success: '' });
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchMembers = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    setError('');
    try {
      const membersData = await getCommunityMembers(communityId);
      // Filtra al propio OG/creador de la lista de miembros a gestionar
      const otherMembers = membersData.filter(m => m.userId !== authUser.id) || [];
      setMembersList(otherMembers);
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de miembros.");
    } finally {
      setLoading(false);
    }
  }, [communityId, authUser.id]);

  useEffect(() => {
    if (isVisible) {
      fetchMembers();
    }
  }, [isVisible, fetchMembers]);

  const handleMenuOpen = (event, member) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMember(null);
  };

  const openDialog = (type, member) => {
    handleMenuClose();
    if (type === 'role') setSelectedNewRole(member.roleInCommunity);
    setDialogState({ type, member, loading: false, error: '', success: '' });
  };

  const closeDialog = () => setDialogState({ type: null, member: null, loading: false, error: '', success: '' });

  const handleRoleChange = async () => {
    if (!dialogState.member || dialogState.member.roleInCommunity === selectedNewRole) return;
    setDialogState(s => ({ ...s, loading: true, error: '' }));
    try {
      await updateMemberRole(communityId, dialogState.member.userId, selectedNewRole);
      fetchMembers(); // Recargar la lista de miembros
      setSnackbar({ open: true, message: 'Rol actualizado con éxito.', severity: 'success' });
      closeDialog();
    } catch (err) {
      setDialogState(s => ({ ...s, loading: false, error: err.message || 'Error al cambiar el rol.' }));
    }
  };
  
  const handleExpel = async () => {
    if (!dialogState.member) return;
    setDialogState(s => ({ ...s, loading: true, error: '' }));
    try {
      await removeMemberFromCommunity(communityId, dialogState.member.userId);
      fetchMembers(); // Recargar la lista de miembros
      setSnackbar({ open: true, message: 'Miembro expulsado con éxito.', severity: 'success' });
      closeDialog();
    } catch (err) {
      setDialogState(s => ({ ...s, loading: false, error: err.message || 'Error al expulsar al miembro.' }));
    }
  };

  const handleTogglePremiumPermission = async (member) => {
    const originalState = member.canPublishPremiumContent;
    const newState = !originalState;
    
    // Actualización optimista de la UI
    setMembersList(list => list.map(m => m.userId === member.userId ? { ...m, canPublishPremiumContent: newState } : m));
    
    try {
      // Llamada al servicio con el nuevo valor del permiso
      await toggleMemberPremiumPermission(communityId, member.userId, newState);
      setSnackbar({ open: true, message: 'Permiso actualizado.', severity: 'success' });
    } catch (err) {
      // Revertir el cambio en la UI en caso de error
      setMembersList(list => list.map(m => m.userId === member.userId ? { ...m, canPublishPremiumContent: originalState } : m));
      setSnackbar({ open: true, message: err.message || 'Error al actualizar permiso.', severity: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Typography variant="h6" gutterBottom>Gestionar Miembros ({membersList.length})</Typography>
      {membersList.length === 0 ? (
        <Typography sx={{ mt: 2, fontStyle: 'italic' }}>No hay otros miembros en esta comunidad.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Usuario</TableCell><TableCell>Rol en Comunidad</TableCell><TableCell>Permiso Premium</TableCell><TableCell align="right">Acciones</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {membersList.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={member.avatarUrl} sx={{ width: 32, height: 32 }} variant="rounded">{member.email?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{member.email}</Typography>
                        <Typography variant="caption" color="text.secondary">Global: {member.tipoUsuarioGlobal}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{member.roleInCommunity}</TableCell>
                  <TableCell>
                    <Tooltip title={member.roleInCommunity === 'MODERATOR' ? "Permitir crear posts premium" : "Solo los moderadores pueden tener este permiso"}>
                      <span>
                        <Switch 
                            checked={!!member.canPublishPremiumContent} 
                            onChange={() => handleTogglePremiumPermission(member)} 
                            disabled={member.roleInCommunity !== 'MODERATOR'} 
                        />
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, member)}><MoreVertIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedMember && (
        <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => openDialog('role', selectedMember)}>Cambiar Rol</MenuItem>
          <MenuItem onClick={() => openDialog('expel', selectedMember)} sx={{ color: 'error.main' }}>Expulsar Miembro</MenuItem>
        </Menu>
      )}

      <Dialog open={dialogState.type === 'role'} onClose={closeDialog}>
        <DialogTitle>Cambiar Rol de {dialogState.member?.email}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Selecciona el nuevo rol para este miembro.</DialogContentText>
          {dialogState.error && <Alert severity="error" sx={{mb:2}}>{dialogState.error}</Alert>}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Rol</InputLabel>
            <Select value={selectedNewRole} label="Rol" onChange={(e) => setSelectedNewRole(e.target.value)}>
              <MenuItem value="MEMBER">Miembro</MenuItem><MenuItem value="MODERATOR">Moderador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={dialogState.loading}>Cancelar</Button>
          <Button onClick={handleRoleChange} variant="contained" disabled={dialogState.loading}>{dialogState.loading ? <CircularProgress size={20}/> : 'Confirmar'}</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={dialogState.type === 'expel'} onClose={closeDialog}>
        <DialogTitle>Expulsar a {dialogState.member?.email}</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro? Esta acción es irreversible.</DialogContentText>
          {dialogState.error && <Alert severity="error" sx={{mt:2}}>{dialogState.error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={dialogState.loading}>Cancelar</Button>
          <Button onClick={handleExpel} variant="contained" color="error" disabled={dialogState.loading}>{dialogState.loading ? <CircularProgress size={20}/> : 'Expulsar'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({...s, open: false}))} message={snackbar.message} />
    </>
  );
};

export default CommunityMembersTab;