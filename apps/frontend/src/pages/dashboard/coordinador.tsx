// apps/frontend/src/pages/dashboard/coordinador.tsx
import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../hooks/useSafeRouter";
import SafeLink from "../../components/SafeLink";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";
import UserDropdown from "../../components/UserDropdown";

/* ==== Tipos ==== */
interface DashboardStats {
  totalStudents: number;
  activePractices: number;
  pendingAssignments: number;
  completedPractices: number;
}

export default function CoordinadorDashboard() {
  const { safePush } = useSafeRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activePractices: 0,
    pendingAssignments: 0,
    completedPractices: 0,
  });
  const [loading, setLoading] = useState(true);

  /* Defensas contra hard navigate a la misma ruta */
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement)?.closest("a") as HTMLAnchorElement | null;
      if (!el) return;
      const href = el.getAttribute("href");
      if (!href || (el.target && el.target !== "_self")) return;
      try {
        const target = href.startsWith("http")
          ? new URL(href).pathname
          : new URL(href, window.location.origin).pathname;
        const current = window.location.pathname;
        if (target === current) {
          e.preventDefault();
          e.stopPropagation();
        }
      } catch {}
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

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
      const res = await authenticatedFetch("/api/practices");

      let practices: any[] = [];
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) {
        practices = await res.json();
      } else {
        // fallback visible mientras conectas API real
        practices = [
          { status: "IN_PROGRESS" },
          { status: "IN_PROGRESS" },
          { status: "COMPLETED" },
          { status: "PENDING" },
        ];
      }

      const activePractices = practices.filter((p) => p.status === "IN_PROGRESS").length;
      const completedPractices = practices.filter((p) => p.status === "COMPLETED").length;
      const pendingAssignments = practices.filter((p) => p.status === "PENDING").length;

      setStats({
        totalStudents: practices.length,
        activePractices,
        pendingAssignments,
        completedPractices,
      });
    } catch (e) {
      setStats({
        totalStudents: 45,
        activePractices: 12,
        pendingAssignments: 8,
        completedPractices: 25,
      });
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
    href: string; 
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
    
    return (
      <SafeLink href={href} className="block group">
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
      </SafeLink>
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
            title="Estudiantes" 
            value={stats.totalStudents} 
            color="border-blue-500" 
            icon={
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Prácticas activas" 
            value={stats.activePractices} 
            color="border-green-500" 
            icon={
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Asignaciones pendientes" 
            value={stats.pendingAssignments} 
            color="border-orange-500" 
            icon={
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
          
          <StatCard 
            title="Prácticas completadas" 
            value={stats.completedPractices} 
            color="border-purple-500" 
            icon={
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
        </div>

        {/* Enhanced Management Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full mb-8">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Gestión de prácticas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard 
              href="/dashboard/coordinador/practicas"
              title="Gestionar prácticas"
              description="Crear y administrar prácticas"
              color="border-blue-500 hover:border-blue-600"
              icon="📋"
            />
            
            <ActionCard 
              href="/dashboard/coordinador/asignar-estudiante"
              title="Asignar estudiantes"
              description="Asignar estudiantes a iglesias"
              color="border-green-500 hover:border-green-600"
              icon="👥"
            />
            
            <ActionCard 
              href="/dashboard/coordinador/validar-reportes"
              title="Validar reportes"
              description="Revisar y validar reportes de horas"
              color="border-teal-500 hover:border-teal-600"
              icon="✅"
            />
            
            <ActionCard 
              href="/dashboard/coordinador/grupos-svga"
              title="Sistema SVGA"
              description="Gestión de grupos y calificaciones"
              color="border-orange-500 hover:border-orange-600"
              icon="🎓"
            />
            
            <ActionCard 
              href="/dashboard/sion-mobile"
              title="Dashboard SION"
              description="Dashboard mobile con paneles configurables"
              color="border-purple-500 hover:border-purple-600"
              icon="📱"
            />
          </div>
        </div>

        {/* Enhanced Organizational Management */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full mb-8">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Gestión Organizacional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
              href="/dashboard/coordinador/centers"
              title="Centros de Práctica"
              description="Gestionar iglesias e instituciones donde se realizan las prácticas"
              color="border-indigo-500 hover:border-indigo-600"
              icon="🏛️"
            />
            
            <ActionCard 
              href="/dashboard/coordinador/terms"
              title="Términos Académicos"
              description="Gestionar períodos académicos y semestres de las prácticas"
              color="border-indigo-500 hover:border-indigo-600"
              icon="📅"
            />
            
            <ActionCard 
              href="/dashboard/coordinador/organizacion"
              title="Jerarquía Organizacional"
              description="Gestionar Uniones, Asociaciones, Distritos y Congregaciones"
              color="border-indigo-500 hover:border-indigo-600"
              icon="🏢"
            />
          </div>
        </div>

        {/* Enhanced User Management */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full mb-8">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Gestión de Usuarios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard 
              href="/dashboard/coordinador/usuarios"
              title="Gestión de Usuarios"
              description="Administrar usuarios y roles del sistema"
              color="border-teal-500 hover:border-teal-600"
              icon="👤"
            />
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Actividad reciente
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
                    Nueva práctica creada
                  </div>
                  <div className="text-sm !text-black mt-1">Hace 1 hora</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-green-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="font-semibold !text-black">
                    Estudiante asignado a iglesia
                  </div>
                  <div className="text-sm !text-black mt-1">Hace 2 horas</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-purple-50 transition-colors duration-200">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="font-semibold !text-black">
                    Reporte de práctica recibido
                  </div>
                  <div className="text-sm !text-black mt-1">Hace 1 día</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}