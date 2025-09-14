import React, { Suspense, lazy } from 'react';
// Simulación: obtenerRolActual debe extraer el rol del token o sesión
const getCurrentRole = () => {
  // TODO: Reemplazar por lógica real de autenticación
  return typeof window !== 'undefined' ? localStorage.getItem('role') || 'student' : 'student';
};

const StudentDashboard = lazy(() => import('./StudentDashboard'));
const PastorDashboard = lazy(() => import('./PastorDashboard'));
const DocenteDashboard = lazy(() => import('./DocenteDashboard'));
const CoordinadorDashboard = lazy(() => import('./CoordinadorDashboard'));
const DecanoDashboard = lazy(() => import('./DecanoDashboard'));

const DashboardRouter: React.FC = () => {
  const role = getCurrentRole();

  return (
    <Suspense fallback={<div>Cargando dashboard...</div>}>
      {role === 'student' && <StudentDashboard />}
      {role === 'pastor' && <PastorDashboard />}
      {role === 'teacher' && <DocenteDashboard />}
      {role === 'coordinator' && <CoordinadorDashboard />}
      {role === 'dean' && <DecanoDashboard />}
      {/* Seguridad: no renderizar dashboards cruzados */}
    </Suspense>
  );
};

export default DashboardRouter;