import React from 'react';

const PastorDashboard: React.FC = () => {
  // Simulación de datos
  const students = [
    { name: 'Ana Torres', pendingEval: true, evidenceStatus: 'pendiente' },
    { name: 'Carlos Ruiz', pendingEval: false, evidenceStatus: 'aprobada' },
  ];
  const pending = students.filter(s => s.pendingEval).length;

  return (
    <section className="dashboard-cards">
      <h2>¡Bienvenido, Pastor!</h2>
      <div className="card">
        <strong>Estudiantes asignados</strong>
        <ul>
          {students.map((s, i) => (
            <li key={i}>{s.name} - Evidencia: {s.evidenceStatus}</li>
          ))}
        </ul>
      </div>
      <div className="card alert">
        <strong>Alertas</strong>
        <p>{pending > 0 ? `Tienes ${pending} evaluaciones pendientes por corte.` : 'Sin alertas.'}</p>
      </div>
      <button className="action-btn">Calificar/Comentar</button>
    </section>
  );
};

export default PastorDashboard;