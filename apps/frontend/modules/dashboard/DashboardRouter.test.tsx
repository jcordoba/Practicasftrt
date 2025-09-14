import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardRouter from './DashboardRouter';

// Mock de lazy imports
jest.mock('./StudentDashboard', () => () => <div>Student Dashboard</div>);
jest.mock('./PastorDashboard', () => () => <div>Pastor Dashboard</div>);
jest.mock('./DocenteDashboard', () => () => <div>Docente Dashboard</div>);
jest.mock('./CoordinadorDashboard', () => () => <div>Coordinador Dashboard</div>);
jest.mock('./DecanoDashboard', () => () => <div>Decano Dashboard</div>);

describe('DashboardRouter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirige al dashboard de estudiante por defecto', async () => {
    render(<DashboardRouter />);
    expect(await screen.findByText('Student Dashboard')).toBeInTheDocument();
  });

  it('muestra el dashboard correcto según rol', async () => {
    localStorage.setItem('role', 'pastor');
    render(<DashboardRouter />);
    expect(await screen.findByText('Pastor Dashboard')).toBeInTheDocument();

    localStorage.setItem('role', 'teacher');
    render(<DashboardRouter />);
    expect(await screen.findByText('Docente Dashboard')).toBeInTheDocument();

    localStorage.setItem('role', 'coordinator');
    render(<DashboardRouter />);
    expect(await screen.findByText('Coordinador Dashboard')).toBeInTheDocument();

    localStorage.setItem('role', 'dean');
    render(<DashboardRouter />);
    expect(await screen.findByText('Decano Dashboard')).toBeInTheDocument();
  });
});