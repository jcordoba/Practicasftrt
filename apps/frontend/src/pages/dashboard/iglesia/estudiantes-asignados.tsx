import React, { useState } from "react";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";

const estudiantes = [
  { nombre: "Juan Pérez", codigo: "12345", practica: "3", estado: "Activo" },
  { nombre: "Ana Ruiz", codigo: "23456", practica: "5", estado: "Finalizado" },
];

export default function EstudiantesAsignadosIglesiaPage() {
  const [feedback, setFeedback] = useState("");
  const handleAccion = (nombre: string, accion: string) => {
    setFeedback(`${accion} estudiante ${nombre}`);
    setTimeout(() => setFeedback(""), 1200);
  };
  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        <div className="flex items-center gap-2">
          <span>Iglesia</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">I</span>
        </div>
      </header>
      <main className="flex flex-col items-center w-full max-w-3xl mt-8">
        <div className="bg-white rounded-lg shadow p-6 w-full">
          <h2 className="text-lg font-semibold mb-4">Estudiantes Asignados</h2>
          {feedback && <Alert type="info">{feedback}</Alert>}
          <table className="w-full text-left" role="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Práctica</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map(e => (
                <tr key={e.codigo}>
                  <td>{e.nombre}</td>
                  <td>{e.codigo}</td>
                  <td>{e.practica}</td>
                  <td>{e.estado}</td>
                  <td>
                    <Button onClick={() => handleAccion(e.nombre, e.estado === "Activo" ? "Validar" : "Ver")} aria-label={`${e.estado === "Activo" ? "Validar" : "Ver"} ${e.nombre}`}>
                      {e.estado === "Activo" ? "Validar" : "Ver"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}