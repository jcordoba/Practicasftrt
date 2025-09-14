import React, { useState, useEffect } from "react";
import { useSafeRouter } from "../../../../hooks/useSafeRouter";
import SafeLink from "../../../../components/SafeLink";
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

  const fetchData = async () => {
    try {
      const [associationsRes, unionsRes] = await Promise.all([
        authenticatedFetch('/api/associations'),
        authenticatedFetch('/api/unions')
      ]);

      if (!associationsRes.ok || !unionsRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const [associationsData, unionsData] = await Promise.all([
        associationsRes.json(),
        unionsRes.json()
      ]);

      setAssociations(associationsData);
      setUnions(unionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch('/api/associations', {
        method: 'POST',
        body: JSON.stringify(createForm)
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
          name: editingAssociation.name,
          description: editingAssociation.description,
          unionId: editingAssociation.unionId
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
          <SafeLink href="/dashboard/coordinador/organizacion" className="text-white hover:text-yellow-400 transition">
            ← Volver a Organización
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR - Asociaciones</h1>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-slate-800 mb-1">Unión</label>
                <select
                  required
                  value={createForm.unionId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, unionId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar Unión</option>
                  {unions.map(union => (
                    <option key={union.id} value={union.id}>{union.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción</label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
        <div className="bg-white rounded-lg shadow w-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium !text-slate-900">Asociaciones Registradas ({associations.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Unión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {associations.map((association) => (
                  <tr key={association.id} className="hover:bg-gray-50">
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
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAssociation(association.id)}
                          className="text-red-600 hover:text-red-900"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium !text-slate-900">Editar Asociación</h3>
                <button
                  type="button"
                  onClick={() => setEditingAssociation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateAssociation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium !text-slate-800 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editingAssociation.name}
                    onChange={(e) => setEditingAssociation(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium !text-slate-800 mb-1">Unión</label>
                  <select
                    required
                    value={editingAssociation.unionId}
                    onChange={(e) => setEditingAssociation(prev => prev ? { ...prev, unionId: e.target.value } : null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar Unión</option>
                    {unions.map(union => (
                      <option key={union.id} value={union.id}>{union.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={editingAssociation.description || ''}
                    onChange={(e) => setEditingAssociation(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingAssociation(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Cancelar
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