import React, { useState, useEffect, useRef } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

const estudiantes = [
  { nombre: "Juan Pérez", codigo: "12345", practica: "3" },
  { nombre: "Ana Ruiz", codigo: "23456", practica: "5" },
];
const iglesias = [
  { value: "", label: "Selecciona" },
  { value: "iglesia1", label: "Iglesia 1" },
  { value: "iglesia2", label: "Iglesia 2" },
];
const practicas = [
  { value: "", label: "Práctica/Semestre:" },
  { value: "3", label: "Práctica 3" },
  { value: "5", label: "Práctica 5" },
];

export default function AsignarEstudiantePage() {
  const [filtroPractica, setFiltroPractica] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [asignaciones, setAsignaciones] = useState<{ [codigo: string]: string }>({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const estudiantesFiltrados = estudiantes.filter(e =>
    (!filtroPractica || e.practica === filtroPractica) &&
    (!busqueda || e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleAsignar = (codigo: string) => {
    if (!asignaciones[codigo]) {
      setFeedback("Debes seleccionar una iglesia.");
      setShowFeedback(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout to hide feedback after 34 seconds
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
      return;
    }
    setLoading(codigo);
    setFeedback("");
    
    setTimeout(() => {
      setFeedback(`La asignación del estudiante con código ${codigo} se ha realizado exitosamente.`);
      setShowFeedback(true);
      setLoading(null);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout to hide feedback after 34 seconds
      timeoutRef.current = setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }, 1000);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

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
        <div className="w-full mb-6">
          <form className="flex gap-4 mb-4 w-full justify-between flex-col md:flex-row" role="search">
            <div className="w-full md:w-1/3">
              <Select
                label=""
                options={practicas}
                value={filtroPractica}
                onChange={e => setFiltroPractica(e.target.value)}
                className="w-full"
                aria-label="Filtrar por práctica"
              />
            </div>
            <div className="w-full md:w-2/3">
              <Input
                label=""
                placeholder="Buscar estudiante"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full !text-black"
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
                  <th className="py-4 px-6 !text-black font-bold text-base">Nombre</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Código</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Práctica</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Asignar Iglesia</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Acción</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map(e => (
                  <tr key={e.codigo} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 !text-black font-medium">{e.nombre}</td>
                    <td className="py-4 px-6 !text-black">{e.codigo}</td>
                    <td className="py-4 px-6 !text-black">{e.practica}</td>
                    <td className="py-4 px-6">
                      <Select
                        options={iglesias}
                        value={asignaciones[e.codigo] || ""}
                        onChange={ev => setAsignaciones(a => ({ ...a, [e.codigo]: ev.target.value }))}
                        aria-label={`Seleccionar iglesia para ${e.nombre}`}
                        className="!text-black"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        onClick={() => handleAsignar(e.codigo)}
                        loading={loading === e.codigo}
                        aria-label={`Asignar ${e.nombre}`}
                        className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-sm rounded-lg px-4 py-2"
                      >
                        Asignar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8">
            <Alert type="info" className="shadow-md font-medium !text-blue-800 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Si el estudiante ya tiene otra práctica activa, solo puede asignarse a la misma iglesia en este semestre.</span>
              </div>
            </Alert>
          </div>
        </div>
      </main>
    </div>
  );
}