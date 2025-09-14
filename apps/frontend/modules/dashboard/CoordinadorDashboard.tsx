import React from 'react';

const CoordinadorDashboard: React.FC = () => {
  // Simulación de datos
  const indicators = {
    activePractices: 12,
    assignedCenters: 5,
    pending: 3,
  };
  const alerts = [
    '2 traslados sin aprobar',
    '1 estudiante sin asignar',
  ];

  return (
    <section className="dashboard-cards">
      <h2>¡Bienvenido, Coordinador!</h2>
      <div className="card">
        <strong>Indicadores globales</strong>
        <p>Prácticas activas: {indicators.activePractices}</p>
        <p>Centros asignados: {indicators.assignedCenters}</p>
        <p>Pendientes: {indicators.pending}</p>
      </div>
      <div className="card alert">
        <strong>Alertas</strong>
        <ul>
          {alerts.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
      <button className="action-btn">Ir a módulos administrativos</button>
    </section>
  );
};

export default CoordinadorDashboard;