/**
 * Utilities for creating shareable temporary links and copying request data
 */

import { v4 as uuidv4 } from 'uuid';
import { BRAND, isAppleMobile } from '@/data/brand';
import { savePhotosToStorage } from './photo-storage';

export interface PoolServiceRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  notes: string;
  smsConsent: boolean;
  hasSpa?: boolean;
  photos: Partial<Record<string, string>>;
}

const PHOTO_ORDER = ['equipment', 'pool', 'otherSide', 'spa'] as const;

const PHOTO_META: Record<string, { file: string; label: string }> = {
  equipment: { file: 'pump-system.jpg', label: 'Pump system' },
  pool: { file: 'pool.jpg', label: 'Pool' },
  otherSide: { file: 'pool-other-side.jpg', label: 'Other side of the pool' },
  spa: { file: 'spa.jpg', label: 'Spa' },
};

export function requestSendNote(): string {
  return `Just tap send to complete your request. If the number was not added to the recipient field, please copy and paste ${BRAND.phonePaste} into the recipient field.`;
}

function attachedPhotoKeys(photos: Partial<Record<string, string>>): string[] {
  return PHOTO_ORDER.filter((key) => photos[key]);
}

/**
 * Generate a unique session ID for storing photos temporarily
 */
export function generateSessionId(): string {
  return uuidv4();
}

/**
 * Create a formatted text request for copy/paste
 */
