-- CreateTable
CREATE TABLE "Center" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "congregationId" TEXT,
    "institutionId" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "telefono" TEXT,
    "correoContacto" TEXT,
    "nombreContacto" TEXT,
    "capacidadMaxima" INTEGER NOT NULL DEFAULT 5,
    "capacidadDisponible" INTEGER NOT NULL DEFAULT 5,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "observaciones" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Center_tipo_idx" ON "Center"("tipo");

-- CreateIndex
CREATE INDEX "Center_estado_idx" ON "Center"("estado");

-- CreateIndex
CREATE INDEX "Center_ciudad_idx" ON "Center"("ciudad");

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
