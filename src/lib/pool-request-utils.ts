/**
 * Utilities for creating shareable temporary links and copying request data
 */

import { v4 as uuidv4 } from 'uuid';
import { savePhotosToStorage } from './photo-storage';

export interface PoolServiceRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  notes: string;
  smsConsent: boolean;
  photos: Record<string, string>; // base64 data URLs
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
  const { name, email, phone, address, serviceType, notes, smsConsent, photos } = request;

  return [
    'J & A Pools LLC — Pool Service Request',
    '',
    `Name: ${name.trim()}`,
    `Email: ${email.trim()}`,
    `Phone: ${phone.trim()}`,
    `Pool address: ${address.trim()}`,
    `Service plan: ${serviceType}`,
    `Notes / gate codes: ${notes.trim() || 'None'}`,
    `SMS consent: ${smsConsent ? 'Yes' : 'No'}`,
    '',
    'PHOTOS CAPTURED:',
    `• Pool photo: ${photos.pool ? 'Included ✓' : 'Not captured'}`,
    `• Spa / detail photo: ${photos.spa ? 'Included ✓' : 'Not captured'}`,
    `• Equipment pad photo: ${photos.equipment ? 'Included ✓' : 'Not captured'}`,
    '',
    'We will review your photos and contact you within 1 business day to confirm the service appointment.',
  ].join('\n');
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

    const photoLabels: Record<string, string> = {
      pool: 'Pool photo',
      spa: 'Spa / detail photo',
      equipment: 'Equipment pad photo',
    };

    (['pool', 'spa', 'equipment'] as const).forEach((key) => {
      if (request.photos[key]) {
        html += `<p style="font-family: Arial, sans-serif; color: #333; font-weight: bold;">
          ${photoLabels[key]}:
        </p>`;
        html += `<img src="${request.photos[key]}" 
          style="max-width: 100%; max-height: 300px; border: 1px solid #ddd; margin: 10px 0; display: block;" 
          alt="${photoLabels[key]}" />`;
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
  const body = encodeURIComponent(
    text +
      '\n\n' +
      `[Note: ${Object.values(request.photos).filter((p) => p).length} photos were captured. Please see attached files or respond to confirm receipt.]`
  );

  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
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
  const text = formatRequestAsText(request);
  const encodedMessage = encodeURIComponent(text);
  return `sms:${phoneNumber}?body=${encodedMessage}`;
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
  const photoLabels: Record<string, string> = {
    pool: 'pool-photo',
    spa: 'spa-detail-photo',
    equipment: 'equipment-pad-photo',
  };

  (['pool', 'spa', 'equipment'] as const).forEach((key) => {
    if (request.photos[key]) {
      downloadImage(request.photos[key], `${photoLabels[key]}.jpg`);
    }
  });
}
