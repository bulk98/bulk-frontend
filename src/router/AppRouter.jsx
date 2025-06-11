// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import RegisterLayout from '../pages/Register/RegisterLayout';

// Páginas Principales
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import CommunitiesListPage from '../pages/CommunitiesListPage';
import CommunityDetailPage from '../pages/CommunityDetailPage';
import PostDetailPage from '../pages/PostDetailPage';
import CreatePostPage from '../pages/CreatePostPage';
import CreateCommunityPage from '../pages/CreateCommunityPage';
import EditCommunityPage from '../pages/EditCommunityPage';
import GuruDashboardPage from '../pages/GuruDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import EditProfilePage from '../pages/EditProfilePage';

// Pasos del Flujo de Registro
import Step1_PersonalInfo from '../pages/Register/Step1_PersonalInfo';
import Step2_Username from '../pages/Register/Step2_Username';
import Step3_UserType from '../pages/Register/Step3_UserType';
import Step4_Password from '../pages/Register/Step4_Password';

// Ruta protegida
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
      <Routes>
        {/* Layout Principal para la aplicación (con Navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/comunidades" element={<CommunitiesListPage />} />
          <Route
            path="/mi-perfil"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
           <Route
            path="/perfil/:userId"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/comunidades/:communityId"
            element={<ProtectedRoute><CommunityDetailPage /></ProtectedRoute>}
          />
          <Route
            path="/posts/:postId"
            element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>}
          />
          <Route
            path="/comunidades/:communityId/crear-post"
            element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>}
          />
          <Route
            path="/crear-comunidad"
            element={<ProtectedRoute allowedUserTypes={['OG']}><CreateCommunityPage /></ProtectedRoute>}
          />
          <Route
            path="/comunidades/:communityId/editar"
            element={<ProtectedRoute allowedUserTypes={['OG']}><EditCommunityPage /></ProtectedRoute>}
          />
          {/* === NUEVA RUTA PARA EDITAR EL PERFIL === */}
          <Route
            path="/perfil/editar"
            element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedUserTypes={['OG']}><GuruDashboardPage /></ProtectedRoute>}
          />
          {/* Ruta Catch-all para páginas no encontradas dentro del layout principal */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Rutas Públicas (sin Navbar principal) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* NUEVO FLUJO DE REGISTRO ANIDADO */}
        <Route path="/registro" element={<RegisterLayout />}>
            {/* Redirige la ruta base /registro al primer paso */}
            <Route index element={<Navigate to="paso-1" replace />} /> 
            <Route path="paso-1" element={<Step1_PersonalInfo />} />
            <Route path="paso-2" element={<Step2_Username />} />
            <Route path="paso-3" element={<Step3_UserType />} />
            <Route path="paso-4" element={<Step4_Password />} />
        </Route>

      </Routes>
  );
};

export default AppRouter;