export function formatRequestAsText(request: PoolServiceRequest): string {
  const { name, email, phone, address, serviceType, notes, hasSpa, photos } = request;
  const photoLabels = attachedPhotoKeys(photos).map((key) => PHOTO_META[key]?.label ?? key);
  const lines = [
    'J & A Pools service request',
    '',
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Phone: ${phone.trim()}`,
    `Address: ${address.trim()}`,
    `Service: ${serviceType}`,
  ];
  if (hasSpa != null) lines.push(`Spa: ${hasSpa ? 'Yes' : 'No'}`);
  if (notes.trim()) lines.push(`Notes: ${notes.trim()}`);
  if (photoLabels.length) lines.push(`Photos: ${photoLabels.join(', ')}`);
  lines.push('', requestSendNote());
  return lines.join('\n');
}

/**
 * Create HTML formatted request with embedded images
 */
export function formatRequestAsHTML(request: PoolServiceRequest): string {
  const textContent = formatRequestAsText(request);
  let html = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    ${textContent.replace(/\n/g, '<br/>')}
  </div>`;

  // Add embedded images if present
  if (Object.values(request.photos).some((p) => p)) {
    html += '<br/><br/><hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;"/>';
    html += '<h3 style="font-family: Arial, sans-serif; color: #333;">Photos:</h3>';

    attachedPhotoKeys(request.photos).forEach((key) => {
      const label = PHOTO_META[key]?.label ?? key;
      if (request.photos[key]) {
        html += `<p style="font-family: Arial, sans-serif; color: #333; font-weight: bold;">
          ${label}:
        </p>`;
        html += `<img src="${request.photos[key]}" 
          style="max-width: 100%; max-height: 300px; border: 1px solid #ddd; margin: 10px 0; display: block;" 
          alt="${label}" />`;
      }
    });
  }

  return html;
}

/**
 * Copy request to clipboard (text format)
 */
export async function copyRequestToClipboard(request: PoolServiceRequest): Promise<boolean> {
  try {
    const text = formatRequestAsText(request);

    // Try to use the modern Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate a mailto link with request details
 * Note: Images will NOT be embedded in the email body by this method
 * but can be added as suggestions in the body text
 */
export function generateMailtoLink(
  request: PoolServiceRequest,
  recipientEmail: string
): string {
  const subject = encodeURIComponent('J & A Pools LLC Service Request');
  const text = formatRequestAsText(request);
  return `mailto:${recipientEmail}?subject=${subject}&body=${encodeURIComponent(text)}`;
}

/**
 * Generate a WhatsApp link with request details
 * Note: Images should be shared via the app's built-in share, not in the link
 */
export function generateWhatsAppLink(request: PoolServiceRequest, phoneNumber: string): string {
  const text = formatRequestAsText(request);
  const encodedMessage = encodeURIComponent(text);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Generate an SMS link with request details
 * Note: Images are not supported in SMS links; use MMS for images
 */
export function generateSMSLink(request: PoolServiceRequest, phoneNumber: string): string {
  const joiner = isAppleMobile() ? '&' : '?';
  return `sms:${phoneNumber}${joiner}body=${encodeURIComponent(formatRequestAsText(request))}`;
}

/**
 * Create a temporary download link for a single image
 */
export function createImageDownloadLink(
  base64Data: string,
  filename: string
): string {
  return base64Data; // Already a data URL
}

/**
 * Check if we can bundle photos for download using JSZip
 */
export function canBundlePhotosForDownload(): boolean {
  // Check if we have JSZip available
  return (window as Record<string, unknown>).JSZip !== undefined;
}

/**
 * Save request to temporary storage with photos
 * Returns the session ID for retrieval
 */
export async function saveRequestToTemporaryStorage(request: PoolServiceRequest): Promise<string> {
  const sessionId = generateSessionId();

  // Save photos separately in IndexedDB
  await savePhotosToStorage(sessionId, request.photos);

  // Store request metadata in sessionStorage for quick access
  const metadata = {
    sessionId,
    name: request.name,
    email: request.email,
    phone: request.phone,
    address: request.address,
    serviceType: request.serviceType,
    notes: request.notes,
    smsConsent: request.smsConsent,
    hasSpa: request.hasSpa,
    photoKeys: Object.keys(request.photos),
    timestamp: Date.now(),
  };

  sessionStorage.setItem(`poolServiceRequest_${sessionId}`, JSON.stringify(metadata));

  return sessionId;
}

/**
 * Download a single image from base64
 */
export function downloadImage(base64Data: string, filename: string): void {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download all images as a group
 */
export function downloadAllImages(request: PoolServiceRequest): void {
  attachedPhotoKeys(request.photos).forEach((key) => {
    const photo = request.photos[key];
    if (photo) downloadImage(photo, PHOTO_META[key]?.file ?? `${key}.jpg`);
  });
}

/**
 * Convert a base64 data URL into a real File that can be attached to a
 * native share (Messages, Mail, etc.).
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const commaIndex = dataUrl.indexOf(',');
  const header = commaIndex === -1 ? '' : dataUrl.slice(0, commaIndex);
  const data = commaIndex === -1 ? dataUrl : dataUrl.slice(commaIndex + 1);
  const mime = /data:(.*?)(;base64)?$/.exec(header)?.[1] || 'image/jpeg';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

/**
 * Compile every captured photo plus the request details into a single list
 * of File objects. The details are also embedded as a .txt file so the text
 * always travels with the photos, even in share targets that ignore the
 * share `text` field when files are present.
 */
export function buildRequestFiles(request: PoolServiceRequest): File[] {
  const files: File[] = [];
  attachedPhotoKeys(request.photos).forEach((key) => {
    const photo = request.photos[key];
    if (photo) files.push(dataUrlToFile(photo, PHOTO_META[key]?.file ?? `${key}.jpg`));
  });
  files.push(
    new File([formatRequestAsText(request)], 'j-and-a-pools-service-request.txt', {
      type: 'text/plain',
    }),
  );
  return files;
}

/**
 * True when this browser can hand real files to the native share sheet
 * (iOS Safari 15+, Android Chrome, desktop Chrome/Edge on supported OSes).
 */
export function canShareRequestFiles(files: File[]): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    files.length > 0 &&
    navigator.canShare({ files })
  );
}

export type ShareResult = 'shared' | 'cancelled' | 'unsupported';

/**
 * One-pass submit: attach all photos AND the request text to the device's
 * native share sheet in a single action. Picking Messages or Mail there
 * delivers images and text together — something sms:/mailto: links can't do.
 */
export async function shareRequestBundle(request: PoolServiceRequest): Promise<ShareResult> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported';
  }
  const files = buildRequestFiles(request);
  if (!canShareRequestFiles(files)) {
    return 'unsupported';
  }
  const text = formatRequestAsText(request);
  const withText: ShareData = { files, text, title: 'Pool service request' };
  const payload = navigator.canShare(withText) ? withText : { files, title: 'Pool service request' };
  try {
    await navigator.share(payload);
    return 'shared';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Single-file fallback for browsers without native file sharing: one
 * self-contained HTML packet with the full request text and every captured
 * photo embedded inline. Downloads automatically — no choices required.
 */
export function downloadRequestPacket(request: PoolServiceRequest): void {
  const photoSections = attachedPhotoKeys(request.photos)
    .map((key) => {
      const label = PHOTO_META[key]?.label ?? key;
      return `
        <h2 style="margin:24px 0 8px;font-size:16px;">${label}</h2>
        <img src="${request.photos[key]}" alt="${label}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;" />`;
    })
    .join('');

  const textBlock = escapeHtml(formatRequestAsText(request)).replace(/\n/g, '<br/>');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>J &amp; A Pools LLC Service Request — ${escapeHtml(request.name.trim())}</title>
</head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:720px;margin:24px auto;padding:0 16px;">
  <h1 style="font-size:22px;margin-bottom:16px;">J &amp; A Pools LLC — Pool Service Request</h1>
  <div>${textBlock}</div>
  <hr style="border:none;border-top:1px solid #ccc;margin:24px 0;" />
  ${photoSections}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'j-and-a-pools-service-request.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

/** Copy the shop number so the paste line in Messages works in one tap. */
export function copyRecipientNumber(): void {
  const value = BRAND.phonePaste;
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && window.isSecureContext) {
    void navigator.clipboard.writeText(value).catch(() => undefined);
    return;
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch {
    // The message still includes the number.
  }
}

export type DeliveryResult = ShareResult | 'sms' | 'packet';

/**
 * Hand the request to the device. File share attaches the photos in Messages.
 * Browsers cannot also set the SMS recipient in that same call, so the number
 * is copied and the message ends with paste instructions. When file share is
 * unavailable, an sms: link puts the number in the To field.
 */
export async function deliverRequest(request: PoolServiceRequest): Promise<DeliveryResult> {
  copyRecipientNumber();
  const shared = await shareRequestBundle(request);
  if (shared === 'shared' || shared === 'cancelled') return shared;

  const mobile = isMobileDevice();
  const smsUrl = generateSMSLink(request, BRAND.phoneE164);
  if (!mobile) {
    downloadRequestPacket(request);
    void copyRequestToClipboard(request);
    window.setTimeout(() => {
      window.location.href = smsUrl;
    }, 400);
    return 'packet';
  }
  if (typeof window !== 'undefined') window.location.href = smsUrl;
  return 'sms';
}
