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

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => (await fetch(dataUrl)).blob();

/**
 * Upload one captured photo as soon as it is taken.
 * Files are stored under `<requestId>/<photoKey>.jpg`, where requestId is the
 * submission timestamp reference that is also included in the SMS.
 */
export async function uploadRequestPhoto(requestId: string, photoKey: string, dataUrl: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const blob = await dataUrlToBlob(dataUrl);
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(`${requestId}/${photoKey}.jpg`, blob, { contentType: 'image/jpeg', upsert: true });
    return !error;
  } catch {
    return false;
  }
}

export async function removeRequestPhoto(requestId: string, photoKey: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.storage.from(PHOTO_BUCKET).remove([`${requestId}/${photoKey}.jpg`]);
  } catch {
    // best effort only
  }
}

/** Store the customer's details so staff can match them to photos and the SMS. */
export async function saveRequestDetails(requestId: string, details: BackendRequestDetails, photoKeys: string[]): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(REQUEST_TABLE).insert({
      request_id: requestId,
      name: details.name,
      email: details.email,
      phone: details.phone,
      address: details.address,
      service_type: details.serviceType,
      notes: details.notes,
      sms_consent: details.smsConsent,
      photo_paths: photoKeys.map((key) => `${requestId}/${key}.jpg`),
    });
    return !error;
  } catch {
    return false;
  }
}
