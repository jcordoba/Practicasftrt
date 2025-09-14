import React from "react";
import Link from "next/link";

export default function DashboardRouter() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-6 text-blue-900 text-center">Selecciona tu panel</h2>
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/coordinador" className="bg-blue-900 text-white rounded px-4 py-2 font-semibold hover:bg-blue-800 transition text-center">Coordinador</Link>
          <Link href="/dashboard/estudiante" className="bg-blue-900 text-white rounded px-4 py-2 font-semibold hover:bg-blue-800 transition text-center">Estudiante</Link>
          <Link href="/dashboard/iglesia" className="bg-blue-900 text-white rounded px-4 py-2 font-semibold hover:bg-blue-800 transition text-center">Iglesia</Link>
        </div>
      </div>
    </div>
  );
}