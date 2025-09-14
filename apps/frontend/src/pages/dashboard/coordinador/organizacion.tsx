import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../../hooks/useSafeRouter";
import SafeLink from "../../../components/SafeLink";

interface OrganizationalStats {
  totalUnions: number;
  totalAssociations: number;
  totalDistricts: number;
  totalCongregations: number;
}

export default function OrganizacionPage() {
  const { safePush } = useSafeRouter();
  const [stats, setStats] = useState<OrganizationalStats>({
    totalUnions: 0,
    totalAssociations: 0,
    totalDistricts: 0,
    totalCongregations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizationalStats();
  }, []);

  const fetchOrganizationalStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        safePush('/login');
        return;
      }

      // Fetch stats from each organizational endpoint
      const [unionsRes, associationsRes, districtsRes, congregationsRes] = await Promise.all([
        fetch('/api/unions', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/associations', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/districts', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/congregations', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [unions, associations, districts, congregations] = await Promise.all([
        unionsRes.json(),
        associationsRes.json(),
        districtsRes.json(),
        congregationsRes.json()
      ]);

      setStats({
        totalUnions: unions.length || 0,
        totalAssociations: associations.length || 0,
        totalDistricts: districts.length || 0,
        totalCongregations: congregations.length || 0
      });
    } catch (error) {
      console.error('Error fetching organizational stats:', error);
      setError('Error al cargar estadísticas organizacionales');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando datos organizacionales...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-yellow-400 transition">
            ← Volver al Dashboard
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR - Organización</h1>
        </div>
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
        {/* Estadísticas Organizacionales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-blue-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {stats.totalUnions}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Uniones
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-green-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {stats.totalAssociations}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Asociaciones
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-orange-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {stats.totalDistricts}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Distritos
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center border-4 border-purple-600">
            <div className="text-6xl font-black !text-slate-900 mb-4">
              {stats.totalCongregations}
            </div>
            <div className="!text-slate-800 font-semibold text-lg uppercase tracking-wide">
              Congregaciones
            </div>
          </div>
        </div>

        {/* Gestión Organizacional */}
        <div className="bg-white rounded-lg shadow p-8 w-full mb-8 border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">
            Gestión Organizacional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SafeLink href="/dashboard/coordinador/organizacion/uniones" className="block">
              <div className="border-4 border-blue-600 hover:border-blue-800 hover:bg-blue-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-blue-900 text-4xl mb-4">🏛️</div>
                <div className="font-extrabold !text-slate-900 text-xl">Uniones</div>
                <div className="text-base !text-slate-800 mt-3">Gestionar uniones</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/coordinador/organizacion/asociaciones" className="block">
              <div className="border-4 border-green-600 hover:border-green-800 hover:bg-green-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-green-900 text-4xl mb-4">🏢</div>
                <div className="font-extrabold !text-slate-900 text-xl">Asociaciones</div>
                <div className="text-base !text-slate-800 mt-3">Gestionar asociaciones</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/coordinador/organizacion/distritos" className="block">
              <div className="border-4 border-orange-600 hover:border-orange-800 hover:bg-orange-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-orange-900 text-4xl mb-4">🏘️</div>
                <div className="font-extrabold !text-slate-900 text-xl">Distritos</div>
                <div className="text-base !text-slate-800 mt-3">Gestionar distritos</div>
              </div>
            </SafeLink>

            <SafeLink href="/dashboard/coordinador/organizacion/congregaciones" className="block">
              <div className="border-4 border-purple-600 hover:border-purple-800 hover:bg-purple-50 rounded-lg p-6 text-center transition cursor-pointer bg-white">
                <div className="text-purple-900 text-4xl mb-4">⛪</div>
                <div className="font-extrabold !text-slate-900 text-xl">Congregaciones</div>
                <div className="text-base !text-slate-800 mt-3">Gestionar congregaciones</div>
              </div>
            </SafeLink>
          </div>
        </div>

        {/* Jerarquía Organizacional */}
        <div className="bg-white rounded-lg shadow p-8 w-full border-4 border-slate-600">
          <h3 className="text-2xl font-extrabold mb-6 !text-slate-900 uppercase tracking-wide">
            Jerarquía Organizacional
          </h3>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 border-2 border-blue-600 rounded-lg px-6 py-3">
                <div className="text-blue-900 text-2xl mb-2">🏛️</div>
                <div className="font-bold !text-slate-900">Unión</div>
              </div>
            </div>
            <div className="text-2xl !text-slate-600">↓</div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 border-2 border-green-600 rounded-lg px-6 py-3">
                <div className="text-green-900 text-2xl mb-2">🏢</div>
                <div className="font-bold !text-slate-900">Asociación</div>
              </div>
            </div>
            <div className="text-2xl !text-slate-600">↓</div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 border-2 border-orange-600 rounded-lg px-6 py-3">
                <div className="text-orange-900 text-2xl mb-2">🏘️</div>
                <div className="font-bold !text-slate-900">Distrito</div>
              </div>
            </div>
            <div className="text-2xl !text-slate-600">↓</div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 border-2 border-purple-600 rounded-lg px-6 py-3">
                <div className="text-purple-900 text-2xl mb-2">⛪</div>
                <div className="font-bold !text-slate-900">Congregación</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}