import React, { useState, useEffect, useRef } from "react";
import { useAuth, useAuthenticatedFetch } from "../../../contexts/AuthContext";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

interface Student {
  id: string;
  nombre: string;
  email: string;
}

interface Center {
  id: string;
  nombre: string;
  tipo: string;
  ciudad?: string;
  capacidadDisponible: number;
  capacidadMaxima: number;
}

interface Term {
  id: string;
  nombre: string;
  codigo: string;
}

interface Placement {
  id: string;
  studentId: string;
  centerId: string;
  status: string;
}

export default function AsignarEstudiantePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const [students, setStudents] = useState<Student[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterCiudad, setFilterCiudad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [asignaciones, setAsignaciones] = useState<{ [studentId: string]: string }>({});
  const [feedback, setFeedback] = useState("");
  const [savingStudent, setSavingStudent] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchStudents(),
      fetchCenters(),
      fetchActiveTerm(),
      fetchPlacements(),
    ]);
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const response = await authenticatedFetch("/api/users");
      if (!response.ok) throw new Error("Error al obtener estudiantes");
      const data = await response.json();
      
      // Filtrar solo usuarios con rol STUDENT
      const studentUsers = data.filter((user: any) =>
        user.roles?.some((r: any) => r.role?.nombre === "STUDENT")
      );
      
      setStudents(studentUsers);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await authenticatedFetch("/api/centers");
      if (!response.ok) throw new Error("Error al obtener centros");
      const data = await response.json();
      // Filtrar solo centros activos con capacidad disponible
      const activeCenters = data.filter(
        (c: Center) => c.capacidadDisponible > 0
      );
      setCenters(activeCenters);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const fetchActiveTerm = async () => {
    try {
      const response = await authenticatedFetch("/api/terms/active");
      if (response.status === 404) {
        // No hay término activo, es una situación válida
        setActiveTerm(null);
        return;
      }
      if (!response.ok) throw new Error("Error al obtener término activo");
      const data = await response.json();
      setActiveTerm(data);
    } catch (error) {
      console.error("Error fetching active term:", error);
      setActiveTerm(null);
    }
  };

  const fetchPlacements = async () => {
    try {
      const response = await authenticatedFetch("/api/placements");
      if (!response.ok) throw new Error("Error al obtener asignaciones");
      const data = await response.json();
      setPlacements(data);
    } catch (error) {
      console.error("Error fetching placements:", error);
    }
  };

  const estudiantesFiltrados = students.filter((e) => {
    const matchSearch = !busqueda || e.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchSearch;
  });

  const handleAsignar = async (studentId: string) => {
    if (!asignaciones[studentId]) {
      setFeedback("Debes seleccionar un centro de práctica.");
      setShowFeedback(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
      return;
    }

    if (!activeTerm) {
      setFeedback("No hay un término académico activo. Por favor, crea uno primero.");
      setShowFeedback(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
      return;
    }

    setSavingStudent(studentId);
    setFeedback("");
    
    try {
      const response = await authenticatedFetch("/api/placements", {
        method: "POST",
        body: JSON.stringify({
          studentId: studentId,
          centerId: asignaciones[studentId],
          termId: activeTerm.id,
          status: "ACTIVE",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear asignación");
      }

      setFeedback(`La asignación del estudiante se ha realizado exitosamente.`);
      setShowFeedback(true);
      setSavingStudent(null);
      
      // Recargar datos
      await fetchPlacements();
      await fetchCenters(); // Actualizar capacidad disponible
      
      // Limpiar selección
      setAsignaciones(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    } catch (error: any) {
      setFeedback(error.message || "Error al asignar estudiante");
      setShowFeedback(true);
      setSavingStudent(null);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Preparar opciones para el dropdown de centros
  const centerOptions = [
    { value: "", label: "Selecciona un centro" },
    ...centers.map((c) => ({
      value: c.id,
      label: `${c.nombre} - ${c.ciudad || "N/A"} (${c.capacidadDisponible}/${c.capacidadMaxima})`,
    })),
  ];

  // Obtener ciudades únicas para el filtro
  const ciudades = Array.from(new Set(centers.map((c) => c.ciudad).filter(Boolean)));

  // Verificar si un estudiante ya tiene asignación
  const hasPlacement = (studentId: string) => {
    return placements.some((p) => p.studentId === studentId && p.status === "ACTIVE");
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg !text-slate-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/coordinador" className="text-white hover:text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </SafeLink>
          <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        </div> 
        <UserDropdown />
      </header>
      
      <main className="flex flex-col items-center w-full max-w-6xl mt-8 px-4 pb-12">
        {!activeTerm && (
          <div className="w-full mb-4">
            <Alert type="warning" className="shadow-md font-medium !text-yellow-800 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>No hay un término académico activo. Debe crear y activar un término antes de asignar estudiantes.</span>
              </div>
            </Alert>
          </div>
        )}

        <div className="w-full mb-6">
          <form className="flex gap-4 mb-4 w-full justify-between flex-col md:flex-row" role="search">
            <div className="w-full md:w-1/3">
              <Select
                label=""
                options={[
                  { value: "", label: "Todas las ciudades" },
                  ...ciudades.map((c) => ({ value: c || "", label: c || "Sin ciudad" })),
                ]}
                value={filterCiudad}
                onChange={(e) => setFilterCiudad(e.target.value)}
                className="w-full !text-slate-900"
                aria-label="Filtrar por ciudad"
              />
            </div>
            <div className="w-full md:w-2/3">
              <Input
                label=""
                placeholder="Buscar estudiante por nombre"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full !text-slate-900"
                aria-label="Buscar estudiante"
              />
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Lista de Estudiantes
          </h2>
          
          {showFeedback && (
            <div className="relative mb-6">
              <Alert className="!text-white shadow-lg font-bold text-lg rounded-xl" type={feedback.includes("exitosamente") ? "success" : "warning"}>
                <div className="flex justify-between items-center">
                  <span>{feedback}</span>
                  <button 
                    onClick={handleCloseFeedback}
                    className="ml-4 text-white hover:text-gray-200 font-bold text-2xl leading-none"
                    aria-label="Cerrar alerta"
                  >
                    ×
                  </button>
                </div>
              </Alert>
            </div>
          )}
          
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 !text-slate-900 font-bold text-base">Nombre</th>
                  <th className="py-4 px-6 !text-slate-900 font-bold text-base">Email</th>
                  <th className="py-4 px-6 !text-slate-900 font-bold text-base">Estado</th>
                  <th className="py-4 px-6 !text-slate-900 font-bold text-base">Asignar Centro</th>
                  <th className="py-4 px-6 !text-slate-900 font-bold text-base">Acción</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center !text-slate-500">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((e) => {
                    const alreadyAssigned = hasPlacement(e.id);
                    return (
                      <tr
                        key={e.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                          alreadyAssigned ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="py-4 px-6 !text-slate-900 font-medium">{e.nombre}</td>
                        <td className="py-4 px-6 !text-slate-700">{e.email}</td>
                        <td className="py-4 px-6">
                          {alreadyAssigned ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 !text-white">
                              Asignado
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 !text-slate-700">
                              Sin asignar
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <Select
                            options={centerOptions}
                            value={asignaciones[e.id] || ""}
                            onChange={(ev) =>
                              setAsignaciones((a) => ({ ...a, [e.id]: ev.target.value }))
                            }
                            aria-label={`Seleccionar centro para ${e.nombre}`}
                            className="!text-slate-900"
                            disabled={alreadyAssigned || !activeTerm}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            onClick={() => handleAsignar(e.id)}
                            loading={savingStudent === e.id}
                            disabled={alreadyAssigned || !activeTerm}
                            aria-label={`Asignar ${e.nombre}`}
                            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-sm rounded-lg px-4 py-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Asignar
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <Alert type="info" className="shadow-md font-medium !text-blue-800 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p>Los estudiantes ya asignados aparecen con fondo verde y no pueden ser reasignados.</p>
                  <p className="mt-1">La capacidad de cada centro se actualiza automáticamente al realizar asignaciones.</p>
                  {!activeTerm && (
                    <p className="mt-1 font-bold">⚠️ Debe existir un término académico activo para realizar asignaciones.</p>
                  )}
                </div>
              </div>
            </Alert>
          </div>
        </div>
      </main>
    </div>
  );
}