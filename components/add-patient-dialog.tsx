"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function AddPatientDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    age: "",
    clinicalHistory: "",
    tipo: "",
    lado: "",
    numero_serie: "",
    device_serial: "",
    enable: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.clinicalHistory || !formData.tipo || !formData.lado || !formData.numero_serie || !formData.device_serial) {
      alert("Por favor complete todos los campos");
      return;
    }

    if (!/^\d{6,7}$/.test(formData.clinicalHistory)) {
      alert("La historia clínica debe ser un número de 6 o 7 dígitos");
      return;
    }

    // 1. Create patient
    const newPatient = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      historia_clinica: formData.clinicalHistory,
      medico_id: null
    };
    const { data: pacienteData, error: pacienteError } = await supabase
      .from("paciente")
      .insert([newPatient])
      .select();
    if (pacienteError || !pacienteData || pacienteData.length === 0) {
      alert("Error al agregar paciente: " + (pacienteError?.message || "No se pudo crear el paciente"));
      return;
    }
    const paciente_id = pacienteData[0].paciente_id;

    // 2. Create protesis
    const newProtesis = {
      paciente_id,
      tipo: formData.tipo,
      lado: formData.lado,
    };
    const { error: protesisError } = await supabase
      .from("protesis")
      .insert([newProtesis]);
    if (protesisError) {
      alert("Error al agregar prótesis: " + protesisError.message);
      return;
    }

    // 3. Create sensor
    const newSensor = {
      paciente_id,
      numero_serie: formData.numero_serie,
      device_serial: formData.device_serial,
      enabled: false,
    };
    const { error: sensorError } = await supabase
      .from("sensor")
      .insert([newSensor]);
    if (sensorError) {
      alert("Error al agregar sensor: " + sensorError.message);
      return;
    }

    alert("Paciente, prótesis y sensor agregados exitosamente");

    // Reset form
    setFormData({
      nombre: "",
      apellido: "",
      age: "",
      clinicalHistory: "",
      tipo: "",
      lado: "",
      numero_serie: "",
      device_serial: "",
      enable: false,
    });
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
          <DialogDescription>Complete la información del paciente para agregarlo al sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Juan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Ej: Pérez"
              />
            </div>
            {/* Removed Edad input box as requested */}
            <div className="grid gap-2">
              <Label htmlFor="clinicalHistory">Historia Clínica</Label>
              <Input
                id="clinicalHistory"
                type="text"
                value={formData.clinicalHistory}
                onChange={(e) => setFormData({ ...formData, clinicalHistory: e.target.value })}
                placeholder="Ej: 123456"
                maxLength={7}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de Prótesis</Label>
              <Input
                id="tipo"
                type="text"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ej: Prótesis de Rodilla"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lado">Lado</Label>
              <select
                id="lado"
                value={formData.lado}
                onChange={(e) => setFormData({ ...formData, lado: e.target.value })}
                className="border rounded px-2 py-1"
                required
              >
                <option value="">Seleccione lado</option>
                <option value="Izquierdo">Izquierdo</option>
                <option value="Derecho">Derecho</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numero_serie">Numero de serie del sensor</Label>
              <Input
                id="numero_serie"
                type="text"
                value={formData.numero_serie}
                onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                placeholder="Ej: SN123456"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="device_serial">Numero del microcontrolador</Label>
              <Input
                id="device_serial"
                type="text"
                value={formData.device_serial}
                onChange={(e) => setFormData({ ...formData, device_serial: e.target.value })}
                placeholder="Ej: MC987654"
              />
            </div>
            {/* Removed 'Sensor habilitado' checkbox as requested */}
            {/* Removed obsolete prostheses array logic. Only single tipo/lado inputs are used. */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Paciente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
