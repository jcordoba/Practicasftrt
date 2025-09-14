import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState("Cargando...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Error fetching health status");
      })
      .then((data) => {
        setStatus("Conexión con el backend exitosa!");
        console.log(data);
        setTimeout(() => router.push('/login'), 2000);
      })
      .catch((error) => {
        console.error("Error:", error);
        setStatus("Error conectando con el backend.");
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-900">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">SION Prácticas FTR</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}
