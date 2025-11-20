import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "../../components/Button";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";
import UserDropdown from "../../components/UserDropdown";

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
          <p className="mt-4 !text-black">Cargando...</p>
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

  // Stat card component with enhanced design
  const StatCard = ({ 
    title, 
    value, 
    color, 
    icon,
    loading 
  }: { 
    title: string; 
    value: number | string; 
    color: string; 
    icon: React.ReactNode;
    loading: boolean;
  }) => {
    // Extract color class to determine icon color
    const iconColor = color.includes('blue') ? 'text-blue-500' : 
                     color.includes('green') ? 'text-green-500' : 
                     color.includes('orange') ? 'text-orange-500' : 
                     color.includes('purple') ? 'text-purple-500' : 'text-gray-500';
    
    return (
      <div className={`
        bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300
        hover:shadow-xl hover:-translate-y-1 border-b-4 ${color}
        flex flex-col items-center
      `}>
        <div className={`mb-4 p-3 rounded-full bg-gray-100 ${iconColor}`}>
          {icon}
        </div>
        <div className="text-4xl font-bold !text-black mb-2 transition-all duration-500">
          {loading ? (
            <div className="inline-block animate-pulse bg-gray-200 rounded w-12 h-10"></div>
          ) : (
            value
          )}
        </div>
        <div className="!text-black font-semibold text-lg uppercase tracking-wide">
          {title}
        </div>
      </div>
    );
  };

  // Action card component with enhanced design
  const ActionCard = ({ 
    href, 
    title, 
    description, 
    color, 
    icon 
  }: { 
    href?: string; 
    title: string; 
    description: string; 
    color: string; 
    icon: React.ReactNode;
  }) => {
    // Extract color class to determine icon color
    const iconColor = color.includes('blue') ? 'text-blue-500' : 
                     color.includes('green') ? 'text-green-500' : 
                     color.includes('orange') ? 'text-orange-500' : 
                     color.includes('purple') ? 'text-purple-500' : 
                     color.includes('indigo') ? 'text-indigo-500' : 
                     color.includes('teal') ? 'text-teal-500' : 'text-gray-500';
    
    const content = (
      <div className={`
        rounded-2xl p-6 text-center transition-all duration-300
        border-2 border-gray-200 hover:border-2 ${color}
        bg-white hover:bg-gray-50
        transform hover:-translate-y-1 hover:shadow-lg
      `}>
        <div className={`text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 ${iconColor}`}>
          {icon}
        </div>
        <div className="font-bold !text-black text-xl mb-2 transition-colors duration-300 group-hover:!text-blue-700">
          {title}
        </div>
        <div className="!text-black text-sm">
          {description}
        </div>
        <div className="mt-4 flex items-center justify-center !text-blue-600 font-medium text-sm">
          Acceder
          <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    );
    
    if (href) {
      return (
        <Link href={href} className="block group">
          {content}
        </Link>
      );
    }
    
    return (
      <div className="block group cursor-pointer">
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div>
        <UserDropdown />
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
          <StatCard 
            title="Prácticas Totales" 
            value={stats.totalPractices} 
            color="border-blue-500" 
            icon={
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Prácticas Activas" 
            value={stats.activePractices} 
            color="border-green-500" 
            icon={
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Horas Completadas" 
            value={stats.completedHours} 
            color="border-purple-500" 
            icon={
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Reportes Pendientes" 
            value={stats.pendingReports} 
            color="border-orange-500" 
            icon={
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            loading={loading}
          />
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full mb-8">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Acciones Rápidas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard 
              href="/dashboard/estudiante/mis-practicas"
              title="Mis Prácticas"
              description="Ver y gestionar prácticas"
              color="border-blue-500 hover:border-blue-600"
              icon="📋"
            />
            
            <ActionCard 
              title="Crear Reporte"
              description="Registrar actividades"
              color="border-green-500 hover:border-green-600"
              icon="📝"
            />
            
            <ActionCard 
              title="Mi Progreso"
              description="Ver estadísticas"
              color="border-purple-500 hover:border-purple-600"
              icon="📊"
            />
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Actividad Reciente
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 !text-black">Cargando actividad...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="font-semibold !text-black">
                    Práctica iniciada
                  </div>
                  <div className="text-sm !text-black mt-1">Hace 2 días</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-green-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="font-semibold !text-black">
                    Reporte enviado
                  </div>
                  <div className="text-sm !text-black mt-1">Hace 1 semana</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}