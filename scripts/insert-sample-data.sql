-- Sample data for your existing database schema
-- Run this in your Supabase SQL Editor to populate with test data

-- Insert sample doctor
INSERT INTO medico (nombre, apellido, email, password, telefono) VALUES
('Sarah', 'Johnson', 'sarah.johnson@hospital.com', 'password123', '+1 (555) 123-4567')
ON CONFLICT (email) DO NOTHING;

-- Get the doctor ID
DO $$
DECLARE
    doctor_id_var BIGINT;
BEGIN
    SELECT medico_id INTO doctor_id_var FROM medico WHERE email = 'sarah.johnson@hospital.com';
    
    -- Insert sample patients
    INSERT INTO paciente (medico_id, nombre, apellido, fecha_nac, dni, email, telefono, historia_clinica) VALUES
    (doctor_id_var, 'Juan', 'Smith', '1979-03-15', '12345678', 'juan.smith@email.com', '+1 (555) 111-1111', 'HC123456'),
    (doctor_id_var, 'Emma', 'Davis', '1992-07-22', '23456789', 'emma.davis@email.com', '+1 (555) 222-2222', 'HC234567'),
    (doctor_id_var, 'Michael', 'Brown', '1966-11-08', '34567890', 'michael.brown@email.com', '+1 (555) 333-3333', 'HC345678'),
    (doctor_id_var, 'Lisa', 'Wilson', '1983-05-30', '45678901', 'lisa.wilson@email.com', '+1 (555) 444-4444', 'HC456789')
    ON CONFLICT DO NOTHING;
END $$;

-- Insert prostheses for patients
INSERT INTO protesis (paciente_id, tipo, lado) VALUES
((SELECT paciente_id FROM paciente WHERE nombre = 'Juan' AND apellido = 'Smith'), 'Rodilla', 'izq'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Emma' AND apellido = 'Davis'), 'Cadera', 'der'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Emma' AND apellido = 'Davis'), 'Rodilla', 'izq'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Michael' AND apellido = 'Brown'), 'Hombro', 'der'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Lisa' AND apellido = 'Wilson'), 'Tobillo', 'izq')
ON CONFLICT DO NOTHING;

-- Insert sensors for prostheses
INSERT INTO sensor (paciente_id, protesis_id, modelo, numero_serie) VALUES
((SELECT paciente_id FROM paciente WHERE nombre = 'Juan' AND apellido = 'Smith'), 
 (SELECT protesis_id FROM protesis WHERE tipo = 'Rodilla' AND lado = 'izq' AND paciente_id = (SELECT paciente_id FROM paciente WHERE nombre = 'Juan' AND apellido = 'Smith')), 
 'IMU-001', 'SN001'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Emma' AND apellido = 'Davis'), 
 (SELECT protesis_id FROM protesis WHERE tipo = 'Cadera' AND lado = 'der' AND paciente_id = (SELECT paciente_id FROM paciente WHERE nombre = 'Emma' AND apellido = 'Davis')), 
 'IMU-002', 'SN002'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Emma' AND apellido = 'Davis'), 
 (SELECT protesis_id FROM protesis WHERE tipo = 'Rodilla' AND lado = 'izq' AND paciente_id = (SELECT paciente_id FROM paciente WHERE nombre = 'Emma' AND apellido = 'Davis')), 
 'IMU-003', 'SN003'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Michael' AND apellido = 'Brown'), 
 (SELECT protesis_id FROM protesis WHERE tipo = 'Hombro' AND lado = 'der' AND paciente_id = (SELECT paciente_id FROM paciente WHERE nombre = 'Michael' AND apellido = 'Brown')), 
 'IMU-004', 'SN004'),
((SELECT paciente_id FROM paciente WHERE nombre = 'Lisa' AND apellido = 'Wilson'), 
 (SELECT protesis_id FROM protesis WHERE tipo = 'Tobillo' AND lado = 'izq' AND paciente_id = (SELECT paciente_id FROM paciente WHERE nombre = 'Lisa' AND apellido = 'Wilson')), 
 'IMU-005', 'SN005')
ON CONFLICT DO NOTHING;

-- Insert sample readings (last 7 days) - using your exact schema
INSERT INTO lectura (sensor_id, estado_lectura, timestamp, ax, ay, az, a_total, desp_um, desp_std) VALUES
-- Juan Smith - Rodilla (izq) - Normal readings
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW() - INTERVAL '6 hours', 0.1, 0.2, 9.8, 2.1, 5.2, 0.3),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW() - INTERVAL '5 hours', 0.2, 0.1, 9.7, 2.3, 4.8, 0.2),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW() - INTERVAL '4 hours', 0.0, 0.3, 9.9, 1.9, 6.1, 0.4),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW() - INTERVAL '3 hours', 0.3, 0.0, 9.6, 2.5, 5.5, 0.3),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW() - INTERVAL '2 hours', 0.1, 0.2, 9.8, 2.2, 4.9, 0.2),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW() - INTERVAL '1 hour', 0.0, 0.1, 9.9, 2.0, 5.8, 0.3),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN001'), 'ok', NOW(), 0.2, 0.0, 9.7, 2.4, 5.3, 0.2),

