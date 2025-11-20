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
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 bg-opacity-90 backdrop-blur-lg text-white py-4 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div>        
        <UserDropdown />
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
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
        
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold !text-black">Gestión de Prácticas</h2>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 active:bg-green-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2"
            >
              Nueva Práctica
            </Button>
          </div>
          
          {showForm && (
            <div className="mb-6 p-6 border rounded-2xl bg-gray-50">
              <h3 className="text-xl font-bold mb-4 !text-black">Crear Nueva Práctica</h3>
              <form onSubmit={handleCreatePractice} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Nombre</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Institución</label>
                  <input
                    type="text"
                    value={createForm.institution}
                    onChange={(e) => setCreateForm({...createForm, institution: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 !text-black">Descripción</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Fecha de Fin</label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">Horas</label>
                  <input
                    type="number"
                    value={createForm.hours}
                    onChange={(e) => setCreateForm({...createForm, hours: parseInt(e.target.value)})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">ID Estudiante</label>
                  <input
                    type="text"
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({...createForm, studentId: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">ID Tutor</label>
                  <input
                    type="text"
                    value={createForm.tutorId}
                    onChange={(e) => setCreateForm({...createForm, tutorId: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-black">ID Docente</label>
                  <input
                    type="text"
                    value={createForm.teacherId}
                    onChange={(e) => setCreateForm({...createForm, teacherId: e.target.value})}
                    className="w-full p-3 border rounded-lg !text-black bg-white"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2">
                    Crear Práctica
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 active:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-md rounded-lg px-4 py-2"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 !text-black font-bold">Nombre</th>
                  <th className="pb-3 !text-black font-bold">Institución</th>
                  <th className="pb-3 !text-black font-bold">Estudiante</th>
                  <th className="pb-3 !text-black font-bold">Estado</th>
                  <th className="pb-3 !text-black font-bold">Horas</th>
                  <th className="pb-3 !text-black font-bold">Fechas</th>
                  <th className="pb-3 !text-black font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {practices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 !text-black">
                      No hay prácticas registradas
                    </td>
                  </tr>
                ) : (
                  practices.map((practice) => (
                    <tr key={practice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-bold !text-black">{practice.name}</div>
                          <div className="text-sm !text-gray-600">{practice.description}</div>
                        </div>
                      </td>
                      <td className="py-4 !text-black">{practice.institution}</td>
                      <td className="py-4">
                        {practice.student ? (
                          <div>
                            <div className="font-medium !text-black">{practice.student.name}</div>
                            <div className="text-sm !text-gray-600">{practice.student.email}</div>
                          </div>
                        ) : (
                          <span className="!text-gray-600">Sin asignar</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[practice.status]}`}>
                          {statusLabels[practice.status]}
                        </span>
                      </td>
                      <td className="py-4 !text-black">{practice.hours}h</td>
                      <td className="py-4">
                        <div className="text-sm !text-black">
                          <div>Inicio: {new Date(practice.startDate).toLocaleDateString()}</div>
                          <div>Fin: {new Date(practice.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => window.location.href = `/dashboard/coordinador/practicas/${practice.id}`}
                            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out text-xs px-3 py-1.5 font-semibold shadow-sm rounded-md"
                          >
                            Ver
                          </Button>
                          <Button 
                            onClick={() => handleDeletePractice(practice.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 active:bg-red-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out text-xs px-3 py-1.5 font-semibold shadow-sm rounded-md"
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