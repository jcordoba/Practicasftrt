import React from 'react';
import { render, screen } from '@testing-library/react';
import StudentDashboard from './StudentDashboard';

describe('StudentDashboard', () => {
  it('renderiza datos clave del estudiante', () => {
    render(<StudentDashboard />);
    expect(screen.getByText(/Asignación actual/i)).toBeInTheDocument();
    expect(screen.getByText(/Centro:/i)).toBeInTheDocument();
    expect(screen.getByText(/Notas/i)).toBeInTheDocument();
    expect(screen.getByText(/Corte 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado de evidencias/i)).toBeInTheDocument();
    expect(screen.getByText(/Aprobadas:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Subir nueva evidencia/i })).toBeInTheDocument();
  });
});