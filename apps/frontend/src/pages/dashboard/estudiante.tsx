import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "../../components/Button";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";

interface DashboardStats {
  totalPractices: number;
  activePractices: number;
  completedHours: number;
  pendingReports: number;
}

export default function EstudianteDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [stats, setStats] = useState<DashboardStats>({
    totalPractices: 0,
    activePractices: 0,
    completedHours: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardStats();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El AuthContext se encargará de redirigir
  }

  const fetchDashboardStats = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      const response = await authenticatedFetch(`/api/practices?studentId=${userId}`);
      
      if (response.ok) {
        const practices = await response.json();
        const activePractices = practices.filter((p: any) => p.status === 'IN_PROGRESS').length;
        const totalHours = practices.reduce((sum: number, p: any) => sum + (p.completedHours || 0), 0);
        
        setStats({
          totalPractices: practices.length,
          activePractices,
          completedHours: totalHours,
          pendingReports: 0 // Se calculará cuando implementemos reportes
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        <div className="flex items-center gap-4">
          <span>Estudiante</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">E</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center border-4 border-blue-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">{stats.totalPractices}</div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Prácticas Totales</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center border-4 border-green-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">{stats.activePractices}</div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Prácticas Activas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center border-4 border-purple-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">{stats.completedHours}</div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Horas Completadas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center border-4 border-orange-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">{stats.pendingReports}</div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">Reportes Pendientes</div>
          </div>
        </div>

        {/* Navegación rápida */}
        <div className="bg-white rounded-lg shadow p-6 w-full mb-8 border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/estudiante/mis-practicas" className="block">
              <div className="border-4 border-blue-600 hover:border-blue-800 hover:bg-blue-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-blue-900 text-4xl mb-4">📋</div>
                <div className="font-extrabold !text-slate-900 text-xl">Mis Prácticas</div>
                <div className="text-base !text-slate-800 mt-3">Ver y gestionar prácticas</div>
              </div>
            </Link>
            <div className="border-4 border-green-600 hover:border-green-800 hover:bg-green-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
              <div className="text-green-900 text-4xl mb-4">📝</div>
              <div className="font-extrabold !text-slate-900 text-xl">Crear Reporte</div>
              <div className="text-base !text-slate-800 mt-3">Registrar actividades</div>
            </div>
            <div className="border-4 border-purple-600 hover:border-purple-800 hover:bg-purple-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
              <div className="text-purple-900 text-4xl mb-4">📊</div>
              <div className="font-extrabold !text-slate-900 text-xl">Mi Progreso</div>
              <div className="text-base !text-slate-800 mt-3">Ver estadísticas</div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow p-8 w-full border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">Actividad Reciente</h2>
          {loading ? (
            <div className="text-center py-8 !text-slate-900 font-extrabold text-xl">Cargando...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-white rounded-lg border-2 border-slate-300">
                <div className="w-5 h-5 bg-blue-900 rounded-full mt-1" aria-hidden />
                <div className="flex-1">
                  <div className="font-extrabold !text-slate-900 text-lg">Práctica iniciada</div>
                  <div className="text-sm !text-slate-800 mt-1">Hace 2 días</div>
                </div>
              </div>
              <div className="flex items-center gap-6 p-6 bg-white rounded-lg border-2 border-slate-300">
                <div className="w-5 h-5 bg-green-900 rounded-full mt-1" aria-hidden />
                <div className="flex-1">
                  <div className="font-extrabold !text-slate-900 text-lg">Reporte enviado</div>
                  <div className="text-sm !text-slate-800 mt-1">Hace 1 semana</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}