import React from 'react';

const DecanoDashboard: React.FC = () => {
  // Simulación de datos
  const reports = [
    { semester: '2024-1', avgGrade: 4.3, participation: 95, coverage: '80%' },
    { semester: '2023-2', avgGrade: 4.1, participation: 92, coverage: '78%' },
  ];

  return (
    <section className="dashboard-cards">
      <h2>¡Bienvenido, Decano!</h2>
      <div className="card">
        <strong>Reportes de desempeño</strong>
        <ul>
          {reports.map((r, i) => (
            <li key={i}>
              Semestre: {r.semester} | Nota promedio: {r.avgGrade} | Participación: {r.participation}% | Cobertura: {r.coverage}
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <strong>Indicadores gráficos</strong>
        <p>[Gráficos simulados: participación, notas, cobertura]</p>
      </div>
      <p className="readonly-msg">Acceso de solo lectura</p>
    </section>
  );
};

export default DecanoDashboard;