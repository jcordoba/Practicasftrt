import React from 'react';

const StudentDashboard: React.FC = () => {
  // Simulación de datos
  const student = {
    name: 'Juan Pérez',
    center: 'Centro ABC',
    pastor: 'Pr. Luis Gómez',
    practice: 'Práctica I',
    cut1: 4.2,
    cut2: 4.5,
    evidences: { approved: 3, rejected: 1, pending: 2 },
  };

  return (
    <section className="dashboard-cards">
      <h2>¡Bienvenido, {student.name}!</h2>
      <div className="card">
        <strong>Asignación actual</strong>
        <p>Centro: {student.center}</p>
        <p>Pastor: {student.pastor}</p>
        <p>Práctica: {student.practice}</p>
      </div>
      <div className="card">
        <strong>Notas</strong>
        <p>Corte 1: {student.cut1}</p>
        <p>Corte 2: {student.cut2}</p>
        <p>Nota final: {((student.cut1 + student.cut2) / 2).toFixed(2)}</p>
      </div>
      <div className="card">
        <strong>Estado de evidencias</strong>
        <p>Aprobadas: {student.evidences.approved}</p>
        <p>Rechazadas: {student.evidences.rejected}</p>
        <p>Pendientes: {student.evidences.pending}</p>
      </div>
      <button className="action-btn">Subir nueva evidencia</button>
    </section>
  );
};

export default StudentDashboard;