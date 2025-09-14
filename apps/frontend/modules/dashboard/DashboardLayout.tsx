import React from 'react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="dashboard-layout mobile-first">
    {children}
  </main>
);

export default DashboardLayout;