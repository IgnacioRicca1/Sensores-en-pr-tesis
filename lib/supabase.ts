import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching your existing schema
export interface Medico {
  medico_id: number
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  updated_at?: string
}

export interface Paciente {
  paciente_id: number
  medico_id?: number
  nombre: string
  apellido: string
  fecha_nac?: string
  dni?: string
  email?: string
  password?: string
  telefono?: string
  historia_clinica?: string
  updated_at?: string
}

export interface Protesis {
  protesis_id: number
  paciente_id: number
  tipo: string
  lado?: string
}

export interface Sensor {
  sensor_id: number
  paciente_id?: number
  protesis_id?: number
  modelo?: string
  numero_serie?: string
}

export interface Lectura {
  lectura_id: number
  sensor_id: number
  estado_lectura: 'ok' | 'warning' | 'alert'
  timestamp: string
  ax?: number
  ay?: number
  az?: number
  a_total?: number
  desp_um?: number
  desp_std?: number
}

export interface Evento {
  evento_id: number
  sensor_id: number
  timestamp: string
  desp_um?: number
  estado_lectura: 'ok' | 'warning' | 'alert'
  message?: string
  event_duration?: string
}

// Frontend-compatible types for the dashboard
export interface Patient {
  id: string
  name: string
  age: number
  prostheses: string[]
  status: 'stable' | 'warning' | 'moving'
  last_visit: string
  clinical_history: string
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  name: string
  role: 'doctor'
  email: string
  phone: string
  avatar: string
  specialization: string
  created_at: string
  updated_at: string
}

export interface Measurement {
  id: string
  patient_id: string
  prosthesis_name: string
  measurement_type: 'acceleration' | 'micromovement'
  value: number
  timestamp: string
  created_at: string
}

export interface Notification {
  id: string
  message: string
  timestamp: string
  read: boolean
  patient_id?: string
  created_at: string
}

