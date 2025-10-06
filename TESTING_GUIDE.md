# 🧪 Testing Guide - Step by Step

Follow these steps to test your Supabase integration:

## Step 1: Set Up Your Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project name: "medical-dashboard"
6. Create a strong password
7. Choose a region close to you
8. Click "Create new project"
9. Wait for the project to be created (2-3 minutes)

### 1.2 Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon public** key (long string starting with `eyJ...`)

## Step 2: Configure Environment Variables

### 2.1 Update .env.local File
1. Open the file `.env.local` in your project folder
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MDAwMCwiZXhwIjoyMDE0MzM2MDAwfQ.example-signature
```

## Step 3: Set Up Your Database

### 3.1 Your Schema is Already Perfect!
Your existing database schema is already set up correctly. You have these tables:
- `medico` (doctors)
- `paciente` (patients) 
- `protesis` (prostheses)
- `sensor` (sensors)
- `lectura` (sensor readings)
- `evento` (events/alerts)

### 3.2 Add Sample Data (Optional)
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `scripts/insert-sample-data.sql`
4. Click "Run" to insert sample patients and data

## Step 4: Test the Connection

### 4.1 Test Database Connection
Open your terminal/command prompt and run:

```bash
cd "C:\Users\Usuario\Desktop\dark-store-dashboard (1)"
npm run test:supabase
```

**Expected Output:**
```
🔍 Testing Supabase connection...
✅ Successfully connected to Supabase!
🔍 Testing database tables...
✅ Table medico: OK
✅ Table paciente: OK
✅ Table protesis: OK
✅ Table sensor: OK
✅ Table lectura: OK
✅ Table evento: OK
🔍 Testing real-time subscription...
✅ Real-time subscription working!
✅ Real-time test completed

🎉 All tests passed! Your Supabase integration is ready.
```

### 4.2 Start the Development Server
```bash
npm run dev
```

**Expected Output:**
```
> my-v0-project@0.1.0 dev
> next dev

   ▲ Next.js 14.2.16
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.100:3000

 ✓ Ready in 2.3s
```

## Step 5: View Your Dashboard

### 5.1 Open the Dashboard
1. Open your web browser
2. Go to `http://localhost:3000`
3. You should see your medical dashboard!

### 5.2 What You Should See
- A sidebar with doctor profile
- A list of patients (if you added sample data)
- Patient details and charts when you select a patient
- Real-time notifications

## Troubleshooting

### ❌ "Missing Supabase credentials" Error
**Solution:** Make sure your `.env.local` file has the correct values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
```

### ❌ "Connection failed" Error
**Solution:** 
1. Check your internet connection
2. Verify your Supabase URL and key are correct
3. Make sure your Supabase project is active

### ❌ "Table not found" Error
**Solution:** Your database tables might not exist. Run your original SQL schema in the Supabase SQL Editor.

### ❌ Dashboard Shows "No patients" or Empty
**Solution:** Add sample data by running `scripts/insert-sample-data.sql` in your Supabase SQL Editor.

### ❌ Charts Not Showing Data
**Solution:** Make sure you have sensor readings in the `lectura` table. The sample data includes this.

## Need Help?

If you're still having issues:
1. Check the browser console for errors (F12 → Console)
2. Check the terminal where `npm run dev` is running for errors
3. Make sure your Supabase project is active and not paused

## Success! 🎉

Once everything is working, you'll have:
- ✅ Real-time medical dashboard
- ✅ Patient management
- ✅ Sensor data visualization
- ✅ Live notifications
- ✅ Database integration

Your dashboard will automatically update when data changes in your Supabase database!
