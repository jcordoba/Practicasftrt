import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";

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
      <div className="flex flex-col items-center min-h-screen bg-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg !text-slate-900">Cargando prácticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold !text-white">SION Prácticas FTR</h1>
        <div className="flex items-center gap-2">
          <span>Coordinador</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">C</span>
        </div>
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4">
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <div className="bg-white rounded-lg shadow p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold !text-slate-900">Gestión de Prácticas</h2>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Nueva Práctica
            </Button>
          </div>
          
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-md font-semibold mb-4 !text-slate-900">Crear Nueva Práctica</h3>
              <form onSubmit={handleCreatePractice} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Nombre</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Institución</label>
                  <input
                    type="text"
                    value={createForm.institution}
                    onChange={(e) => setCreateForm({...createForm, institution: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Descripción</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Fecha de Fin</label>
                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">Horas</label>
                  <input
                    type="number"
                    value={createForm.hours}
                    onChange={(e) => setCreateForm({...createForm, hours: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">ID Estudiante</label>
                  <input
                    type="text"
                    value={createForm.studentId}
                    onChange={(e) => setCreateForm({...createForm, studentId: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">ID Tutor</label>
                  <input
                    type="text"
                    value={createForm.tutorId}
                    onChange={(e) => setCreateForm({...createForm, tutorId: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 !text-slate-800">ID Docente</label>
                  <input
                    type="text"
                    value={createForm.teacherId}
                    onChange={(e) => setCreateForm({...createForm, teacherId: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Crear Práctica
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 hover:bg-gray-600"
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
                <tr className="border-b">
                  <th className="pb-2 !text-slate-800">Nombre</th>
                  <th className="pb-2 !text-slate-800">Institución</th>
                  <th className="pb-2 !text-slate-800">Estudiante</th>
                  <th className="pb-2 !text-slate-800">Estado</th>
                  <th className="pb-2 !text-slate-800">Horas</th>
                  <th className="pb-2 !text-slate-800">Fechas</th>
                  <th className="pb-2 !text-slate-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {practices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 !text-slate-800">
                      No hay prácticas registradas
                    </td>
                  </tr>
                ) : (
                  practices.map((practice) => (
                    <tr key={practice.id} className="border-b">
                      <td className="py-3">
                        <div>
                          <div className="font-medium !text-slate-900">{practice.name}</div>
                          <div className="text-sm !text-slate-800">{practice.description}</div>
                        </div>
                      </td>
                      <td className="py-3 !text-slate-900">{practice.institution}</td>
                      <td className="py-3">
                        {practice.student ? (
                          <div>
                            <div className="font-medium !text-slate-900">{practice.student.name}</div>
                            <div className="text-sm !text-slate-800">{practice.student.email}</div>
                          </div>
                        ) : (
                          <span className="!text-slate-800">Sin asignar</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[practice.status]}`}>
                          {statusLabels[practice.status]}
                        </span>
                      </td>
                      <td className="py-3 !text-slate-900">{practice.hours}h</td>
                      <td className="py-3">
                        <div className="text-sm !text-slate-900">
                          <div>Inicio: {new Date(practice.startDate).toLocaleDateString()}</div>
                          <div>Fin: {new Date(practice.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => window.location.href = `/dashboard/coordinador/practicas/${practice.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1"
                          >
                            Ver
                          </Button>
                          <Button 
                            onClick={() => handleDeletePractice(practice.id)}
                            className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
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