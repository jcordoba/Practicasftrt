import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../../../hooks/useSafeRouter";
import SafeLink from "../../../../components/SafeLink";
import Select from "../../../../components/Select";
import { useAuth, useAuthenticatedFetch } from "../../../../contexts/AuthContext";

interface Union {
  id: string;
  name: string;
}

interface Association {
  id: string;
  name: string;
  description?: string;
  unionId: string;
  union?: Union;
  createdAt: string;
  updatedAt: string;
}

interface CreateAssociationForm {
  name: string;
  description: string;
  unionId: string;
}

export default function AsociacionesPage() {
  const { safePush } = useSafeRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [associations, setAssociations] = useState<Association[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [createForm, setCreateForm] = useState<CreateAssociationForm>({
    name: '',
    description: '',
    unionId: ''
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchData();
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

  const getResponseMessage = async (response: Response, fallback: string) => {
    if (response.status === 401) {
      return 'Sesión expirada o inválida. Inicia sesión nuevamente.';
    }

    try {
      const data = await response.json();
      return data?.message || fallback;
    } catch {
      return fallback;
    }
  };

  const fetchData = async () => {
    try {
      const [associationsRes, unionsRes] = await Promise.all([
        authenticatedFetch('/api/associations'),
        authenticatedFetch('/api/unions')
      ]);

      if (!associationsRes.ok || !unionsRes.ok) {
        const badResponse = !associationsRes.ok ? associationsRes : unionsRes;
        const message = await getResponseMessage(badResponse, 'Error al cargar datos');
        throw new Error(message);
      }

      const [associationsData, unionsData] = await Promise.all([
        associationsRes.json(),
        unionsRes.json()
      ]);

      setAssociations((associationsData || []).map((association: any) => ({
        id: association.id,
        name: association.name ?? association.nombre ?? '',
        description: association.description ?? association.descripcion,
        unionId: association.unionId,
        union: association.union
          ? {
              id: association.union.id,
              name: association.union.name ?? association.union.nombre ?? ''
            }
          : undefined,
        createdAt: association.createdAt ?? association.fecha_creacion,
        updatedAt: association.updatedAt ?? association.fecha_actualizacion,
      })));
      setUnions((unionsData || []).map((union: any) => ({
        id: union.id,
        name: union.name ?? union.nombre ?? ''
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      const isAuthError =
        error instanceof Error &&
        (error.message.includes('Authentication failed') ||
          error.message.includes('No authentication token available'));
      setError(
        isAuthError
          ? 'Sesión expirada o inválida. Inicia sesión nuevamente.'
          : error instanceof Error
            ? error.message
            : 'Error al cargar los datos',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch('/api/associations', {
        method: 'POST',
        body: JSON.stringify({
          nombre: createForm.name,
          descripcion: createForm.description || undefined,
          unionId: createForm.unionId
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear asociación');
      }

      setCreateForm({ name: '', description: '', unionId: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating association:', error);
      setError('Error al crear la asociación');
    }
  };

  const handleUpdateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssociation) return;

    try {
      const response = await authenticatedFetch(`/api/associations/${editingAssociation.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: editingAssociation.name,
          descripcion: editingAssociation.description || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar asociación');
      }

      setEditingAssociation(null);
      fetchData();
    } catch (error) {
      console.error('Error updating association:', error);
      setError('Error al actualizar la asociación');
    }
  };

  const handleDeleteAssociation = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta asociación?')) {
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/associations/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar asociación');
      }

      fetchData();
    } catch (error) {
      console.error('Error deleting association:', error);
      setError('Error al eliminar la asociación');
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
        <div className="text-lg">Cargando asociaciones...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador/organizacion" className="text-white hover:text-blue-200 transition flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR - Asociaciones</h1>
        </div>
      </header>

      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            {error}
          </div>
        )}

        {/* Botón Crear Nueva Asociación */}
        <div className="w-full mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            + Crear Nueva Asociación
          </button>
        </div>

        {/* Formulario de Creación */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 w-full mb-6 border-2 border-green-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium !text-slate-900">Crear Nueva Asociación</h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="!text-slate-600 hover:!text-slate-800"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateAssociation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium !text-slate-800 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 !text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-slate-800 mb-1">Unión</label>
                <Select
                  label=""
                  required
                  value={createForm.unionId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, unionId: e.target.value }))}
                  options={[
                    { value: '', label: 'Seleccionar Unión' },
                    ...unions.map(union => ({ value: union.id, label: union.name }))
                  ]}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 !text-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 !text-black"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                >
                  Crear Asociación
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Asociaciones */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold !text-slate-900">Asociaciones Registradas</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold !text-blue-900 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold !text-blue-900 uppercase tracking-wider">
                    Unión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold !text-blue-900 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold !text-blue-900 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold !text-blue-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {associations.map((association) => (
                  <tr key={association.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium !text-slate-900">{association.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-700">
                        {association.union?.name || 'Sin unión asignada'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm !text-slate-700">{association.description || 'Sin descripción'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-700">
                        {new Date(association.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingAssociation(association)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAssociation(association.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {associations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm !text-slate-500">
                      No hay asociaciones registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Edición */}
        {editingAssociation && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-semibold !text-slate-900">Editar Asociación</h3>
                <button
                  type="button"
                  onClick={() => setEditingAssociation(null)}
                  className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 !text-slate-600 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateAssociation} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold !text-slate-800 mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editingAssociation.name}
                    onChange={(e) => setEditingAssociation(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 !text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold !text-slate-800 mb-2">Unión</label>
                  <Select
                    label=""
                    required
                    value={editingAssociation.unionId}
                    onChange={(e) => setEditingAssociation(prev => prev ? { ...prev, unionId: e.target.value } : null)}
                    options={[
                      { value: '', label: 'Seleccionar Unión' },
                      ...unions.map(union => ({ value: union.id, label: union.name }))
                    ]}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 !text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold !text-slate-800 mb-2">Descripción</label>
                  <input
                    type="text"
                    value={editingAssociation.description || ''}
                    onChange={(e) => setEditingAssociation(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 !text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAssociation(null)}
                    className="bg-slate-200 hover:bg-slate-300 !text-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}