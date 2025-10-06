import { useState, useEffect } from 'react'
import { supabase, Patient, Paciente, Protesis, Lectura } from '@/lib/supabase'
import { mapPacienteToPatient, mapPatientToPaciente, mapProsthesesToProtesis } from '@/lib/data-mappers'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch patients with their prostheses and latest readings
  const fetchPatients = async () => {
    try {
      setLoading(true)
      
      // Fetch all patients
      const { data: pacientes, error: pacientesError } = await supabase
        .from('paciente')
        .select('*')
        .order('paciente_id', { ascending: false })

      if (pacientesError) throw pacientesError

      if (!pacientes) {
        setPatients([])
        return
      }

      // Fetch prostheses for all patients
      const { data: protesis, error: protesisError } = await supabase
        .from('protesis')
        .select('*')

      if (protesisError) throw protesisError

      // Fetch latest readings for each sensor
      const { data: lecturas, error: lecturasError } = await supabase
        .from('lectura')
        .select(`
          *,
          sensor:sensor_id (
            paciente_id,
            protesis_id
          )
        `)
        .order('timestamp', { ascending: false })

      if (lecturasError) throw lecturasError

      // Map data to frontend format
      const mappedPatients = pacientes.map(paciente => {
        const patientProtesis = protesis?.filter(p => p.paciente_id === paciente.paciente_id) || []
        const patientReadings = lecturas?.filter(l => 
          l.sensor?.paciente_id === paciente.paciente_id
        ) || []
        
        return mapPacienteToPatient(paciente, patientProtesis, patientReadings)
      })

      setPatients(mappedPatients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Add new patient
  const addPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Convert frontend patient data to database format
      const pacienteData = mapPatientToPaciente(patientData)
      
      // Insert patient
      const { data: paciente, error: pacienteError } = await supabase
        .from('paciente')
        .insert([pacienteData])
        .select()

      if (pacienteError) throw pacienteError

      if (!paciente || paciente.length === 0) {
        throw new Error('Failed to create patient')
      }

      const newPaciente = paciente[0]

      // Insert prostheses
      const protesisData = mapProsthesesToProtesis(patientData.prostheses, newPaciente.paciente_id)
      
      if (protesisData.length > 0) {
        const { error: protesisError } = await supabase
          .from('protesis')
          .insert(protesisData)

        if (protesisError) throw protesisError
      }

      // Convert back to frontend format and add to state
      const frontendPatient = mapPacienteToPatient(newPaciente, protesisData, [])
      setPatients(prev => [frontendPatient, ...prev])
      
      return frontendPatient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add patient')
      throw err
    }
  }

  // Update patient
  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const pacienteId = parseInt(id)
      
      // Update patient basic info
      const pacienteUpdates: Partial<Paciente> = {}
      if (updates.name) {
        const [nombre, apellido] = updates.name.split(' ', 2)
        pacienteUpdates.nombre = nombre || ''
        pacienteUpdates.apellido = apellido || ''
      }
      if (updates.clinical_history) {
        pacienteUpdates.historia_clinica = updates.clinical_history
      }
      pacienteUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('paciente')
        .update(pacienteUpdates)
        .eq('paciente_id', pacienteId)
        .select()

      if (error) throw error

      // Update prostheses if provided
      if (updates.prostheses) {
        // Delete existing prostheses
        await supabase
          .from('protesis')
          .delete()
          .eq('paciente_id', pacienteId)

        // Insert new prostheses
        const protesisData = mapProsthesesToProtesis(updates.prostheses, pacienteId)
        if (protesisData.length > 0) {
          await supabase
            .from('protesis')
            .insert(protesisData)
        }
      }

      if (data) {
        // Refresh the patient data
        await fetchPatients()
      }
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient')
      throw err
    }
  }

  // Delete patient
  const deletePatient = async (id: string) => {
    try {
      const pacienteId = parseInt(id)
      
      const { error } = await supabase
        .from('paciente')
        .delete()
        .eq('paciente_id', pacienteId)

      if (error) throw error
      setPatients(prev => prev.filter(patient => patient.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patient')
      throw err
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchPatients()

    // Subscribe to changes in paciente table
    const pacienteSubscription = supabase
      .channel('paciente_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'paciente'
        },
        (payload) => {
          console.log('Paciente change received:', payload)
          // Refresh all patients when any patient changes
          fetchPatients()
        }
      )
      .subscribe()

    // Subscribe to changes in protesis table
    const protesisSubscription = supabase
      .channel('protesis_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'protesis'
        },
        (payload) => {
          console.log('Protesis change received:', payload)
          // Refresh all patients when prostheses change
          fetchPatients()
        }
      )
      .subscribe()

    // Subscribe to changes in lectura table (for status updates)
    const lecturaSubscription = supabase
      .channel('lectura_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lectura'
        },
        (payload) => {
          console.log('Lectura change received:', payload)
          // Refresh all patients when readings change
          fetchPatients()
        }
      )
      .subscribe()

    return () => {
      pacienteSubscription.unsubscribe()
      protesisSubscription.unsubscribe()
      lecturaSubscription.unsubscribe()
    }
  }, [])

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    refetch: fetchPatients
  }
}

