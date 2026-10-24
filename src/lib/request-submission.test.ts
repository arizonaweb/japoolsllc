import { describe, expect, it } from 'vitest';
import { newSubmissionState, uploadRequestPhotos, type BackendClient } from './request-submission';

// 1x1 JPEG-ish payload; the content only needs to be a real, non-empty file.
const PHOTO = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD';
const details = { name: 'A', email: 'a@b.co', phone: '4800000000', address: '1 St 85031', serviceType: 'x', notes: '', smsConsent: true };
const photos = { equipment: PHOTO, pool: PHOTO, otherSide: PHOTO };

function fakeClient(opts: { failUploads?: Set<string>; failOnce?: boolean } = {}) {
  const files = new Map<string, File>();
  const registered = new Map<string, string>();
  const calls = { create: 0, upload: 0 };
  let failures = new Set(opts.failUploads ?? []);
  const client: BackendClient = {
    storage: {
      from: () => ({
        upload: async (path, file) => {
          calls.upload += 1;
          const slot = path.split('/')[1].split('-')[0];
          if (failures.has(slot)) {
            if (opts.failOnce) failures = new Set();
            return { error: { message: 'boom' } };
          }
          files.set(path, file);
          return { error: null };
        },
      }),
    },
    rpc: async (fn, args) => {
      if (fn === 'create_service_request') calls.create += 1;
      if (fn === 'register_request_photo') registered.set(args.p_slot as string, args.p_path as string);
      if (fn === 'verify_request_photos') {
        return { data: [...registered.entries()].filter(([, p]) => files.has(p)).map(([s]) => s).sort(), error: null };
      }
      return { data: null, error: null };
    },
  };
  return { client, files, registered, calls };
}

describe('uploadRequestPhotos', () => {
  it('uploads three real files under one request ID and verifies them', async () => {
    const { client, files, registered } = fakeClient();
    const state = newSubmissionState();
    const result = await uploadRequestPhotos(client, state, details, photos);
    expect(result.ok).toBe(true);
    expect(files.size).toBe(3);
    expect([...files.values()].every((f) => f instanceof File && f.size > 0 && f.type === 'image/jpeg')).toBe(true);
    expect(registered.size).toBe(3);
    expect([...files.keys()].every((p) => p.startsWith(`${state.requestId}/`))).toBe(true);
  });

  it('requires exactly three photos', async () => {
    const { client, calls } = fakeClient();
    const result = await uploadRequestPhotos(client, newSubmissionState(), details, { equipment: PHOTO, pool: PHOTO });
    expect(result.ok).toBe(false);
    expect(calls.upload).toBe(0);
    expect(await uploadRequestPhotos(client, newSubmissionState(), details, { ...photos, spa: PHOTO })).toMatchObject({ ok: false });
  });

  it('fails when an upload fails, then retries only the failed photo without duplicating the request', async () => {
    const { client, files, calls } = fakeClient({ failUploads: new Set(['pool']), failOnce: true });
    const state = newSubmissionState();
    const first = await uploadRequestPhotos(client, state, details, photos);
    expect(first).toMatchObject({ ok: false, failedSlots: ['pool'] });
    expect(files.size).toBe(2);
    const second = await uploadRequestPhotos(client, state, details, photos);
    expect(second.ok).toBe(true);
    expect(files.size).toBe(3);
    expect(calls.create).toBe(1);
    expect(calls.upload).toBe(4);
  });

  it('fails without a backend client', async () => {
    expect((await uploadRequestPhotos(null, newSubmissionState(), details, photos)).ok).toBe(false);
  });
});
