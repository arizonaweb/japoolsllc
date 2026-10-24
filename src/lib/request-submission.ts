import { v4 as uuidv4 } from 'uuid';
import { dataUrlToFile } from '@/lib/pool-request-utils';
import { PHOTO_BUCKET } from '@/lib/supabase';

export const REQUIRED_PHOTO_COUNT = 3;
export const PHOTO_SLOTS = ['equipment', 'pool', 'otherSide', 'spa'] as const;

export type PhotoUploadStatus = 'idle' | 'uploading' | 'failed' | 'uploaded';
export type SmsStatus = 'not_opened' | 'composer_opened';

export interface SubmissionDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  notes: string;
  smsConsent: boolean;
}

/** The subset of the Supabase client used here, so it can be faked in tests. */
export interface BackendClient {
  storage: {
    from(bucket: string): {
      upload(path: string, file: File, options: { contentType: string; upsert: boolean }): PromiseLike<{ error: { message: string } | null }>;
    };
  };
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

export const newRequestId = (): string => uuidv4();

export interface SubmissionState {
  requestId: string;
  /** slot -> storage path of photos already uploaded and registered for this request */
  uploaded: Record<string, string>;
  detailsSaved: boolean;
}

export const newSubmissionState = (): SubmissionState => ({ requestId: newRequestId(), uploaded: {}, detailsSaved: false });

export type UploadOutcome =
  | { ok: true; slots: string[] }
  | { ok: false; error: string; failedSlots: string[] };

/**
 * Upload the three real photo files and confirm the backend has all three for this request.
 * Safe to call repeatedly: the request is created once (same ID), and slots that already uploaded are skipped.
 */
export async function uploadRequestPhotos(
  client: BackendClient | null,
  state: SubmissionState,
  details: SubmissionDetails,
  photos: Partial<Record<string, string>>,
  onSlot?: (slot: string, status: 'uploading' | 'uploaded' | 'failed') => void,
): Promise<UploadOutcome> {
  if (!client) return { ok: false, error: 'Photo upload is not available right now. Please call us.', failedSlots: [] };
  const slots = PHOTO_SLOTS.filter((slot) => photos[slot]);
  if (slots.length !== REQUIRED_PHOTO_COUNT) {
    return { ok: false, error: `Exactly ${REQUIRED_PHOTO_COUNT} photos are required.`, failedSlots: [] };
  }

  if (!state.detailsSaved) {
    const { error } = await client.rpc('create_service_request', {
      p_request_id: state.requestId,
      p_name: details.name,
      p_email: details.email,
      p_phone: details.phone,
      p_address: details.address,
      p_service_type: details.serviceType,
      p_notes: details.notes,
      p_sms_consent: details.smsConsent,
    });
    if (error) return { ok: false, error: 'Could not save your request. Check your connection and retry.', failedSlots: [] };
    state.detailsSaved = true;
  }

  const failedSlots: string[] = [];
  await Promise.all(
    slots
      .filter((slot) => !state.uploaded[slot])
      .map(async (slot) => {
        onSlot?.(slot, 'uploading');
        try {
          const file = dataUrlToFile(photos[slot] as string, `${slot}.jpg`);
          if (!file.size || !file.type.startsWith('image/')) throw new Error('empty photo');
          const path = `${state.requestId}/${slot}-${uuidv4()}.jpg`;
          const up = await client.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: 'image/jpeg', upsert: false });
          if (up.error) throw new Error(up.error.message);
          const reg = await client.rpc('register_request_photo', { p_request_id: state.requestId, p_slot: slot, p_path: path });
          if (reg.error) throw new Error(reg.error.message);
          state.uploaded[slot] = path;
          onSlot?.(slot, 'uploaded');
        } catch {
          failedSlots.push(slot);
          onSlot?.(slot, 'failed');
        }
      }),
  );
  if (failedSlots.length) {
    return { ok: false, error: `${failedSlots.length} photo upload(s) failed. Your photos are kept. Tap Retry.`, failedSlots };
  }

  const verified = await verifyRequestPhotos(client, state.requestId);
  const missing = slots.filter((slot) => !verified.includes(slot));
  if (verified.length !== REQUIRED_PHOTO_COUNT || missing.length) {
    // Force a re-upload of anything the backend could not confirm.
    missing.forEach((slot) => delete state.uploaded[slot]);
    return { ok: false, error: 'Could not confirm all 3 photos were saved. Tap Retry.', failedSlots: missing };
  }
  return { ok: true, slots: verified };
}

export async function verifyRequestPhotos(client: BackendClient, requestId: string): Promise<string[]> {
  const { data, error } = await client.rpc('verify_request_photos', { p_request_id: requestId });
  return !error && Array.isArray(data) ? (data as string[]) : [];
}

export async function markSmsComposerOpened(client: BackendClient | null, requestId: string): Promise<void> {
  if (!client) return;
  try {
    await client.rpc('mark_sms_composer_opened', { p_request_id: requestId });
  } catch {
    // Status bookkeeping only; the text message itself is unaffected.
  }
}

const SAVED_KEY = 'japools.activeRequest';

export interface SavedRequestState {
  requestId: string;
  photoStatus: PhotoUploadStatus;
  smsStatus: SmsStatus;
  photoSlots: string[];
}

export function saveRequestState(value: SavedRequestState): void {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

export function loadRequestState(): SavedRequestState | null {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const value = raw ? (JSON.parse(raw) as SavedRequestState) : null;
    return value && typeof value.requestId === 'string' ? value : null;
  } catch {
    return null;
  }
}

export function clearRequestState(): void {
  try {
    localStorage.removeItem(SAVED_KEY);
  } catch {
    // storage unavailable
  }
}
