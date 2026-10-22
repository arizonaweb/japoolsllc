import { supabase } from '@/lib/supabase';
import type { ServiceId, TravelId } from '@/data/brand';

export interface BookingInput {
  name: string;
  phone: string;
  email: string;
  serviceId: ServiceId;
  serviceName: string;
  guests: number;
  addOns: { id: string; name: string; price: number }[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or ''
  travel: TravelId | null;
  location: string;
  notes: string;
  estimateMin: number;
  estimateMax: number;
  estimateLabel: string;
  summary: string;
}

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

/** Saves a pool service request. Falls back gracefully to localStorage if backend table is offline. */
export async function createBooking(b: BookingInput): Promise<string> {
  const id = uuid();
  const record = {
    id,
    source: 'booking',
    name: b.name.trim().slice(0, 200),
    phone: b.phone.trim().slice(0, 40),
    email: b.email.trim().toLowerCase().slice(0, 254),
    service_id: b.serviceId,
    service_name: b.serviceName,
    guests: b.guests,
    add_ons: b.addOns,
    preferred_date: b.date || null,
    preferred_time: b.time || null,
    travel: b.travel,
    location: b.location.trim().slice(0, 500) || null,
    notes: b.notes.trim().slice(0, 2000) || null,
    estimate_min: b.estimateMin,
    estimate_max: b.estimateMax,
    estimate_label: b.estimateLabel,
    sms_message: b.summary,
  };
  try {
    const { error } = await supabase.from('appointment_requests').insert(record);
    if (error) {
      const saved = JSON.parse(localStorage.getItem('ja-pools-bookings') || '[]');
      saved.unshift({ ...record, created_at: new Date().toISOString() });
      localStorage.setItem('ja-pools-bookings', JSON.stringify(saved));
    }
  } catch {
    try {
      const saved = JSON.parse(localStorage.getItem('ja-pools-bookings') || '[]');
      saved.unshift({ ...record, created_at: new Date().toISOString() });
      localStorage.setItem('ja-pools-bookings', JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }
  return id;
}

export async function sendBookingEmails(appointmentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('booking-notify', { body: { appointmentId } });
    if (error) return false;
    return !!(data?.ok || data?.alreadySent);
  } catch {
    return false;
  }
}

export async function subscribeContact(b: Pick<BookingInput, 'name' | 'email' | 'phone'>, smsOptIn: boolean) {
  try {
    void b;
    void smsOptIn;
  } catch {
    /* non-blocking */
  }
}
