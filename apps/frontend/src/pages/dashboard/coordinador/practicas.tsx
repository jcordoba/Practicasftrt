import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface Practice {
  id: string;
  name: string;
  description: string;
  institution: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  hours: number;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  tutor?: {
    id: string;
    name: string;
    email: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
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

const statusLabels = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
};

const statusColors = {
  PENDING: 'bg-yellow-100 !text-slate-900 border border-yellow-200',
  IN_PROGRESS: 'bg-green-100 !text-slate-900 border border-green-200',
  COMPLETED: 'bg-blue-100 !text-slate-900 border border-blue-200',
  CANCELLED: 'bg-red-100 !text-slate-900 border border-red-200'
};

export default function CoordinadorPracticasPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [createForm, setCreateForm] = useState<CreatePracticeForm>({
    name: '',
    description: '',
    institution: '',
    startDate: '',
    endDate: '',
    hours: 0,
    studentId: '',
    tutorId: '',
    teacherId: ''
  });

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
          <p className="mt-4 !text-black">Cargando...</p>
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch('/api/practices', {
        method: 'POST',
        body: JSON.stringify({
          ...createForm,
          startDate: new Date(createForm.startDate).toISOString(),
          endDate: new Date(createForm.endDate).toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la práctica');
      }  
      else if (response.status === 201) {
        console.log('Práctica creada exitosamente');
      }
      
      await fetchPractices();
      setShowForm(false);
      setCreateForm({
        name: '',
        description: '',
        institution: '',
        startDate: '',
        endDate: '',
        hours: 0,
        studentId: '',
        tutorId: '',
        teacherId: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la práctica');
    }
  };

  const handleDeletePractice = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta práctica?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/practices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la práctica');
      }
      
      await fetchPractices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la práctica');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg !text-black">Cargando prácticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full bg-blue-900 text-white py-6 px-8 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-slate-300 flex items-center transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </SafeLink>
          <h1 className="text-2xl font-bold !text-white">Gestión de Prácticas</h1>
        </div>        
        <UserDropdown />
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow border-l-4 border-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="!text-slate-600 text-sm font-medium">Total de Prácticas</p>
                <p className="!text-slate-900 text-3xl font-bold mt-2">{practices.length}</p>
              </div>
              <div className="bg-white border-2 border-blue-600 rounded-lg p-3">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border-l-4 border-yellow-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="!text-slate-600 text-sm font-medium">Pendientes</p>
                <p className="!text-slate-900 text-3xl font-bold mt-2">
                  {practices.filter(p => p.status === 'PENDING').length}
                </p>
              </div>
              <div className="bg-white border-2 border-yellow-500 rounded-lg p-3">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border-l-4 border-green-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="!text-slate-600 text-sm font-medium">En Progreso</p>
                <p className="!text-slate-900 text-3xl font-bold mt-2">
                  {practices.filter(p => p.status === 'IN_PROGRESS').length}
                </p>
              </div>
              <div className="bg-white border-2 border-green-600 rounded-lg p-3">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="!text-slate-600 text-sm font-medium">Completadas</p>
                <p className="!text-slate-900 text-3xl font-bold mt-2">
                  {practices.filter(p => p.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="bg-white border-2 border-blue-500 rounded-lg p-3">
                <svg className="w-8 h-8 !text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" className="mb-4 !text-red-800 bg-red-100 border-red-400 rounded-lg shadow-md p-4 font-medium relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                {error}
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-800 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 flex justify-between items-center border-b border-gray-200">
            <h2 className="text-xl font-bold !text-slate-900">Lista de Prácticas</h2>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Nueva Práctica
            </Button>
          </div>
          
          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-slate-50">
              <h3 className="text-lg font-bold mb-4 !text-slate-900">Crear Nueva Práctica</h3>
              <form onSubmit={handleCreatePractice} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">Nombre *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">Institución *</label>
                  <input
                    type="text"
                    value={createForm.institution}
                    onChange={(e) => setCreateForm({...createForm, institution: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 !text-slate-900">Descripción *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">Fecha de Inicio *</label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">Fecha de Fin *</label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">Horas *</label>
                  <input
                    type="number"
                    value={createForm.hours}
                    onChange={(e) => setCreateForm({...createForm, hours: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">ID Estudiante *</label>
                  <input
                    type="text"
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({...createForm, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">ID Tutor (Opcional)</label>
                  <input
                    type="text"
                    value={createForm.tutorId}
                    onChange={(e) => setCreateForm({...createForm, tutorId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 !text-slate-900">ID Docente (Opcional)</label>
                  <input
                    type="text"
                    value={createForm.teacherId}
                    onChange={(e) => setCreateForm({...createForm, teacherId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 !text-slate-900"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                    Crear Práctica
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold !text-white uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold !text-white uppercase tracking-wider">Institución</th>
                  <th className="px-6 py-4 text-left text-xs font-bold !text-white uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-4 text-left text-xs font-bold !text-white uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold !text-white uppercase tracking-wider">Horas</th>
                  <th className="px-6 py-4 text-left text-xs font-bold !text-white uppercase tracking-wider">Fechas</th>
                  <th className="px-6 py-4 text-center text-xs font-bold !text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {practices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 !text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 text-lg font-medium !text-slate-900">No hay prácticas registradas</p>
                      <p className="mt-2 text-sm !text-slate-600">Comienza creando una nueva práctica</p>
                    </td>
                  </tr>
                ) : (
                  practices.map((practice) => (
                    <tr key={practice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold !text-slate-900">{practice.name}</div>
                          <div className="text-sm !text-slate-600 mt-1">{practice.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 !text-slate-900 font-medium">{practice.institution}</td>
                      <td className="px-6 py-4">
                        {practice.student ? (
                          <div>
                            <div className="font-bold !text-slate-900">{practice.student.name}</div>
                            <div className="text-sm !text-slate-600 mt-1">{practice.student.email}</div>
                          </div>
                        ) : (
                          <span className="!text-slate-600 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[practice.status]}`}>
                          {statusLabels[practice.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold !text-slate-900">{practice.hours}h</div>
                        <div className="text-xs !text-slate-600 mt-1">requeridas</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="!text-slate-900 font-medium">
                            {new Date(practice.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                          <div className="!text-slate-600 text-xs mt-1">
                            {new Date(practice.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            onClick={() => window.location.href = `/dashboard/coordinador/practicas/${practice.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Ver
                          </Button>
                          <Button 
                            onClick={() => handleDeletePractice(practice.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}