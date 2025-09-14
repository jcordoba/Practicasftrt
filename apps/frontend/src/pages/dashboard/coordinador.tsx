// apps/frontend/src/pages/dashboard/coordinador.tsx
import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../hooks/useSafeRouter";
import SafeLink from "../../components/SafeLink";
import { useAuth, useAuthenticatedFetch } from "../../contexts/AuthContext";

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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
    safePush("/login");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100">
      {/* Header oscuro: contraste OK */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        <div className="flex items-center gap-4">
          <span>Coordinador</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">C</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4">
        {/* Estadísticas: fondo blanco, texto oscuro forzado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-blue-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {loading ? "…" : stats.totalStudents}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Estudiantes
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-green-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {loading ? "…" : stats.activePractices}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Prácticas activas
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-orange-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {loading ? "…" : stats.pendingAssignments}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Asignaciones pendientes
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-purple-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {loading ? "…" : stats.completedPractices}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Prácticas completadas
            </div>
          </div>
        </div>

        {/* Caja de acciones: título y tarjetas con texto muy oscuro */}
        <div className="bg-white rounded-lg shadow p-8 w-full mb-8 border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">
            Gestión de prácticas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SafeLink href="/dashboard/coordinador/practicas" className="block">
              <div className="border-4 border-blue-600 hover:border-blue-800 hover:bg-blue-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-blue-900 text-4xl mb-4">📋</div>
                <div className="font-extrabold !text-slate-900 text-xl">Gestionar prácticas</div>
                <div className="text-base !text-slate-800 mt-3">Crear y administrar prácticas</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/coordinador/asignar-estudiante" className="block">
              <div className="border-4 border-green-600 hover:border-green-800 hover:bg-green-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-green-900 text-4xl mb-4">👥</div>
                <div className="font-extrabold !text-slate-900 text-xl">Asignar estudiantes</div>
                <div className="text-base !text-slate-800 mt-3">Asignar estudiantes a iglesias</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/coordinador/grupos-svga" className="block">
              <div className="border-4 border-orange-600 hover:border-orange-800 hover:bg-orange-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-orange-900 text-4xl mb-4">🎓</div>
                <div className="font-extrabold !text-slate-900 text-xl">Sistema SVGA</div>
                <div className="text-base !text-slate-800 mt-3">Gestión de grupos y calificaciones</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/sion-mobile" className="block">
              <div className="border-4 border-purple-600 hover:border-purple-800 hover:bg-purple-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-purple-900 text-4xl mb-4">📱</div>
                <div className="font-extrabold !text-slate-900 text-xl">Dashboard SION</div>
                <div className="text-base !text-slate-800 mt-3">Dashboard mobile con paneles configurables</div>
              </div>
            </SafeLink>
          </div>
        </div>

        {/* Gestión Organizacional */}
        <div className="bg-white rounded-lg shadow p-8 w-full mb-8 border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">
            Gestión Organizacional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SafeLink href="/dashboard/coordinador/organizacion" className="block">
              <div className="border-4 border-indigo-600 hover:border-indigo-800 hover:bg-indigo-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-indigo-900 text-4xl mb-4">🏛️</div>
                <div className="font-extrabold !text-slate-900 text-xl">Jerarquía Organizacional</div>
                <div className="text-base !text-slate-800 mt-3">Gestionar Uniones, Asociaciones, Distritos y Congregaciones</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/coordinador/usuarios" className="block">
              <div className="border-4 border-teal-600 hover:border-teal-800 hover:bg-teal-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-teal-900 text-4xl mb-4">👤</div>
                <div className="font-extrabold !text-slate-900 text-xl">Gestión de Usuarios</div>
                <div className="text-base !text-slate-800 mt-3">Administrar usuarios y roles del sistema</div>
              </div>
            </SafeLink>
          </div>
        </div>

        {/* Actividad reciente: fondo BLANCO y texto forzado oscuro */}
        <div className="bg-white rounded-lg shadow p-8 w-full border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">
            Actividad reciente
          </h2>

          {loading ? (
            <div className="text-center py-8 !text-slate-900 font-extrabold text-xl">
              Cargando…
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-white rounded-lg border-2 border-slate-300">
                <div className="w-5 h-5 bg-blue-900 rounded-full mt-1" aria-hidden />
                <div className="flex-1">
                  <div className="font-extrabold !text-slate-900 text-lg">
                    Nueva práctica creada
                  </div>
                  <div className="text-sm !text-slate-800 mt-1">Hace 1 hora</div>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 bg-white rounded-lg border-2 border-slate-300">
                <div className="w-5 h-5 bg-green-900 rounded-full mt-1" aria-hidden />
                <div className="flex-1">
                  <div className="font-extrabold !text-slate-900 text-lg">
                    Estudiante asignado a iglesia
                  </div>
                  <div className="text-sm !text-slate-800 mt-1">Hace 2 horas</div>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 bg-white rounded-lg border-2 border-slate-300">
                <div className="w-5 h-5 bg-purple-900 rounded-full mt-1" aria-hidden />
                <div className="flex-1">
                  <div className="font-extrabold !text-slate-900 text-lg">
                    Reporte de práctica recibido
                  </div>
                  <div className="text-sm !text-slate-800 mt-1">Hace 1 día</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}