import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useAuthenticatedFetch } from '../../../contexts/AuthContext';

interface Practice {
  id: string;
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'completed';
  requiredHours: number;
  studentId?: string;
  tutorId?: string;
  teacherId?: string;
  studentName?: string;
  tutorName?: string;
  teacherName?: string;
  completedHours?: number;
  createdAt: string;
}

interface CreatePracticeForm {
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  requiredHours: number;
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [createForm, setCreateForm] = useState<CreatePracticeForm>({
    name: '',
    description: '',
    institution: '',
    startDate: '',
    endDate: '',
    requiredHours: 60,
    studentId: '',
    tutorId: '',
    teacherId: ''
  });

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
      
      // Simular datos por ahora - en el futuro conectar con API real
      setTimeout(() => {
        setPractices([
          {
            id: '1',
            name: 'Práctica Pastoral I',
            description: 'Práctica inicial en ministerio pastoral',
            institution: 'Iglesia Central',
            startDate: '2024-01-15',
            endDate: '2024-06-15',
            status: 'active',
            requiredHours: 60,
            studentId: '1',
            tutorId: '1',
            teacherId: '1',
            studentName: 'Juan Pérez',
            tutorName: 'Pastor García',
            teacherName: 'Prof. López',
            completedHours: 45,
            createdAt: '2024-01-10T10:00:00Z'
          },
          {
            id: '2',
            name: 'Práctica Pastoral II',
            description: 'Práctica avanzada en liderazgo pastoral',
            institution: 'Iglesia del Valle',
            startDate: '2024-02-01',
            endDate: '2024-07-01',
            status: 'active',
            requiredHours: 80,
            studentId: '2',
            tutorId: '2',
            teacherId: '2',
            studentName: 'María García',
            tutorName: 'Pastor Ruiz',
            teacherName: 'Prof. Martínez',
            completedHours: 60,
            createdAt: '2024-01-25T14:30:00Z'
          },
          {
            id: '3',
            name: 'Práctica Misionera',
            description: 'Práctica en trabajo misionero urbano',
            institution: 'Centro Misionero',
            startDate: '2023-08-01',
            endDate: '2023-12-01',
            status: 'completed',
            requiredHours: 100,
            studentId: '3',
            tutorId: '3',
            teacherId: '3',
            studentName: 'Carlos López',
            tutorName: 'Misionero Silva',
            teacherName: 'Prof. Hernández',
            completedHours: 100,
            createdAt: '2023-07-20T09:15:00Z'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching practices:', error);
      setLoading(false);
    }
  };

  const handleCreatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada a la API para crear la práctica
      const newPractice: Practice = {
        id: Date.now().toString(),
        ...createForm,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      setPractices(prev => [newPractice, ...prev]);
      setCreateForm({
        name: '',
        description: '',
        institution: '',
        startDate: '',
        endDate: '',
        requiredHours: 60,
        studentId: '',
        tutorId: '',
        teacherId: ''
      });
      setShowCreateForm(false);
      alert('Práctica creada exitosamente');
    } catch (error) {
      console.error('Error creating practice:', error);
      alert('Error al crear la práctica');
    }
  };

  const handleUpdatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPractice) return;
    
    try {
      // Aquí iría la llamada a la API para actualizar la práctica
      setPractices(prev => 
        prev.map(practice => 
          practice.id === editingPractice.id 
            ? { ...editingPractice }
            : practice
        )
      );
      setEditingPractice(null);
      alert('Práctica actualizada exitosamente');
    } catch (error) {
      console.error('Error updating practice:', error);
      alert('Error al actualizar la práctica');
    }
  };

  const handleDeletePractice = async (practiceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta práctica?')) return;
    
    try {
      // Aquí iría la llamada a la API para eliminar la práctica
      setPractices(prev => prev.filter(practice => practice.id !== practiceId));
      alert('Práctica eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting practice:', error);
      alert('Error al eliminar la práctica');
    }
  };

  const filteredPractices = practices.filter(practice => {
    const matchesSearch = practice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || practice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 !text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'inactive': return 'Inactiva';
      case 'completed': return 'Completada';
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
            className="text-white hover:text-slate-300"
          >
            ← Volver
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
                <option value="completed">Completadas</option>
              </select>
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
                    Progreso
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="md:col-span-2">
                        <div className="text-sm font-medium !text-slate-900">{practice.name}</div>
                        <div className="text-sm !text-slate-800">{practice.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm !text-slate-900">{practice.studentName || 'Sin asignar'}</div>
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
                        {practice.completedHours || 0}/{practice.requiredHours} horas
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(((practice.completedHours || 0) / practice.requiredHours) * 100, 100)}%` 
                          }}
                        ></div>
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
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Institución</label>
                    <input
                      type="text"
                      required
                      value={createForm.institution}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción</label>
                    <textarea
                      required
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      required
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Fecha Fin</label>
                    <input
                      type="date"
                      required
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Horas Requeridas</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={createForm.requiredHours}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, requiredHours: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">ID Estudiante</label>
                    <input
                      type="text"
                      required
                      value={createForm.studentId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">ID Tutor</label>
                    <input
                      type="text"
                      value={createForm.tutorId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, tutorId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">ID Profesor</label>
                    <input
                      type="text"
                      value={createForm.teacherId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, teacherId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editingPractice.name}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Institución</label>
                    <input
                      type="text"
                      required
                      value={editingPractice.institution}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, institution: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Descripción</label>
                    <textarea
                      required
                      value={editingPractice.description}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Estado</label>
                    <select
                      value={editingPractice.status}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="active">Activa</option>
                      <option value="inactive">Inactiva</option>
                      <option value="completed">Completada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium !text-slate-800 mb-1">Horas Requeridas</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editingPractice.requiredHours}
                      onChange={(e) => setEditingPractice(prev => prev ? { ...prev, requiredHours: parseInt(e.target.value) } : null)}
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