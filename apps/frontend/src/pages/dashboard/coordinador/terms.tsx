import React, { useState, useEffect } from 'react';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import { useSafeRouter } from '../../../hooks/useSafeRouter';
import UserDropdown from '../../../components/UserDropdown';

interface Term {
  id: string;
  name: string;
  academicYear: number;
  academicPeriod: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TermFormData {
  name: string;
  academicYear: number;
  academicPeriod: number;
  startDate: string;
  endDate: string;
  status: string;
}

export default function Terms() {
  const { safePush } = useSafeRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  // Filtros
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Formulario
  const [formData, setFormData] = useState<TermFormData>({
    name: '',
    academicYear: new Date().getFullYear(),
    academicPeriod: 1,
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTerms();
    }
  }, [authLoading, isAuthenticated]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/terms';
      const params = new URLSearchParams();
      
      if (filterYear) params.append('academicYear', filterYear);
      if (filterStatus) params.append('status', filterStatus);
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await authenticatedFetch(url);
      if (response.ok) {
        const data = await response.json();
        setTerms(data);
      }
    } catch (err: any) {
      console.error('Error fetching terms:', err);
      setError(err.message || 'Error al cargar los términos académicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const url = editingTerm
        ? `/api/terms/${editingTerm.id}`
        : '/api/terms';

      const method = editingTerm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el término');
      }

      setSuccessMessage(
        editingTerm
          ? 'Término actualizado exitosamente'
          : 'Término creado exitosamente'
      );
      setShowForm(false);
      setEditingTerm(null);
      resetForm();
      fetchTerms();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el término');
    }
  };

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setFormData({
      name: term.name,
      academicYear: term.academicYear,
      academicPeriod: term.academicPeriod,
      startDate: term.startDate.split('T')[0],
      endDate: term.endDate.split('T')[0],
      status: term.status,
    });
    setShowForm(true);
  };

  const handleActivate = async (termId: string) => {
    if (!confirm('¿Marcar este término como activo? Los demás términos serán desactivados.')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/terms/${termId}/activate`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al activar el término');
      }

      setSuccessMessage('Término activado exitosamente');
      fetchTerms();
    } catch (err: any) {
      setError(err.message || 'Error al activar el término');
    }
  };

  const handleChangeStatus = async (termId: string, newStatus: string) => {
    if (!confirm(`¿Cambiar el estado del término a "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/terms/${termId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar el estado');
      }

      setSuccessMessage('Estado actualizado exitosamente');
      fetchTerms();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      academicYear: new Date().getFullYear(),
      academicPeriod: 1,
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
    });
    setEditingTerm(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-300',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-300',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    const labels = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      COMPLETED: 'Completado',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPeriodLabel = (period: number) => {
    return period === 1 ? 'Primer Semestre' : 'Segundo Semestre';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => safePush('/dashboard/coordinador')}
            className="text-white hover:text-slate-300"
          >
            ← Volver
          </button>
          <h1 className="text-xl font-bold !text-white">Gestión de Términos Académicos</h1>
        </div>
        <UserDropdown />
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}
        {/* Actions and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  resetForm();
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Término'}
            </button>

            <div>
              <label className="block !text-slate-900 font-bold mb-2">Áño Académico</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los años</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block !text-slate-900 font-bold mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="COMPLETED">Completado</option>
              </select>
            </div>

            <button
              onClick={fetchTerms}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold self-end"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold !text-slate-900 mb-4">
              {editingTerm ? 'Editar Término' : 'Crear Nuevo Término'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block !text-slate-900 font-bold mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: 2025-1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block !text-slate-900 font-bold mb-2">Año Académico *</label>
                <input
                  type="number"
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: parseInt(e.target.value) })
                  }
                  min="2020"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block !text-slate-900 font-bold mb-2">Período Académico *</label>
                <select
                  value={formData.academicPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, academicPeriod: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  required
                >
                  <option value="1">Primer Semestre</option>
                  <option value="2">Segundo Semestre</option>
                </select>
              </div>

              <div>
                <label className="block !text-slate-900 font-bold mb-2">Estado *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  required
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="COMPLETED">Completado</option>
                </select>
              </div>

              <div>
                <label className="block !text-slate-900 font-bold mb-2">Fecha de Inicio *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block !text-slate-900 font-bold mb-2">Fecha de Fin *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                >
                  {editingTerm ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Terms Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12 !text-slate-900">
              Cargando términos académicos...
            </div>
          ) : terms.length === 0 ? (
            <div className="text-center py-12 !text-slate-900">
              No se encontraron términos académicos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Año</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Período</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fecha Inicio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fecha Fin</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {terms.map((term) => (
                    <tr key={term.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 !text-slate-900 font-semibold">{term.name}</td>
                      <td className="px-6 py-4 !text-slate-900">{term.academicYear}</td>
                      <td className="px-6 py-4 !text-slate-900">{getPeriodLabel(term.academicPeriod)}</td>
                      <td className="px-6 py-4 !text-slate-900">
                        {new Date(term.startDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 !text-slate-900">
                        {new Date(term.endDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(term.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(term)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            Editar
                          </button>
                          {term.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleActivate(term.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                              Activar
                            </button>
                          )}
                          {term.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleChangeStatus(term.id, 'COMPLETED')}
                              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                            >
                              Completar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
