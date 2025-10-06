// Test script to verify Supabase connection
// Run with: node scripts/test-supabase.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })
    
    return envVars
  } catch (error) {
    console.log('⚠️  Could not read .env.local file')
    return {}
  }
}

const envVars = loadEnvFile()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('Please add:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection with your existing schema
    const { data, error } = await supabase
      .from('paciente')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }

    console.log('✅ Successfully connected to Supabase!')
    
    // Test your existing tables
    console.log('🔍 Testing database tables...')
    
    const tables = ['medico', 'paciente', 'protesis', 'sensor', 'lectura', 'evento']
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`⚠️  Table ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: OK`)
      }
    }
    
    // Test real-time subscription
    console.log('🔍 Testing real-time subscription...')
    
    const channel = supabase
      .channel('test_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'paciente'
      }, (payload) => {
        console.log('✅ Real-time subscription working!', payload.eventType)
      })
      .subscribe()

    // Wait a bit then unsubscribe
    setTimeout(() => {
      channel.unsubscribe()
      console.log('✅ Real-time test completed')
      console.log('\n🎉 All tests passed! Your Supabase integration is ready.')
      console.log('\n📋 Next steps:')
      console.log('1. Add some sample data to your tables')
      console.log('2. Run: npm run dev')
      console.log('3. Open http://localhost:3000')
    }, 2000)

    return true
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

testConnection()

