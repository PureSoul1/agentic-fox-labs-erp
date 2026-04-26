---
Task ID: 4
Agent: Properties & Bookings Enhancer
Task: Enhance Properties and Bookings views with real API data and CRUD operations

Work Log:
- Created `/api/bookings/[id]/route.ts` with GET and PATCH endpoints for fetching and updating booking status (Confirmed, Cancelled) with automatic unit status updates and activity logging
- Rebuilt `properties-view.tsx` with full functionality:
  - React Query for fetching projects (`/api/projects`) and units (`/api/units`)
  - Tabs component switching between "Projects" and "Units" views
  - Project cards with real data including amenity badges, MapPin location, status badges, unit stats indicators
  - Click-to-navigate project detail view with:
    - Full project info (name, location, type, status, RERA, amenities)
    - Unit list/grid toggle with status color coding (Available=green, Sold=red, Blocked=amber, Reserved=blue)
    - Sales progress bar with animation
    - Revenue info (Revenue from Sales, Potential Revenue)
    - Unit filter by status (All, Available, Sold, Blocked, Reserved)
  - "Create Project" dialog with form fields (name, location, city, state, type, status, totalUnits, RERA, amenities, description)
  - Loading skeletons during data fetch
  - Search functionality for projects, units, and locations
  - Indian currency formatting (₹ Cr, ₹ L notation)
- Rebuilt `bookings-view.tsx` with full functionality:
  - React Query for fetching bookings (`/api/bookings`)
  - Loading skeletons while loading
  - "New Booking" dialog with: customer select, unit select (available units only), broker select, booking amount (auto-calculated from unit price), discount, notes
  - Booking details dialog with payment schedule, financial summary, payment progress bar
  - Booking status update (Confirm/Cancel) with unit status sync
  - Revenue stats at top (Confirmed count, Pending count, Confirmed Value, Pipeline Value)
  - Booking cards with customer info, unit, project, amount, broker info
  - Search functionality across bookings, customers, projects
  - Indian currency formatting
- All views use shadcn/ui components (Dialog, Select, Tabs, Badge, ScrollArea, Skeleton)
- Framer Motion animations throughout (staggered entrance, progress bar animations)
- Toast notifications via Sonner for all CRUD operations
- Orange accent (#F97316) consistent with app theme
- Responsive design for mobile and desktop
- 'use client' directive on all views

Stage Summary:
- Properties view: fully functional with real API data, project detail, unit management, create project
- Bookings view: fully functional with real API data, create booking, booking details with payments, status updates
- New API endpoint: PATCH /api/bookings/[id] for status updates
- Indian currency formatting throughout
- Complete CRUD operations integrated with existing API endpoints
