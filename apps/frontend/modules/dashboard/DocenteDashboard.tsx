import React from 'react';

const DocenteDashboard: React.FC = () => {
  // Simulación de datos
  const groups = [
    { name: 'Grupo 1', cut1: 4.1, cut2: 4.3, evidences: 'pendientes' },
    { name: 'Grupo 2', cut1: 4.5, cut2: 4.7, evidences: 'completas' },
  ];

  return (
    <section className="dashboard-cards">
      <h2>¡Bienvenido, Docente!</h2>
      <div className="card">
        <strong>Grupos asignados</strong>
        <ul>
          {groups.map((g, i) => (
            <li key={i}>{g.name} - Corte 1: {g.cut1} - Corte 2: {g.cut2} - Evidencias: {g.evidences}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <strong>Exportar reportes</strong>
        <button className="action-btn">Exportar a PDF</button>
        <button className="action-btn">Exportar a Excel</button>
      </div>
    </section>
  );
};

export default DocenteDashboard;