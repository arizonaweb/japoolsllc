# Pool Service Request - Temporary Photo Storage & Submission Implementation

## Overview

This implementation provides a robust solution for capturing, storing, and submitting pool service requests with multiple photos. Since the application is frontend-only (no backend), it uses **IndexedDB** for temporary persistent storage and provides multiple submission options for flexibility.

## Key Improvements

### 1. **Temporary Photo Storage with IndexedDB**
- **File:** `src/lib/photo-storage.ts`
- **Features:**
  - Stores photos in IndexedDB for persistence across page reloads
  - Automatic 24-hour expiration for privacy and storage management
  - Fallback to sessionStorage if IndexedDB unavailable
  - Supports clearing expired photos automatically

**Usage:**
```typescript
import { savePhotosToStorage, getPhotosFromStorage } from '@/lib/photo-storage';

// Save photos with session ID
await savePhotosToStorage(sessionId, { pool: 'data:image/jpeg;base64,...' });

// Retrieve photos
const photos = await getPhotosFromStorage(sessionId);
```

### 2. **Request Formatting & Utilities**
- **File:** `src/lib/pool-request-utils.ts`
- **Features:**
  - Format requests as plain text, HTML, or shareable links
  - Copy complete request to clipboard
  - Generate mailto/SMS/WhatsApp links
  - Download individual or all photos
  - Generate unique session IDs for storage

**Key Functions:**
```typescript
// Format request as text
formatRequestAsText(request): string

// Copy to clipboard
await copyRequestToClipboard(request): Promise<boolean>

// Generate submission links
generateMailtoLink(request, email): string
generateSMSLink(request, phone): string
generateWhatsAppLink(request, phone): string

// Download functionality
downloadImage(base64Data, filename): void
downloadAllImages(request): void
```

### 3. **Enhanced BookingModal Component**
- **File:** `src/components/hcb/BookingModal.tsx`
- **New Features:**
  - **Step 9: Submission Method Selection** - Users choose how to submit
  - Multiple submission options on desktop and mobile
  - Copy-to-clipboard functionality for manual submission
  - Direct photo download capability
  - Persistent storage of photos and form data

**Submission Options:**
1. **Email** - Opens email client with pre-filled request (users add photos manually)
2. **SMS/Text** - Opens messaging app with pre-filled request
3. **Copy to Clipboard** - Copies request text for pasting anywhere
4. **Download Photos** - Downloads all photos as separate files

### 4. **User Flow**

#### Mobile Users
1. Fill form (Steps 1-7)
2. Review submission (Step 8)
3. Choose submission method (Step 9)
   - SMS/MMS option sends via messaging app
   - Copy option for WhatsApp or other apps
   - Download photos to attach manually
4. Photos stored in IndexedDB during process
5. Photos automatically cleared on modal close

#### Desktop Users
1. Fill form (Steps 1-7)
2. Review submission (Step 8)
3. Choose submission method (Step 9)
   - Email opens email client
   - Copy option for manual submission
   - Download photos to attach
4. Photos stored in IndexedDB during process

## Technical Architecture

### Photo Storage Flow

```
1. User captures photo via camera
   ↓
2. Photo encoded as base64 (JPEG, 0.82 quality, max 1600px)
   ↓
3. Photo stored in component state
   ↓
4. On submission, photos saved to IndexedDB with session ID
   ↓
5. Photos expire after 24 hours or modal close
   ↓
6. IndexedDB cleared on logout/session end
```

### Submission Flow

```
1. User reviews complete request (Step 8)
   ↓
2. Clicks "Choose Delivery Method" button
   ↓
3. Request + photos saved to IndexedDB with unique session ID
   ↓
4. Redirected to Step 9 (method selection)
   ↓
5. User chooses method:
   - Email: Opens mailto link
   - SMS: Opens sms link
   - Copy: Copies to clipboard (success toast shows 3 sec)
   - Download: Downloads all photos
   ↓
6. User completes submission in chosen app
```

## Data Storage Details

### IndexedDB Schema
```
Database: "PoolServicePhotos"
Version: 1
Object Store: "photos"
  Key: sessionId (UUID)
  Data Structure:
  {
    sessionId: string (UUID v4)
    photos: {
      pool: string (data:image/jpeg;base64,...)
      spa: string (data:image/jpeg;base64,...)
      equipment: string (data:image/jpeg;base64,...)
    }
    timestamp: number (milliseconds)
    expiresAt: number (milliseconds, 24 hours from creation)
  }
```

### SessionStorage Metadata
```
Key: poolServiceRequest_${sessionId}
Value: {
  sessionId: string
  name: string
  email: string
  phone: string
  address: string
  serviceType: string
  notes: string
  smsConsent: boolean
  photoKeys: string[]
  timestamp: number
}
```

## Privacy & Security

✅ **Data Privacy:**
- All photos stored locally on user's device
- IndexedDB storage is domain-specific and isolated
- No data transmitted to external servers until user submits
- 24-hour automatic expiration for photos
- Session storage cleared on modal close

✅ **Image Handling:**
- Images captured directly from camera (no gallery uploads)
- Base64 encoding optimized for efficiency
- JPEG quality 0.82 balances file size and visual quality
- Maximum width 1600px to reduce bandwidth

✅ **No Backend Dependency:**
- Frontend-only solution (no server required)
- Photos never uploaded to external storage
- Complete control over submission method

## Browser Compatibility

- **IndexedDB:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **SessionStorage:** All modern browsers
- **Fallback:** SessionStorage used if IndexedDB unavailable
- **Copy to Clipboard:** Clipboard API with fallback for older browsers

## Future Enhancements

1. **Cloud Backup** - Optional Firebase/AWS S3 upload for photos
2. **Direct API** - Post photos directly to J&A Pools backend
3. **Compression** - Client-side image optimization before submission
4. **Annotations** - Allow drawing/markup on photos before submission
5. **Auto-Clear** - Clear old photos from IndexedDB automatically
6. **Retry Logic** - Improve failed submission handling
7. **Photo Gallery** - Preview all captured photos before submission
8. **Form Auto-Save** - Save form progress in localStorage

## Troubleshooting

### IndexedDB Not Available
- System falls back to sessionStorage automatically
- Photos still stored and retrievable during session
- Storage cleared on page reload

### Copy to Clipboard Not Working
- Modern Clipboard API requires HTTPS or localhost
- Fallback to older execCommand method for older browsers
- User can manually copy from modal if both fail

### Photos Not Persisting
- Check browser IndexedDB quota (usually 50MB+)
- Verify browser privacy settings allow IndexedDB
- Check sessionStorage as fallback

### Download Not Working
- Browser must allow downloads from the site
- Check download permissions in browser settings
- Try opening images in new tab instead

## Testing Checklist

- [ ] Photos capture correctly on mobile
- [ ] Photos capture correctly on desktop
- [ ] Photos display in preview before saving
- [ ] All 3 photos required before submission
- [ ] Photos persist when navigating back
- [ ] Request saved to IndexedDB with session ID
- [ ] Email submission opens email client
- [ ] SMS submission opens messaging app
- [ ] Copy to clipboard works and shows confirmation
- [ ] Photos download with correct names
- [ ] Modal close clears all data
- [ ] IndexedDB cleanup works for expired photos
- [ ] Form works without camera (graceful error)
- [ ] Storage fallback to sessionStorage works

## References

- **IndexedDB MDN:** https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Blob & Data URLs:** https://developer.mozilla.org/en-US/docs/Web/API/Blob
- **Canvas Image Capture:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
- **Clipboard API:** https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API

## Version

- **Version:** 2.0
- **Date:** October 2026
- **Status:** Production Ready
