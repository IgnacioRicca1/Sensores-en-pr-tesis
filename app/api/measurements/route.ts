import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sensor_id, ax, ay, az, a_total, desp_um, timestamp } = body

    // Validate required fields
    if (!sensor_id || a_total === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sensor_id and a_total' },
        { status: 400 }
      )
    }

    // Determine status based on values
    let estado_lectura: 'ok' | 'warning' | 'alert' = 'ok'
    if (a_total > 3.0) {
      estado_lectura = 'warning'
    }
    if (a_total > 5.0 || (desp_um && desp_um > 20.0)) {
      estado_lectura = 'alert'
    }

    // Insert reading into lectura table (using your exact schema)
    const { data, error } = await supabase
      .from('lectura')
      .insert([{
        sensor_id: Number(sensor_id),
        estado_lectura,
        timestamp: timestamp || new Date().toISOString(),
        ax: ax ? Number(ax) : null,
        ay: ay ? Number(ay) : null,
        az: az ? Number(az) : null,
        a_total: Number(a_total),
        desp_um: desp_um ? Number(desp_um) : null,
        desp_std: null // Add this field from your schema
      }])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to insert reading' },
        { status: 500 }
      )
    }

    // If status is warning or alert, create an evento
    if (estado_lectura === 'warning' || estado_lectura === 'alert') {
      const message = estado_lectura === 'warning' 
        ? `Aceleración elevada detectada: ${a_total} m/s²`
        : `Alerta crítica: Aceleración ${a_total} m/s²${desp_um ? `, Desplazamiento: ${desp_um} μm` : ''}`

      await supabase
        .from('evento')
        .insert([{
          sensor_id: Number(sensor_id),
          timestamp: timestamp || new Date().toISOString(),
          desp_um: desp_um ? Number(desp_um) : null,
          estado_lectura,
          message,
          event_duration: null
        }])
    }

    return NextResponse.json({ data: data[0] }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sensor_id = searchParams.get('sensor_id')
    const paciente_id = searchParams.get('paciente_id')

    let query = supabase
      .from('lectura')
      .select(`
        *,
        sensor:sensor_id (
          sensor_id,
          paciente_id,
          protesis_id,
          protesis:protesis_id (
            protesis_id,
            tipo,
            lado
          )
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (sensor_id) {
      query = query.eq('sensor_id', sensor_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch readings' },
        { status: 500 }
      )
    }

    // Filter by paciente_id if provided
    let filteredData = data
    if (paciente_id) {
      filteredData = data?.filter(reading => 
        reading.sensor?.paciente_id === parseInt(paciente_id)
      )
    }

    return NextResponse.json({ data: filteredData })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

