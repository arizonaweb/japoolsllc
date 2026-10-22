[README.md](https://github.com/user-attachments/files/33834292/README.md)
# J & A Pools LLC — Official Website & Service Booking Web App

A modern, responsive, high-performance website and service request application for **J & A Pools LLC**, a Better Business Bureau (BBB) A+ Accredited swimming pool service company based in Phoenix, Arizona.

## Business Profile
- **Business Name**: J & A Pools LLC
- **Owner**: Joe C. Campos
- **Phone / SMS**: 480-688-7254
- **Primary Location**: Phoenix, Arizona 85031
- **Service Area**: Phoenix and surrounding Valley areas
- **Accreditation**: Better Business Bureau (BBB) Accredited Business since 2023
- **BBB Rating**: A+
- **BBB Profile**: [BBB Business Profile for J & A Pools LLC](https://www.bbb.org/us/az/phoenix/profile/swimming-pools/j-a-pools-llc-1126-1000113314)
- **Ethical Community Profile**: [EthicalCommunity.org Profile](https://www.ethicalcommunity.org/jandapools)

## Core Services
1. **Pool Cleaning**: Skimming, vacuuming, and wall/tile brushing.
2. **Water Balancing**: Chemical testing and water sanitation.
3. **Filter & Pump Care**: Inspection, cleaning, and replacements.
4. **Equipment Upgrades & Automation**: Variable-speed pumps, filters, and smart automation.
5. **Pool Plumbing & Leak Repairs**: Suction/pressure leaks, check valves, and PVC repair.
6. **Green-to-Clean Recovery**: Multi-visit algae recovery and water restoration.
7. **Scheduled Maintenance Plans**: Weekly and bi-weekly residential and commercial pool service.

## Brand Assets & Visual Identity
- `Japools.png`: Official transparent PNG logo used in navigation and brand displays without a background badge.
- `ja_logo.jpg`: Alternate high-resolution JPEG logo.
- `service_overview_board.jpg`: Official service board displayed in Hero showcase, OpenGraph, and Twitter sharing cards.
- `cloud_reflection_pool.jpg`: Mirror-clear Arizona pool reflecting sky and clouds in Hero visual showcase.
- `team_cleaning_aqua.jpg`: Technician servicing a pool in the Hero showcase.
- `team_cleaning_wide.jpg`: Technician servicing a pool in the About section.
- `before_pool.jpg` and `after_pool.jpg`: Interactive comparison slider immediately after the Hero and service pillars.

## Color Adaptation (Beige & Green)
- **Desert ivory** (`#F7F4EE`) and **travertine** (`#EFECE4`) provide the light-mode foundation.
- **Grass green** (`#2E7D32`) is used for primary actions and brand accents; charcoal ink (`#1A1C19`) keeps text legible.
- Dark mode follows the device `prefers-color-scheme` setting and uses muted slate-green surfaces with warm white text.

## Scheduling
The Schedule Your Pool Service flow collects customer and property details, a service plan, three live camera captures, and optional notes/one-time SMS consent. Captures stay on the visitor's device; the browser opens an SMS draft on mobile or an email draft on desktop with the service details and photo references. The visitor reviews and sends the draft.

## Tech Stack
- **Framework**: React 18, TypeScript, Vite 5
- **Styling**: Tailwind CSS 3.4, PostCSS, Autoprefixer
- **UI Components**: Radix UI primitives, Lucide React icons, next-themes
- **Client Storage & Offline Support**: Progressive Web App (PWA) manifest and graceful fallback storage

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
