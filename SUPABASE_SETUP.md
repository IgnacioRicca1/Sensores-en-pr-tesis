# Supabase Integration Setup

This project has been successfully integrated with Supabase for real-time database connectivity using your existing database schema. Follow these steps to complete the setup:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization and enter project details
5. Wait for the project to be created

## 2. Set Up Database Schema

Your existing database schema is already perfect! The tables you have are:

- **`medico`** - Doctor information and authentication
- **`paciente`** - Patient data linked to doctors
- **`protesis`** - Prostheses linked to patients (with type and side)
- **`sensor`** - Sensors linked to patients and prostheses
- **`lectura`** - IMU readings with acceleration data and displacement
- **`evento`** - Detected events with status changes

## 3. Add Sample Data (Optional)

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `scripts/insert-sample-data.sql` into the editor
3. Click "Run" to insert sample patients, prostheses, sensors, and readings

## 4. Configure Environment Variables

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon public key
3. Open the `.env.local` file in your project root
4. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

## 5. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. You should see the dashboard with real-time data from Supabase

## Features Implemented

### Real-time Updates
- **Patients**: Automatically updates when patients are added, modified, or deleted
- **Measurements**: Real-time chart updates when new measurements are added
- **Notifications**: Instant notification updates across all connected clients

### Database Tables (Your Existing Schema)
- `medico`: Doctor information and authentication
- `paciente`: Patient data linked to doctors
- `protesis`: Prostheses linked to patients (with type and side)
- `sensor`: Sensors linked to patients and prostheses
- `lectura`: IMU readings with acceleration data and displacement
- `evento`: Detected events with status changes

### Custom Hooks
- `usePatients()`: Manage patient data with CRUD operations
- `useMeasurements()`: Handle measurement data and chart generation
- `useNotifications()`: Manage notifications and real-time updates

## Data Flow

1. **Real-time Subscriptions**: All data changes are automatically synchronized across all connected clients
2. **Optimistic Updates**: UI updates immediately for better user experience
3. **Error Handling**: Comprehensive error handling with user feedback
4. **Type Safety**: Full TypeScript support with proper type definitions

## Security

The current setup uses Row Level Security (RLS) with permissive policies for development. For production:

1. Implement proper authentication (Supabase Auth)
2. Create restrictive RLS policies based on user roles
3. Use service role keys for server-side operations
4. Implement proper data validation and sanitization

## Next Steps

1. **Authentication**: Add user login/logout functionality
2. **Role-based Access**: Implement different views for doctors vs patients
3. **Data Validation**: Add form validation using Zod schemas
4. **API Routes**: Create Next.js API routes for complex operations
5. **File Uploads**: Add support for patient documents and images

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify your environment variables are correct
2. **Permission Errors**: Check your RLS policies in Supabase
3. **Real-time Not Working**: Ensure your Supabase project has real-time enabled
4. **Type Errors**: Make sure all TypeScript types are properly imported

### Debug Mode

Enable debug logging by adding this to your environment:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

This will log all Supabase operations to the browser console.

## Support

For issues related to:
- **Supabase**: Check the [Supabase Documentation](https://supabase.com/docs)
- **Next.js**: Check the [Next.js Documentation](https://nextjs.org/docs)
- **This Project**: Review the code comments and TypeScript types