-- Emma Davis - Cadera (der) - Warning readings
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW() - INTERVAL '6 hours', 0.5, 0.8, 9.2, 3.2, 12.5, 0.8),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW() - INTERVAL '5 hours', 0.6, 0.7, 9.1, 3.4, 11.8, 0.7),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW() - INTERVAL '4 hours', 0.4, 0.9, 9.3, 3.1, 13.2, 0.9),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW() - INTERVAL '3 hours', 0.7, 0.6, 9.0, 3.5, 12.1, 0.6),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW() - INTERVAL '2 hours', 0.5, 0.8, 9.2, 3.3, 11.9, 0.8),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW() - INTERVAL '1 hour', 0.6, 0.7, 9.1, 3.4, 12.8, 0.7),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), 'warning', NOW(), 0.4, 0.9, 9.3, 3.2, 12.3, 0.9),

-- Michael Brown - Hombro (der) - Alert readings
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW() - INTERVAL '6 hours', 1.2, 1.5, 8.5, 5.8, 25.2, 1.5),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW() - INTERVAL '5 hours', 1.1, 1.6, 8.4, 5.9, 24.8, 1.6),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW() - INTERVAL '4 hours', 1.3, 1.4, 8.6, 5.7, 26.1, 1.4),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW() - INTERVAL '3 hours', 1.0, 1.7, 8.3, 6.0, 25.5, 1.7),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW() - INTERVAL '2 hours', 1.2, 1.5, 8.5, 5.8, 24.9, 1.5),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW() - INTERVAL '1 hour', 1.1, 1.6, 8.4, 5.9, 25.8, 1.6),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), 'alert', NOW(), 1.3, 1.4, 8.6, 5.7, 25.3, 1.4),

-- Lisa Wilson - Tobillo (izq) - Normal readings
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW() - INTERVAL '6 hours', 0.1, 0.1, 9.8, 1.8, 4.2, 0.1),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW() - INTERVAL '5 hours', 0.2, 0.0, 9.7, 1.9, 3.8, 0.0),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW() - INTERVAL '4 hours', 0.0, 0.2, 9.9, 1.7, 4.6, 0.2),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW() - INTERVAL '3 hours', 0.1, 0.1, 9.8, 1.8, 4.1, 0.1),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW() - INTERVAL '2 hours', 0.0, 0.2, 9.9, 1.7, 3.9, 0.2),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW() - INTERVAL '1 hour', 0.2, 0.0, 9.7, 1.9, 4.3, 0.0),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN005'), 'ok', NOW(), 0.1, 0.1, 9.8, 1.8, 4.0, 0.1)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO evento (sensor_id, timestamp, desp_um, estado_lectura, message, event_duration) VALUES
-- Warning events for Emma Davis
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), NOW() - INTERVAL '2 hours', 12.5, 'warning', 'Aceleración elevada detectada en prótesis de cadera derecha', INTERVAL '5 minutes'),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN002'), NOW() - INTERVAL '1 hour', 13.2, 'warning', 'Micromovimiento excesivo en prótesis de cadera derecha', INTERVAL '3 minutes'),

-- Alert events for Michael Brown
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), NOW() - INTERVAL '3 hours', 25.2, 'alert', 'Alerta crítica: Aceleración excesiva en prótesis de hombro derecho', INTERVAL '10 minutes'),
((SELECT sensor_id FROM sensor WHERE numero_serie = 'SN004'), NOW() - INTERVAL '1 hour', 26.1, 'alert', 'Alerta crítica: Micromovimiento crítico en prótesis de hombro derecho', INTERVAL '8 minutes')
ON CONFLICT DO NOTHING;

-- Verify the data
SELECT 
    p.nombre || ' ' || p.apellido as paciente,
    pr.tipo || CASE WHEN pr.lado IS NOT NULL THEN ' (' || pr.lado || ')' ELSE '' END as protesis,
    s.numero_serie,
    COUNT(l.lectura_id) as total_lecturas,
    MAX(l.estado_lectura) as ultimo_estado
FROM paciente p
JOIN protesis pr ON p.paciente_id = pr.paciente_id
JOIN sensor s ON pr.protesis_id = s.protesis_id
LEFT JOIN lectura l ON s.sensor_id = l.sensor_id
GROUP BY p.paciente_id, p.nombre, p.apellido, pr.tipo, pr.lado, s.numero_serie
ORDER BY p.nombre;
