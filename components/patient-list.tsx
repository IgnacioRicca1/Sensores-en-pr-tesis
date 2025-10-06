"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"
import { AddPatientDialog } from "./add-patient-dialog"

interface Patient {
  id: string
  name: string
  age: number
  prostheses: string[]
  status: "stable" | "critical" | "recovering" | "warning" | "moving"
  avatar?: string
  lastVisit: string
  clinicalHistory: string
}

interface PatientListProps {
  patients: Patient[]
  selectedPatientId?: string
  onPatientSelect: (patientId: string) => void
  onAddPatient: (patient: Omit<Patient, "id" | "avatar">) => void
}

export function PatientList({ patients, selectedPatientId, onPatientSelect, onAddPatient }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: Patient["status"]) => {
    switch (status) {
      case "stable":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/10"
      case "warning":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/10"
      case "moving":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/10"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getStatusLabel = (status: Patient["status"]) => {
    switch (status) {
      case "stable":
        return "Estable"
      case "warning":
        return "Advertencia"
      case "moving":
        return "Movimiento"
      default:
        return status
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Mis Pacientes</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="mt-2">
          <AddPatientDialog />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filteredPatients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No se encontraron pacientes</p>
        ) : (
          filteredPatients.map((patient) => {
            const initials = patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()

            return (
              <button
                key={patient.id}
                onClick={() => onPatientSelect(patient.id)}
                className={`w-full flex items-start p-3 rounded-lg hover:bg-accent transition-colors text-left ${
                  selectedPatientId === patient.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm truncate pl-0">{patient.name}</p>
                  <Badge className={`text-xs whitespace-nowrap w-fit ${getStatusColor(patient.status)}`}>
                    {getStatusLabel(patient.status)}
                  </Badge>
                  <p className="text-xs text-muted-foreground truncate">
                    {patient.prostheses[0]}
                    {patient.prostheses.length > 1 && ` (+${patient.prostheses.length - 1} más)`}
                  </p>
                  {/* Removed Edad display below patient name as requested */}
                </div>
              </button>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
