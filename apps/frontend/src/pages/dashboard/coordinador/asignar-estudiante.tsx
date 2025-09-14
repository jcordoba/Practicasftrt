import React, { useState } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Button from "../../../components/Button";
import Alert from "../../../components/Alert";

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

  const estudiantesFiltrados = estudiantes.filter(e =>
    (!filtroPractica || e.practica === filtroPractica) &&
    (!busqueda || e.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleAsignar = (codigo: string) => {
    if (!asignaciones[codigo]) {
      setFeedback("Debes seleccionar una iglesia.");
      return;
    }
    setLoading(codigo);
    setFeedback("");
    setTimeout(() => {
      setFeedback(`Estudiante ${codigo} asignado correctamente.`);
      setLoading(null);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-100">
      <header className="w-full bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">SION Prácticas FTR</h1>
        <div className="flex items-center gap-2">
          <span>Asignar Estudiante</span>
          <span className="bg-yellow-400 text-blue-900 rounded-full px-3 py-1 font-bold">J</span>
        </div>
      </header>
      <main className="flex flex-col items-center w-full max-w-4xl mt-8 px-4">
        <form className="flex gap-4 mb-4 w-full justify-between flex-col sm:flex-row" role="search">
          <Select
            label=""
            options={practicas}
            value={filtroPractica}
            onChange={e => setFiltroPractica(e.target.value)}
            className="w-full sm:w-1/3"
            aria-label="Filtrar por práctica"
          />
          <Input
            label=""
            placeholder="Buscar estudiante"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full sm:w-2/3"
            aria-label="Buscar estudiante"
          />
        </form>
        <div className="bg-white rounded-lg shadow p-8 w-full border-4 border-slate-600">
          <h2 className="text-3xl font-extrabold mb-8 !text-slate-900 uppercase tracking-wide">Lista de Estudiantes</h2>
          {feedback && <Alert type={feedback.includes("correctamente") ? "success" : "warning"}>{feedback}</Alert>}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" role="table">
              <thead>
                <tr className="border-b-4 border-slate-600">
                  <th className="py-4 px-6 !text-slate-900 font-extrabold text-lg uppercase tracking-wide">Nombre</th>
                  <th className="py-4 px-6 !text-slate-900 font-extrabold text-lg uppercase tracking-wide">Código</th>
                  <th className="py-4 px-6 !text-slate-900 font-extrabold text-lg uppercase tracking-wide">Práctica</th>
                  <th className="py-4 px-6 !text-slate-900 font-extrabold text-lg uppercase tracking-wide">Asignar Iglesia</th>
                  <th className="py-4 px-6 !text-slate-900 font-extrabold text-lg uppercase tracking-wide">Acción</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map(e => (
                  <tr key={e.codigo} className="border-b-2 border-slate-300 hover:bg-slate-50">
                    <td className="py-6 px-6 !text-slate-900 font-bold text-base">{e.nombre}</td>
                    <td className="py-6 px-6 !text-slate-800 font-semibold text-base">{e.codigo}</td>
                    <td className="py-6 px-6 !text-slate-800 font-semibold text-base">{e.practica}</td>
                    <td className="py-6 px-6">
                      <Select
                        options={iglesias}
                        value={asignaciones[e.codigo] || ""}
                        onChange={ev => setAsignaciones(a => ({ ...a, [e.codigo]: ev.target.value }))}
                        aria-label={`Seleccionar iglesia para ${e.nombre}`}
                      />
                    </td>
                    <td className="py-6 px-6">
                      <Button
                        onClick={() => handleAsignar(e.codigo)}
                        loading={loading === e.codigo}
                        aria-label={`Asignar ${e.nombre}`}
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
            <Alert type="warning">
              Si el estudiante ya tiene otra práctica activa, solo puede asignarse a la misma iglesia en este semestre.
            </Alert>
          </div>
        </div>
      </main>
    </div>
  );
}