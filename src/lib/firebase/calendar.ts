import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { createSystemNotification } from './notifications';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  type: 'meeting' | 'training' | 'review' | 'event';
  status: 'scheduled' | 'cancelled' | 'completed';
  organizer: string;
  attendees: string[];
  departmentId?: string;
  isPrivate: boolean;
  meetingLink?: string;
  reminderMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION = 'calendarEvents';

export const getCalendarEvents = async (filters?: {
  userId?: string;
  departmentId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  try {
    // Start with base query
    let baseQuery = collection(db, COLLECTION);
    
    // Build query based on filters
    if (filters?.userId) {
      baseQuery = query(baseQuery, where('attendees', 'array-contains', filters.userId));
    }
    
    if (filters?.departmentId) {
      baseQuery = query(baseQuery, where('departmentId', '==', filters.departmentId));
    }

    // Add date range filter
    if (filters?.startDate && filters?.endDate) {
      baseQuery = query(
        baseQuery,
        where('startDate', '>=', filters.startDate),
        where('endDate', '<=', filters.endDate),
        orderBy('startDate', 'asc')
      );
    } else {
      baseQuery = query(baseQuery, orderBy('startDate', 'asc'));
    }

    const snapshot = await getDocs(baseQuery);
    
    return snapshot.docs
      .filter(doc => {
        const data = doc.data();
        const start = data.startDate?.toDate?.() || null;
        const end = data.endDate?.toDate?.() || null;
        return (!filters?.startDate || start >= filters.startDate) &&
               (!filters?.endDate || end <= filters.endDate);
      })
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...event,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Send notifications to attendees
    const notificationPromises = event.attendees.map(attendeeId =>
      createSystemNotification(
        attendeeId,
        'New Calendar Event',
        `You have been invited to: ${event.title}`,
        'calendar',
        docRef.id,
        `/calendar/event/${docRef.id}`
      )
    );

    await Promise.all(notificationPromises);
    return docRef.id;
  } catch (error) {
    console.error('Error adding calendar event:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (id: string, event: Partial<CalendarEvent>) => {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...event,
      updatedAt: serverTimestamp(),
    });

    // If the event was cancelled, notify attendees
    if (event.status === 'cancelled') {
      const notificationPromises = event.attendees?.map(attendeeId =>
        createSystemNotification(
          attendeeId,
          'Event Cancelled',
          `The event "${event.title}" has been cancelled`,
          'calendar',
          id
        )
      );

      if (notificationPromises) {
        await Promise.all(notificationPromises);
      }
    }
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Helper function to check for scheduling conflicts
export const checkScheduleConflicts = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeEventId?: string
) => {
  try {
    const events = await getCalendarEvents({
      userId,
      startDate,
      endDate
    });

    return events
      .filter(event => event.id !== excludeEventId)
      .filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return (
          (startDate >= eventStart && startDate < eventEnd) ||
          (endDate > eventStart && endDate <= eventEnd) ||
          (startDate <= eventStart && endDate >= eventEnd)
        );
      });
  } catch (error) {
    console.error('Error checking schedule conflicts:', error);
    throw error;
  }
};

// Helper function to send event reminders
export const sendEventReminders = async (event: CalendarEvent) => {
  try {
    const reminderTime = new Date(event.startDate.getTime() - (event.reminderMinutes * 60 * 1000));
    const now = new Date();

    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();
      setTimeout(async () => {
        const notificationPromises = event.attendees.map(attendeeId =>
          createSystemNotification(
            attendeeId,
            'Event Reminder',
            `Reminder: "${event.title}" starts in ${event.reminderMinutes} minutes`,
            'calendar',
            event.id,
            `/calendar/event/${event.id}`
          )
        );
        await Promise.all(notificationPromises);
      }, delay);
    }
  } catch (error) {
    console.error('Error sending event reminders:', error);
    throw error;
  }
};