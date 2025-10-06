"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar } from "lucide-react"

interface ProfileCardProps {
  user: {
    name: string
    role: "doctor" | "patient"
    email: string
    phone: string
    avatar?: string
    specialization?: string
    patientId?: string
    dateOfBirth?: string
    bloodType?: string
  }
}

export function ProfileCard({ user }: ProfileCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <Badge variant={user.role === "doctor" ? "default" : "secondary"}>
              {user.role === "doctor" ? "Doctor" : "Paciente"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {user.role === "doctor" && user.specialization && (
          <div className="flex items-start space-x-2 text-sm">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Especialización</p>
              <p className="font-medium">{user.specialization}</p>
            </div>
          </div>
        )}

        {user.role === "patient" && (
          <>
            {user.patientId && (
              <div className="flex items-start space-x-2 text-sm">
                <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">ID de Paciente</p>
                  <p className="font-medium">{user.patientId}</p>
                </div>
              </div>
            )}
            {user.dateOfBirth && (
              <div className="flex items-start space-x-2 text-sm">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">Fecha de Nacimiento</p>
                  <p className="font-medium">{user.dateOfBirth}</p>
                </div>
              </div>
            )}
            {user.bloodType && (
              <div className="flex items-start space-x-2 text-sm">
                <div className="w-4 h-4 mt-0.5 text-muted-foreground flex items-center justify-center font-bold text-xs">
                  B
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Tipo de Sangre</p>
                  <p className="font-medium">{user.bloodType}</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-start space-x-2 text-sm">
          <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Correo Electrónico</p>
            <p className="font-medium break-all">{user.email}</p>
          </div>
        </div>

        <div className="flex items-start space-x-2 text-sm">
          <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground text-xs">Teléfono</p>
            <p className="font-medium">{user.phone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
