import { Paciente, Protesis, Lectura, Evento, Medico, Patient, Doctor, Measurement, Notification } from './supabase'

// Helper function to calculate age from birth date
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Helper function to get the latest reading status for a patient
function getLatestStatus(readings: Lectura[]): 'stable' | 'warning' | 'moving' {
  if (readings.length === 0) return 'stable'
  
  const latest = readings.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0]
  
  switch (latest.estado_lectura) {
    case 'ok': return 'stable'
    case 'warning': return 'warning'
    case 'alert': return 'moving'
    default: return 'stable'
  }
}

// Helper function to get the latest reading timestamp formatted for display
function getLatestTimestamp(readings: Lectura[]): string {
  if (readings.length === 0) return new Date().toLocaleDateString('es-ES')
  
  const latest = readings.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0]
  
  // Format the timestamp to show as a readable date (e.g., "1-10-2025")
  return new Date(latest.timestamp).toLocaleDateString('es-ES')
}

// Map database Paciente to frontend Patient
export function mapPacienteToPatient(
  paciente: Paciente, 
  protesis: Protesis[], 
  readings: Lectura[]
): Patient {
  const prostheses = protesis.map(p => 
    p.lado ? `${p.tipo} (${p.lado})` : p.tipo
  )
  
  return {
    id: paciente.paciente_id.toString(),
    name: `${paciente.nombre} ${paciente.apellido}`,
    age: paciente.fecha_nac ? calculateAge(paciente.fecha_nac) : 0,
    prostheses,
    status: getLatestStatus(readings),
    last_visit: getLatestTimestamp(readings),
    clinical_history: paciente.historia_clinica || '',
    created_at: paciente.updated_at || new Date().toISOString(),
    updated_at: paciente.updated_at || new Date().toISOString()
  }
}

// Map database Medico to frontend Doctor
export function mapMedicoToDoctor(medico: Medico): Doctor {
  return {
    id: medico.medico_id.toString(),
    name: `${medico.nombre} ${medico.apellido}`,
    role: 'doctor',
    email: medico.email,
    phone: medico.telefono || '',
    avatar: '/placeholder.svg?height=80&width=80',
    specialization: 'Medicina General', // You can add this field to your medico table
    created_at: medico.updated_at || new Date().toISOString(),
    updated_at: medico.updated_at || new Date().toISOString()
  }
}

// Map database Lectura to frontend Measurement (for acceleration)
export function mapLecturaToAccelerationMeasurement(
  lectura: Lectura, 
  protesis: Protesis
): Measurement {
  const prosthesisName = protesis.lado ? 
    `${protesis.tipo} (${protesis.lado})` : 
    protesis.tipo

  return {
    id: lectura.lectura_id.toString(),
    patient_id: protesis.paciente_id.toString(),
    prosthesis_name: prosthesisName,
    measurement_type: 'acceleration',
    value: lectura.a_total || 0,
    timestamp: lectura.timestamp,
    created_at: lectura.timestamp
  }
}

// Map database Lectura to frontend Measurement (for micromovement)
export function mapLecturaToMicromovementMeasurement(
  lectura: Lectura, 
  protesis: Protesis
): Measurement {
  const prosthesisName = protesis.lado ? 
    `${protesis.tipo} (${protesis.lado})` : 
    protesis.tipo

  return {
    id: lectura.lectura_id.toString(),
    patient_id: protesis.paciente_id.toString(),
    prosthesis_name: prosthesisName,
    measurement_type: 'micromovement',
    value: lectura.desp_um || 0,
    timestamp: lectura.timestamp,
    created_at: lectura.timestamp
  }
}

// Map database Evento to frontend Notification
export function mapEventoToNotification(evento: Evento): Notification {
  return {
    id: evento.evento_id.toString(),
    message: evento.message || `Evento detectado: ${evento.estado_lectura}`,
    timestamp: evento.timestamp,
    read: false, // Events are always unread initially
    patient_id: undefined, // We'll need to join to get this
    created_at: evento.timestamp
  }
}

// Create a new Paciente from frontend Patient data
export function mapPatientToPaciente(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Omit<Paciente, 'paciente_id'> {
  const [nombre, apellido] = patient.name.split(' ', 2)
  
  return {
    medico_id: 1, // Default doctor ID - you should get this from auth
    nombre: nombre || '',
    apellido: apellido || '',
    fecha_nac: new Date(new Date().getFullYear() - patient.age, 0, 1).toISOString().split('T')[0],
    historia_clinica: patient.clinical_history,
    updated_at: new Date().toISOString()
  }
}

// Create Protesis records from frontend Patient prostheses
export function mapProsthesesToProtesis(
  prostheses: string[], 
  pacienteId: number
): Omit<Protesis, 'protesis_id'>[] {
  return prostheses.map(prosthesis => {
    // Parse prosthesis string like "Rodilla (izq)" or "Cadera"
    const match = prosthesis.match(/^(.+?)\s*\((.+)\)$/)
    if (match) {
      return {
        paciente_id: pacienteId,
        tipo: match[1].trim(),
        lado: match[2].trim()
      }
    } else {
      return {
        paciente_id: pacienteId,
        tipo: prosthesis.trim(),
        lado: undefined
      }
    }
  })
}
