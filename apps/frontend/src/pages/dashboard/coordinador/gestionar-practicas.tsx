import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';
import CustomCalendar from '../../../components/CustomCalendar';
import Select from '../../../components/Select';

interface Practice {
  id: string;
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  hours: number;
  studentId: string;
  tutorId?: string | null;
  teacherId?: string | null;
  student?: { name: string; email: string };
  tutor?: { name: string; email: string } | null;
  teacher?: { name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface CreatePracticeForm {
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  hours: number;
  studentId: string;
  tutorId: string;
  teacherId: string;
}

export default function GestionarPracticas() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('all');
  const [createForm, setCreateForm] = useState<CreatePracticeForm>({
    name: '',
    description: '',
    institution: '',
    startDate: '',
    endDate: '',
    hours: 60,
    studentId: '',
    tutorId: '',
    teacherId: ''
  });
  const [showStartDateCalendar, setShowStartDateCalendar] = useState(false);
  const [showEndDateCalendar, setShowEndDateCalendar] = useState(false);
  const [showEditStartDateCalendar, setShowEditStartDateCalendar] = useState(false);
  const [showEditEndDateCalendar, setShowEditEndDateCalendar] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPractices();
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

  const fetchPractices = async () => {
    try {
      setLoading(true);
      
      const response = await authenticatedFetch('/api/practices');
      
      if (!response.ok) {
        throw new Error('Error al cargar prácticas');
      }
      
      const data = await response.json();
      setPractices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching practices:', error);
      setLoading(false);
    }
  };

  const handleCreatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestBody: any = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        institution: createForm.institution.trim(),
        startDate: new Date(createForm.startDate).toISOString(),
        endDate: new Date(createForm.endDate).toISOString(),
        hours: parseInt(String(createForm.hours)),
        studentId: createForm.studentId.trim()
      };

      // Add optional fields only if provided
      if (createForm.tutorId?.trim()) {
        requestBody.tutorId = createForm.tutorId.trim();
      }
      if (createForm.teacherId?.trim()) {
        requestBody.teacherId = createForm.teacherId.trim();
      }

      // Ensure required fields are not empty
      if (!requestBody.name || !requestBody.studentId) {
        throw new Error('Los campos Nombre y Estudiante son obligatorios');
      }

      console.log('Sending request body:', requestBody);

