import React, { useState, useEffect } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";
import SafeLink from "@/components/SafeLink";
import UserDropdown from "../../../components/UserDropdown";

const estudiantes = [
  { nombre: "Juan Pérez", codigo: "12345", practica: "3", estado: "Activo" },
  { nombre: "Ana Ruiz", codigo: "23456", practica: "5", estado: "Finalizado" },
];

export default function EstudiantesAsignadosIglesiaPage() {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAccion = (nombre: string, accion: string) => {
    setFeedback(`${accion} estudiante ${nombre}`);
    setTimeout(() => setFeedback(""), 1200);
  };
  
  // Add loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium !text-black">Cargando estudiantes...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with glassmorphism effect */}
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <SafeLink href="/dashboard/iglesia" className="text-white hover:text-blue-200 flex items-center">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
          <h2 className="text-2xl font-bold !text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 !text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Estudiantes Asignados
          </h2>
          
          {feedback && (
            <div className="mb-6">
              <Alert type="info" className="!text-white shadow-lg font-bold text-lg rounded-xl">
                {feedback}
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
                  <th className="py-4 px-6 !text-black font-bold text-base">Estado</th>
                  <th className="py-4 px-6 !text-black font-bold text-base">Acción</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map(e => (
                  <tr key={e.codigo} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 !text-black font-medium">{e.nombre}</td>
                    <td className="py-4 px-6 !text-black">{e.codigo}</td>
                    <td className="py-4 px-6 !text-black">{e.practica}</td>
                    <td className="py-4 px-6 !text-black font-medium">{e.estado}</td>
                    <td className="py-4 px-6">
                      <Button 
                        onClick={() => handleAccion(e.nombre, e.estado === "Activo" ? "Validar" : "Ver")} 
                        aria-label={`${e.estado === "Activo" ? "Validar" : "Ver"} ${e.nombre}`}
                        className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-800 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out font-semibold shadow-sm rounded-lg px-4 py-2 text-white"
                      >
                        {e.estado === "Activo" ? "Validar" : "Ver"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}