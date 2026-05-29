import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../../hooks/useSafeRouter";
import SafeLink from "../../../components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

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

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-b-4 ${color}`}>
      <div className="text-4xl font-bold !text-black mb-2">{value}</div>
      <div className="!text-black font-semibold text-base uppercase tracking-wide">{title}</div>
    </div>
  );

  const ActionCard = ({ href, title, description, color, icon }: { href: string; title: string; description: string; color: string; icon: string }) => (
    <SafeLink href={href} className="block group">
      <div className={`rounded-2xl p-6 text-center transition-all duration-300 border-2 border-gray-200 ${color} bg-white hover:bg-gray-50 transform hover:-translate-y-1 hover:shadow-lg`}>
        <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <div className="font-bold !text-black text-xl mb-2 transition-colors duration-300 group-hover:!text-blue-700">{title}</div>
        <div className="!text-black text-sm">{description}</div>
      </div>
    </SafeLink>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-blue-200 transition flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR - Organización</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-8">
          <StatCard title="Uniones" value={stats.totalUnions} color="border-blue-500" />
          <StatCard title="Asociaciones" value={stats.totalAssociations} color="border-green-500" />
          <StatCard title="Distritos" value={stats.totalDistricts} color="border-orange-500" />
          <StatCard title="Congregaciones" value={stats.totalCongregations} color="border-purple-500" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 w-full mb-8">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Gestión Organizacional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActionCard href="/dashboard/coordinador/organizacion/uniones" title="Uniones" description="Gestionar uniones" color="hover:border-blue-500" icon="🏛️" />
            <ActionCard href="/dashboard/coordinador/organizacion/asociaciones" title="Asociaciones" description="Gestionar asociaciones" color="hover:border-green-500" icon="🏢" />
            <ActionCard href="/dashboard/coordinador/organizacion/distritos" title="Distritos" description="Gestionar distritos" color="hover:border-orange-500" icon="🏘️" />
            <ActionCard href="/dashboard/coordinador/organizacion/congregaciones" title="Congregaciones" description="Gestionar congregaciones" color="hover:border-purple-500" icon="⛪" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <h3 className="text-2xl font-bold mb-6 !text-black flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
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