import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const PHOTO_BUCKET = 'service-request-photos';
export const REQUEST_TABLE = 'service_requests';

export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export interface BackendRequestDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  notes: string;
  smsConsent: boolean;
}
