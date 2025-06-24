// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import RegisterLayout from '../pages/Register/RegisterLayout';

// Páginas Principales
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage'; // 1. Importamos la página principal de registro
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
import SubscriptionsManagementPage from '../pages/SubscriptionsManagementPage';

// Recuperacion de contraseña
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Verificacion de Correo de Registro
import PleaseVerifyPage from '../pages/PleaseVerifyPage';
import EmailVerifiedPage from '../pages/EmailVerifiedPage';

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
          <Route 
            path="/forgot-password" 
            element={<ForgotPasswordPage />} 
          />
          <Route 
            path="/reset-password/:token" 
            element={<ResetPasswordPage />} 
          />
          <Route 
            path="*" 
            element={<NotFoundPage />} 
          />
          <Route 
            path="/please-verify" 
            element={<PleaseVerifyPage />} 
          />

          <Route 
            path="/email-verified/:token" 
            element={<EmailVerifiedPage />} 
          />

          <Route 
            path="/email-verified" 
            element={<EmailVerifiedPage />} /> {/* Ruta de éxito sin token */}

          <Route 
            path="*" 
            element={<NotFoundPage />} 
          />


          {/* ... (otras rutas) ... */}
                <Route path="/gestionar-suscripciones" element={<ProtectedRoute><SubscriptionsManagementPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />

          {/* Ruta Catch-all para páginas no encontradas dentro del layout principal */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Rutas Públicas (sin Navbar principal) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* NUEVO FLUJO DE REGISTRO ANIDADO */}
        <Route path="/register" element={<RegisterPage />} />

      </Routes>
  );
};

export default AppRouter;