      const response = await authenticatedFetch('/api/practices', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `Error ${response.status}: ${errorText}`);
      }
      
      await fetchPractices();
      setCreateForm({
        name: '',
        description: '',
        institution: '',
        startDate: '',
        endDate: '',
        hours: 60,
        studentId: '',
        tutorId: '',
        teacherId: ''
      });
      setShowCreateForm(false);
      alert('Práctica creada exitosamente');
    } catch (error) {
      console.error('Error creating practice:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la práctica');
    }
  };

  const handleUpdatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPractice) return;
    
    try {
      const response = await authenticatedFetch(`/api/practices/${editingPractice.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingPractice.name,
          description: editingPractice.description,
          institution: editingPractice.institution,
          startDate: new Date(editingPractice.startDate).toISOString(),
          endDate: new Date(editingPractice.endDate).toISOString(),
          hours: editingPractice.hours,
          status: editingPractice.status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la práctica');
      }
      
      await fetchPractices();
      setEditingPractice(null);
      alert('Práctica actualizada exitosamente');
    } catch (error) {
      console.error('Error updating practice:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar la práctica');
    }
  };

  const handleDeletePractice = async (practiceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta práctica?')) return;
    
    try {
      const response = await authenticatedFetch(`/api/practices/${practiceId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la práctica');
      }
      
      await fetchPractices();
      alert('Práctica eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting practice:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la práctica');
    }
  };

  const filteredPractices = practices.filter(practice => {
    const matchesSearch = practice.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || practice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-green-100 !text-white';
      case 'PENDING': return 'bg-yellow-100 !text-white';
      case 'COMPLETED': return 'bg-blue-100 !text-white';
      case 'CANCELLED': return 'bg-red-100 !text-white';
      default: return 'bg-gray-100 !text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'En Progreso';
      case 'PENDING': return 'Pendiente';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-100">
        <div className="text-lg !text-slate-900">Cargando prácticas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-white hover:text-blue-200 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-xl font-bold !text-white">Gestionar Prácticas</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
          >
            Nueva Práctica
          </button>
          <div className="flex items-center gap-2">
            <span>Coordinador</span>
            <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">C</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Buscar por nombre, estudiante o institución..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <Select
                label=""
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                options={[
                  { value: 'all', label: 'Todos los estados' },
                  { value: 'PENDING', label: 'Pendientes' },
                  { value: 'IN_PROGRESS', label: 'En Progreso' },
                  { value: 'COMPLETED', label: 'Completadas' },
                  { value: 'CANCELLED', label: 'Canceladas' }
                ]}
                className="border border-gray-300 rounded-xl pl-3 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5"
              />
            </div>
          </div>
        </div>

        {/* Lista de Prácticas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium !text-slate-900">
              Prácticas ({filteredPractices.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Práctica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Institución
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium !text-slate-800 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPractices.map((practice) => (
                  <tr key={practice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium !text-slate-900">{practice.name}</div>
                      <div className="text-xs !text-slate-600">{practice.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-900">{practice.student?.name || 'Sin asignar'}</div>
                      <div className="text-xs !text-slate-600">{practice.student?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-900">{practice.institution}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-900">
                        {new Date(practice.startDate).toLocaleDateString()} - 
                        {new Date(practice.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-900">
                        {practice.hours} horas requeridas
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(practice.status)}`}>
                        {getStatusText(practice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPractice(practice)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePractice(practice.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPractices.length === 0 && (
              <div className="text-center py-8">
                <p className="!text-slate-800">No se encontraron prácticas</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Crear Práctica */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePractice}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium !text-slate-900">Nueva Práctica</h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="!text-slate-600 hover:!text-slate-800"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Nombre de la Práctica *</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Ej: Práctica Pastoral I"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Institución *</label>
                    <input
                      type="text"
                      required
                      value={createForm.institution}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Nombre de la institución"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción *</label>
                    <textarea
                      required
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Descripción detallada de la práctica"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Fecha Inicio</label>
                    <input
                      type="text"
                      readOnly
                      value={createForm.startDate ? new Date(createForm.startDate).toLocaleDateString('es-ES') : ''}
                      onClick={() => setShowStartDateCalendar(!showStartDateCalendar)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer"
                      placeholder="Seleccionar fecha"
                    />
                    {showStartDateCalendar && (
                      <div className="absolute z-10 mt-1">
                        <CustomCalendar
                          selectedDate={createForm.startDate ? new Date(createForm.startDate) : null}
                          onDateChange={(date) => {
                            setCreateForm(prev => ({ 
                              ...prev, 
                              startDate: date ? date.toISOString() : '' 
                            }));
                            setShowStartDateCalendar(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Fecha Fin</label>
                    <input
                      type="text"
                      readOnly
                      value={createForm.endDate ? new Date(createForm.endDate).toLocaleDateString('es-ES') : ''}
                      onClick={() => setShowEndDateCalendar(!showEndDateCalendar)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer"
                      placeholder="Seleccionar fecha"
                    />
                    {showEndDateCalendar && (
                      <div className="absolute z-10 mt-1">
                        <CustomCalendar
                          selectedDate={createForm.endDate ? new Date(createForm.endDate) : null}
                          onDateChange={(date) => {
                            setCreateForm(prev => ({ 
                              ...prev, 
                              endDate: date ? date.toISOString() : '' 
                            }));
                            setShowEndDateCalendar(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Horas Requeridas</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.hours}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 60 }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">ID/Código Estudiante *</label>
                    <input
                      type="text"
                      required
                      value={createForm.studentId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="ID o código del estudiante"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">ID/Código Tutor (Opcional)</label>
                    <input
                      type="text"
                      value={createForm.tutorId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, tutorId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="ID o código del tutor (dejar vacío si no aplica)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">ID/Código Profesor (Opcional)</label>
                    <input
                      type="text"
                      value={createForm.teacherId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, teacherId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="ID o código del profesor (dejar vacío si no aplica)"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md !text-slate-800 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear Práctica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Práctica */}
      {editingPractice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdatePractice}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium !text-slate-900">Editar Práctica</h3>
                  <button
                    type="button"
                    onClick={() => setEditingPractice(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Nombre de la Práctica *</label>
                    <input
                      type="text"
                      required
                      value={editingPractice.name}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Institución *</label>
                    <input
                      type="text"
                      required
                      value={editingPractice.institution}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, institution: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción *</label>
                    <textarea
                      required
                      value={editingPractice.description}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Fecha Inicio</label>
                    <input
                      type="text"
                      readOnly
                      value={editingPractice.startDate ? new Date(editingPractice.startDate).toLocaleDateString('es-ES') : ''}
                      onClick={() => setShowEditStartDateCalendar(!showEditStartDateCalendar)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer"
                    />
                    {showEditStartDateCalendar && (
                      <div className="absolute z-10 mt-1">
                        <CustomCalendar
                          selectedDate={editingPractice.startDate ? new Date(editingPractice.startDate) : null}
                          onDateChange={(date) => {
                            setEditingPractice(prev => prev ? { 
                              ...prev, 
                              startDate: date ? date.toISOString() : '' 
                            } : null);
                            setShowEditStartDateCalendar(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Fecha Fin</label>
                    <input
                      type="text"
                      readOnly
                      value={editingPractice.endDate ? new Date(editingPractice.endDate).toLocaleDateString('es-ES') : ''}
                      onClick={() => setShowEditEndDateCalendar(!showEditEndDateCalendar)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm cursor-pointer"
                    />
                    {showEditEndDateCalendar && (
                      <div className="absolute z-10 mt-1">
                        <CustomCalendar
                          selectedDate={editingPractice.endDate ? new Date(editingPractice.endDate) : null}
                          onDateChange={(date) => {
                            setEditingPractice(prev => prev ? { 
                              ...prev, 
                              endDate: date ? date.toISOString() : '' 
                            } : null);
                            setShowEditEndDateCalendar(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Estado</label>
                    <Select
                      label=""
                      value={editingPractice.status}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                      options={[
                        { value: 'PENDING', label: 'Pendiente' },
                        { value: 'IN_PROGRESS', label: 'En Progreso' },
                        { value: 'COMPLETED', label: 'Completada' },
                        { value: 'CANCELLED', label: 'Cancelada' }
                      ]}
                      className="w-full border border-gray-300 rounded-xl pl-3 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Horas Requeridas</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingPractice.hours}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, hours: parseInt(e.target.value) || 60 } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingPractice(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}