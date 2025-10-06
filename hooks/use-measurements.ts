import { useState, useEffect } from 'react'
import { supabase, Measurement, Lectura, Protesis } from '@/lib/supabase'
import { mapLecturaToAccelerationMeasurement, mapLecturaToMicromovementMeasurement } from '@/lib/data-mappers'

export function useMeasurements(patientId?: string, prosthesisName?: string) {
  const [timeRange, setTimeRange] = useState<'hoy' | 'ayer' | '7dias' | '30dias'>('hoy');
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch measurements from lectura table
  const fetchMeasurements = async () => {
    if (!patientId) return

    try {
      setLoading(true)
      const pacienteId = parseInt(patientId)

      // First, get sensors for this patient
      const { data: sensors, error: sensorsError } = await supabase
        .from('sensor')
        .select(`
          sensor_id,
          protesis_id,
          protesis:protesis_id (
            protesis_id,
            paciente_id,
            tipo,
            lado
          )
        `)
        .eq('paciente_id', pacienteId)

      if (sensorsError) throw sensorsError

      if (!sensors || sensors.length === 0) {
        setMeasurements([])
        return
      }

      // Filter sensors by prosthesis if specified
      let filteredSensors = sensors
      if (prosthesisName) {
        filteredSensors = sensors.filter(sensor => {
          const protesis = Array.isArray(sensor.protesis) ? sensor.protesis[0] : sensor.protesis;
          if (!protesis) return false;
          const prosthesisDisplayName = protesis.lado ? 
            `${protesis.tipo} (${protesis.lado})` : 
            protesis.tipo;
          return prosthesisDisplayName === prosthesisName;
        });
      }

      if (filteredSensors.length === 0) {
        setMeasurements([])
        return
      }

      const sensorIds = filteredSensors.map(s => s.sensor_id)

      // Get readings for these sensors
      const { data: lecturas, error: lecturasError } = await supabase
        .from('lectura')
        .select('*')
        .in('sensor_id', sensorIds)
        .order('timestamp', { ascending: true })

      if (lecturasError) throw lecturasError

      // Map readings to measurements (both acceleration and micromovement)
      const accelerationMeasurements = lecturas?.map(lectura => {
  const sensor = filteredSensors.find(s => s.sensor_id === lectura.sensor_id);
  let protesis: Protesis | null = null;
  if (sensor) {
    if (Array.isArray(sensor.protesis)) {
      protesis = sensor.protesis[0] as Protesis;
    } else {
      protesis = sensor.protesis as Protesis;
    }
  }
  if (!protesis) return null;
  return mapLecturaToAccelerationMeasurement(lectura, protesis);
      }).filter(Boolean) as Measurement[]

      const micromovementMeasurements = lecturas?.map(lectura => {
  const sensor = filteredSensors.find(s => s.sensor_id === lectura.sensor_id);
  let protesis: Protesis | null = null;
  if (sensor) {
    if (Array.isArray(sensor.protesis)) {
      protesis = sensor.protesis[0] as Protesis;
    } else {
      protesis = sensor.protesis as Protesis;
    }
  }
  if (!protesis) return null;
  return mapLecturaToMicromovementMeasurement(lectura, protesis);
      }).filter(Boolean) as Measurement[]

      // Combine both types of measurements
      setMeasurements([...accelerationMeasurements, ...micromovementMeasurements])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Add new measurement (this would typically be called by IoT devices)
  const addMeasurement = async (measurementData: Omit<Measurement, 'id' | 'created_at'>) => {
    try {
      // This is a simplified version - in reality, you'd need to:
      // 1. Find the sensor_id for the patient and prosthesis
      // 2. Insert into lectura table
      // 3. Possibly create an evento if thresholds are exceeded
      
      console.log('Adding measurement:', measurementData)
      // For now, just refresh the measurements
      await fetchMeasurements()
      
      return measurementData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add measurement')
      throw err
    }
  }

  // Get measurements for chart (last 7 data points)
  const getChartData = (type: 'acceleration' | 'micromovement') => {
    const filtered = measurements
      .filter(m => m.measurement_type === type)
      .slice(-7) // Get last 7 measurements

    return filtered.map((measurement, index) => ({
      x: index,
      y: Number(measurement.value)
    }))
  }

  // Helper to format date for x-axis
  const formatDate = (date: Date, mode: 'hour' | 'day') => {
    if (mode === 'hour') {
      return `${date.getHours()}:00`;
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  };

  // Get filtered and grouped data for chart
  const getFilteredChartData = (type: 'acceleration' | 'micromovement') => {
    const now = new Date();
    let start: Date, end: Date, groupMode: 'hour' | 'day';
    if (timeRange === 'hoy') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      groupMode = 'hour';
    } else if (timeRange === 'ayer') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      groupMode = 'hour';
    } else if (timeRange === '7dias') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      groupMode = 'day';
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      groupMode = 'day';
    }

    // Filter by type and time range, handle invalid/missing timestamps
    const filtered = measurements.filter(m => {
      if (!m.timestamp) return false;
      const date = new Date(m.timestamp);
      return m.measurement_type === type && !isNaN(date.getTime()) && date >= start && date < end;
    });

    // If no data matches, fallback to last 7 measurements of the type
    if (filtered.length === 0) {
      const fallback = measurements
        .filter(m => m.measurement_type === type)
        .slice(-7);
      return fallback.map((measurement, index) => ({
        x: index,
        y: Number(measurement.value)
      }));
    }

    // Group by hour or day
    const grouped: { [key: string]: number[] } = {};
    filtered.forEach(m => {
      const date = new Date(m.timestamp);
      const key = formatDate(date, groupMode);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(Number(m.value));
    });

    // Aggregate (average) values per group
    return Object.entries(grouped).map(([x, values]) => ({
      x,
      y: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
    }));
  };

  // Get acceleration data (filtered)
  const getAccelerationData = () => getFilteredChartData('acceleration');
  // Get micromovement data (filtered)
  const getMicromovementData = () => getFilteredChartData('micromovement');

  // Get micromovement data (from desp_um field in lectura table)
  // Removed obsolete getMicromovementData, only using filtered version above

  // Set up real-time subscription
  useEffect(() => {
    if (patientId) {
      fetchMeasurements()

      // Subscribe to lectura changes
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
            // Refresh measurements when any reading changes
            fetchMeasurements()
          }
        )
        .subscribe()

      // Subscribe to sensor changes
      const sensorSubscription = supabase
        .channel('sensor_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sensor'
          },
          (payload) => {
            console.log('Sensor change received:', payload)
            // Refresh measurements when sensors change
            fetchMeasurements()
          }
        )
        .subscribe()

      return () => {
        lecturaSubscription.unsubscribe()
        sensorSubscription.unsubscribe()
      }
    }
  }, [patientId, prosthesisName])

  return {
    measurements,
    loading,
    error,
    addMeasurement,
    getChartData,
    getAccelerationData,
    getMicromovementData,
    refetch: fetchMeasurements,
    timeRange,
    setTimeRange
  }
}

