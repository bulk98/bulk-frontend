// src/components/communities/CommunityDetailsTab.jsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form'; // Se importa Controller
import { Box, TextField, FormControlLabel, Switch, Button, CircularProgress, Alert, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const languages = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Chino", "Japonés"];

// === INICIO DE LA MODIFICACIÓN: El componente ahora recibe props de React Hook Form ===
const CommunityDetailsTab = ({
  control,
  register,
  errors,
  onSubmit,
  isSubmitting,
  isDirty,
  serverError,
  successMessage,
  watch
}) => {
// === FIN DE LA MODIFICACIÓN ===

  const idiomaPrincipalSeleccionado = watch("idiomaPrincipal");

  return (
    // El formulario ahora es manejado por el componente padre a través de onSubmit
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ maxWidth: '700px' }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
      
      <TextField fullWidth required label="Nombre de la Comunidad" margin="normal" error={!!errors.name} helperText={errors.name?.message} {...register("name", { required: "El nombre es obligatorio" })} />
      <TextField fullWidth multiline rows={4} label="Descripción" margin="normal" {...register("description")} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required error={!!errors.idiomaPrincipal}>
                <InputLabel>Idioma Principal</InputLabel>
                <Controller
                    name="idiomaPrincipal"
                    control={control}
                    rules={{ required: "El idioma es obligatorio" }}
                    render={({ field }) => (
                        <Select label="Idioma Principal" {...field} sx={{ minWidth: 120 }}>
                            {languages.map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                        </Select>
                    )}
                />
            </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" disabled={isSubmitting || !idiomaPrincipalSeleccionado}>
                <InputLabel>Idioma Secundario</InputLabel>
                <Controller
                    name="idiomaSecundario"
                    control={control}
                    render={({ field }) => (
                        <Select label="Idioma Secundario" {...field} sx={{ minWidth: 120 }}>
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            {languages.filter(l => l !== idiomaPrincipalSeleccionado).map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
                        </Select>
                    )}
                />
            </FormControl>
        </Grid>
      </Grid>
      
      <FormControlLabel
        control={<Controller name="esPublica" control={control} render={({ field }) => <Switch {...field} checked={field.value} />} />}
        label="Pública (Visible para todos)"
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Guardar Cambios'}
        </Button>
      </Box>
    </Box>
  );
};

export default CommunityDetailsTab;