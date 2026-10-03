# Fuel Station Finder ⛽🚗

A full-stack, crowd-sourced fuel station finder web application built for drivers to locate nearby fuel stations, check and report current fuel prices, and monitor real-time station incident flags (such as fuel shortages, long queues, and closures).

---

## 🚀 Features

- **Interactive Map & Station Markers**:
  - Automatically requests and centers on driver's geolocation.
  - Color-coded price markers (Emerald = Cheap, Amber = Average, Rose = Higher price tier) relative to local station averages.
  - Interactive info windows displaying real-time prices for Petrol, Diesel, and Premium fuels, active issue badges, and quick actions.
  - Distinct pulsing marker indicating the driver's current position.
- **List View & Cards**:
  - High-readability cards highlighting primary fuel price per litre, distance in kilometers, relative update time, and incident badges.
  - Multi-fuel breakdown grid for each station.
- **Multi-Factor Filtering & Search**:
  - **Fuel Type**: All, Petrol (Unleaded), Diesel, Premium.
  - **Distance Radius**: Dynamic slider from 1 km to 50 km.
  - **Sort By**: Nearest distance, Cheapest price, or Recently updated.
  - **Instant Search**: Find stations by name or street address.
  - Real-time synchronization across both Map and List views.
- **Crowd-Sourced Price Reporting**:
  - Modal to submit latest prices for Petrol, Diesel, or Premium.
  - Instant live updates across all stations.
- **Incident Flagging with Noise-Reduction Threshold**:
  - Drivers can report: ⛽ No Fuel, ⏳ Long Queue, 🚫 Closed, or 🏷️ Wrong Price.
  - **6-Hour Noise Filter**: Flags only display as public badges when **2 or more drivers** report the same incident type within a 6-hour window.
- **Authentication**:
  - Firebase Authentication with Email/Password and Google Sign-In.
  - Persistent auth session with user avatar and dropdown menu.
  - Browsing map and prices is unrestricted; submitting price reports and flags requires driver sign-in.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Maps**: Google Maps JavaScript API via `@vis.gl/react-google-maps` / `@react-google-maps/api`
- **Backend & Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Icons**: Lucide React
- **Hosting**: Vercel / Cloud Run

---

## 🗄️ Firestore Database Schema

### Collection: `stations`
| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated document ID |
| `name` | string | Fuel station brand and branch name |
| `address` | string | Street address |
| `latitude` | number | Decimal latitude coordinate |
| `longitude` | number | Decimal longitude coordinate |
| `createdAt` | timestamp | Timestamp when station was registered |

### Collection: `priceReports`
| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated document ID |
| `stationId` | string | Reference to parent `stations` document ID |
| `fuelType` | string | `'petrol'` \| `'diesel'` \| `'premium'` |
| `price` | number | Price per litre |
| `reportedBy` | string | Driver user UID (`request.auth.uid`) |
| `reportedAt` | timestamp | Server timestamp of the submission |

> **Business Logic**: A station's current price per fuel type is dynamically computed by querying the most recent `priceReports` document for that `stationId` + `fuelType` (`orderBy('reportedAt', 'desc')`, `limit(1)`). Price data is never statically duplicated onto the station record.

### Collection: `flags`
| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated document ID |
| `stationId` | string | Reference to parent `stations` document ID |
| `type` | string | `'no_fuel'` \| `'long_queue'` \| `'closed'` \| `'wrong_price'` |
| `note` | string (optional) | Short optional description (up to 300 chars) |
| `flaggedBy` | string | Driver user UID (`request.auth.uid`) |
| `flaggedAt` | timestamp | Server timestamp of the submission |

> **Active Flag Rule**: An active flag is defined as any report from the last 6 hours (`flaggedAt >= now - 6h`). If the count of a specific flag type is **2 or more** within that window, a badge is rendered on the station card and map popup.

---

## ⚙️ Setup and Installation

### 1. Clone the repository
```bash
git clone git@github.com:Muhamadmust/Fuel-Station-Finder-New.git
cd Fuel-Station-Finder-New
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration keys:
```env
# Google Maps JavaScript API Key
VITE_GOOGLE_MAPS_API_KEY="AIzaSyYourGoogleMapsApiKey"

# Firebase Project Settings (Firebase Console > Project Overview > Project Settings > Web App)
VITE_FIREBASE_API_KEY="AIzaSyYourFirebaseApiKey"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
```

### 3.1 Google Maps Platform API Setup & Required APIs
To render interactive road and satellite tiles and place station markers, your Google Cloud project requires:
1. **Google Cloud Project & Billing**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Ensure an active billing account is attached to your project (required by Google Maps Platform to serve tiles).
2. **Enable Required APIs**:
   Under **APIs & Services > Library**, enable the following APIs:
   - **Maps JavaScript API** (*Mandatory*): Loads dynamic vector/raster map tiles, custom advanced markers, and info windows.
   - **Places API (New)** (*Recommended*): For address search and station details.
   - **Geocoding API** (*Recommended*): For converting addresses to geographical coordinates.
   - **Routes API** (*Recommended*): For calculating driving distances and routes.
3. **API Key Restrictions**:
   - Navigate to **APIs & Services > Credentials**.
   - Create or edit your API Key.
   - Under **API restrictions**, select "Restrict key" and choose **Maps JavaScript API** (and Places/Geocoding/Routes if enabled).
   - Under **Application restrictions**, select **Websites** and add your app's deployment domain(s) and `http://localhost:*` for local development.
4. Set the key in `.env`:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY="AIzaSy..."
   ```
   If the key is invalid, missing, or billing is not active, the app displays an on-screen diagnostic alert with exact guidance.


### 4. Deploy Firestore Security Rules
Deploy `firestore.rules` directly from your workspace using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Security & Access Control

- Read access to `stations`, `priceReports`, and `flags` is public, enabling drivers to quickly check prices and station status without needing an account.
- Write access (`create`) to `priceReports` and `flags` requires authentication (`request.auth != null`) and strictly enforces that `reportedBy` / `flaggedBy` matches the authenticated caller's `request.auth.uid`.
- Data bounds are validated (price between 0.01 and 100.0, valid fuel types, maximum string lengths, coordinate ranges).

---

## 🔮 Known Limitations & Future Enhancements

1. **Routing & Navigation**: Integrating turn-by-turn directions using Google Maps Routes API (`Route.computeRoutes`).
2. **Fuel Station Photos & Amenities**: Allowing drivers to tag amenities like EV fast chargers, car wash, air pump, and restroom availability.
3. **Driver Trust Scoring**: Rewarding frequent and accurate price reporters with community karma badges.
