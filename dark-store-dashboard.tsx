"use client";

import { useState, useEffect } from "react";
import GoogleOneTap from "./components/google-one-tap";
import { Button } from "@/components/ui/button";
import { AlertsPanel } from "@/components/alerts-panel";
import { PatientChart } from "@/components/patient-chart";
import { PatientList } from "./components/patient-list";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

import { ProfileCard } from "./components/profile-card";
import { usePatients } from "./hooks/use-patients";
import { useMeasurements } from "./hooks/use-measurements";
import { useNotifications } from "./hooks/use-notifications";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";

// Helper to get user from Supabase
function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    // Initial check
    supabase.auth.getUser().then(({ data }) => {
      console.log("User changed:", data.user ?? null);
      setUser(data.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return user;
}

// Helper to map Supabase user to ProfileCard format
function mapSupabaseUserToProfile(user: User) {
  return {
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuario",
    role: "doctor" as const,
    email: user.email || "",
    phone: user.phone || user.user_metadata?.phone || "No especificado",
    avatar:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      "/placeholder.svg",
    specialization: user.user_metadata?.specialization || "Medicina General",
  };
}

export default function DarkStoreDashboard() {
  const user = useSupabaseUser();
  const [dateRange, setDateRange] = useState("today");
  const [selectedPatientId, setSelectedPatientId] = useState<
    string | undefined
  >(undefined);
  const [selectedProsthesis, setSelectedProsthesis] = useState<string>("");

  const userRole: "doctor" | "patient" = "doctor";

  // Use Supabase hooks
  const {
    patients,
    addPatient,
    updatePatient,
    loading: patientsLoading,
  } = usePatients();
  const {
    measurements,
    getChartData,
    getAccelerationData,
    getMicromovementData,
  } = useMeasurements(selectedPatientId, selectedProsthesis);
  const { notifications, addNotification, markAsRead, unreadCount } =
    useNotifications();

  // Map patients to match PatientList expected props (camelCase)
  const mappedPatients = patients.map((p) => ({
    ...p,
    lastVisit: p.last_visit,
    clinicalHistory: p.clinical_history,
  }));
  const selectedPatient = mappedPatients.find(
    (p) => p.id === selectedPatientId
  );

  useEffect(() => {
    if (
      selectedPatient &&
      !selectedProsthesis &&
      selectedPatient.prostheses.length > 0
    ) {
      setSelectedProsthesis(selectedPatient.prostheses[0]);
    }
    if (
      selectedPatient &&
      selectedProsthesis &&
      !selectedPatient.prostheses.includes(selectedProsthesis)
    ) {
      setSelectedProsthesis(selectedPatient.prostheses[0] || "");
    }
    // eslint-disable-next-line
  }, [selectedPatient, selectedProsthesis]);

  // PatientList expects: onAddPatient(patient: Omit<Patient, "id" | "avatar">)
  const handleAddPatient = async (newPatient: any) => {
    try {
      await addPatient({
        ...newPatient,
        last_visit: newPatient.lastVisit,
        clinical_history: newPatient.clinicalHistory,
      });
    } catch (error) {
      console.error("Failed to add patient:", error);
    }
  };

  const sendEmailNotification = async (
    patientName: string,
    newStatus: string
  ) => {
    const userEmail = user?.email || "No email";
    console.log("[v0] Sending email notification to:", userEmail);
    console.log("[v0] Patient:", patientName, "Status changed to:", newStatus);

    // In a real application, this would call an API endpoint to send the email
    try {
      // Example API call:
      // await fetch('/api/send-notification', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     to: userEmail,
      //     subject: `Alerta: Cambio de estado del paciente ${patientName}`,
      //     message: `El estado del paciente ${patientName} ha cambiado a ${newStatus}`
      //   })
      // })

      // Add notification to the database
      await addNotification({
        message: `El paciente ${patientName} cambió a estado ${newStatus}`,
        timestamp: new Date().toISOString(),
        read: false,
        patient_id: selectedPatientId,
      });
    } catch (error) {
      console.error("[v0] Error sending notification:", error);
    }
  };

  // Monitor patient status changes for notifications
  useEffect(() => {
    patients.forEach((patient) => {
      if (patient.status === "warning" || patient.status === "moving") {
        // In a real app, you'd track previous states and only notify on actual changes
        // For now, this is a placeholder for the notification logic
      }
    });
  }, [patients]);

  if (!user) {
    // Not logged in: show login button and GoogleOneTap
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen relative"
        style={{
          backgroundImage: 'url("/hospital-login-bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4 text-white drop-shadow">
            Iniciar sesión
          </h1>
          <Button
            onClick={async () => {
              // Always trigger Supabase Google OAuth popup for login/signup
              await supabase.auth.signInWithOAuth({ provider: "google" });
            }}
            className="mb-4"
          >
            Iniciar sesión con Google
          </Button>
          <GoogleOneTap />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-center">
              <img
                src="/hospital-logo.png"
                alt="Hospital Universitario Austral"
                className="h-12 w-auto"
              />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <ProfileCard user={mapSupabaseUserToProfile(user!)} />
              </SidebarGroupContent>
            </SidebarGroup>

            {userRole === "doctor" && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <PatientList
                    patients={mappedPatients}
                    selectedPatientId={selectedPatientId}
                    onPatientSelect={setSelectedPatientId}
                    onAddPatient={handleAddPatient}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedPatient
                    ? `Paciente: ${selectedPatient.name}`
                    : "Panel de Pacientes"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient
                    ? `${
                        selectedProsthesis || selectedPatient.prostheses[0]
                      } - ${
                        selectedPatient.status === "stable"
                          ? "Estable"
                          : selectedPatient.status === "warning"
                          ? "Advertencia"
                          : "Movimiento"
                      }`
                    : "Seleccione un paciente para ver los detalles"}
                </p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notificaciones">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="ml-1 inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="max-h-96 overflow-y-auto">
                  <AlertsPanel />
                </div>
              </PopoverContent>
            </Popover>
          </header>
          <main className="p-6">
            {selectedPatient ? (
              <div className="space-y-8">
                {/* Summary Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Prótesis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Prótesis</CardTitle>
                      <CardDescription>Prótesis seleccionada</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">
                        {selectedProsthesis ||
                          selectedPatient.prostheses[0] ||
                          "-"}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Última Medición */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Última Medición</CardTitle>
                      <CardDescription>
                        Fecha de la última medición
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">
                        {selectedPatient.lastVisit
                          ? new Date(
                              selectedPatient.lastVisit
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Historia Clínica */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Historia Clínica</CardTitle>
                      <CardDescription>Resumen</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm line-clamp-3">
                        {selectedPatient.clinicalHistory || "Sin información"}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Estado */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Estado</CardTitle>
                      <CardDescription>Estado actual</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-lg font-semibold ${
                          selectedPatient.status === "stable"
                            ? "text-green-600"
                            : selectedPatient.status === "warning"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedPatient.status === "stable"
                          ? "Estable"
                          : selectedPatient.status === "warning"
                          ? "Advertencia"
                          : selectedPatient.status === "moving"
                          ? "Movimiento"
                          : selectedPatient.status || "-"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aceleración</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PatientChart
                        data={getChartData("acceleration")}
                        xLabel="Tiempo"
                        yLabel="Aceleración (m/s²)"
                        color="#3b82f6"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Micromovimiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PatientChart
                        data={getChartData("micromovement")}
                        xLabel="Tiempo"
                        yLabel="Micromovimiento (μm)"
                        color="#10b981"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-muted-foreground">
                    Ningún Paciente Seleccionado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Seleccione un paciente de la barra lateral para ver sus
                    datos médicos
                  </p>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
