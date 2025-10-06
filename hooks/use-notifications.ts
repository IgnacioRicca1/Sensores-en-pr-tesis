import { useState, useEffect } from 'react'
import { supabase, Notification, Evento } from '@/lib/supabase'
import { mapEventoToNotification } from '@/lib/data-mappers'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications from evento table
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data: eventos, error } = await supabase
        .from('evento')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50) // Limit to last 50 events

      if (error) throw error
      
      // Map eventos to notifications
      const mappedNotifications = eventos?.map(mapEventoToNotification) || []
      setNotifications(mappedNotifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Add new notification (creates an evento)
  const addNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
    try {
      // Create an evento instead of a notification
      const eventoData = {
        sensor_id: 1, // Default sensor - you should get this from context
        timestamp: notificationData.timestamp,
        desp_um: 0, // Default value
        estado_lectura: 'warning' as const,
        message: notificationData.message,
        event_duration: null
      }

      const { data, error } = await supabase
        .from('evento')
        .insert([eventoData])
        .select()

      if (error) throw error
      if (data) {
        const newNotification = mapEventoToNotification(data[0])
        setNotifications(prev => [newNotification, ...prev])
        return newNotification
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notification')
      throw err
    }
  }

  // Mark notification as read (for eventos, we'll just update local state)
  const markAsRead = async (id: string) => {
    try {
      // Since eventos don't have a read field, we'll just update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
      throw err
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Since eventos don't have a read field, we'll just update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
      throw err
    }
  }

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications()

    const subscription = supabase
      .channel('evento_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evento'
        },
        (payload) => {
          console.log('Evento change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newNotification = mapEventoToNotification(payload.new as Evento)
            setNotifications(prev => [newNotification, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = mapEventoToNotification(payload.new as Evento)
            setNotifications(prev =>
              prev.map(notification =>
                notification.id === updatedNotification.id ? updatedNotification : notification
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev =>
              prev.filter(notification => notification.id !== payload.old.evento_id.toString())
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    notifications,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    unreadCount,
    refetch: fetchNotifications
  }
}

