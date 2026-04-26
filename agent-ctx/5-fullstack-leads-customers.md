---
Task ID: 5
Agent: Fullstack Developer - Leads & Customers Enhancement
Task: Enhance Leads and Customers views with real API data and CRUD operations

Work Log:
- Rewrote leads-view.tsx from hardcoded data to fully functional view with React Query
  - Fetches leads from /api/leads with useQuery
  - Loading skeleton while data loads
  - Filter/search functionality (by status, priority, source) with 4 filter controls
  - Create Lead dialog/form with fields: name, email, phone, source, priority, budgetMin, budgetMax, interestedIn, notes
  - Lead detail dialog showing full info with status update dropdown
  - Status update pipeline: New → Contacted → Qualified → Site Visit → Negotiation → Booked / Lost
  - AI score prominently color-coded (green ≥ 80, amber ≥ 60, red < 60) with colored dot indicator
  - Priority distribution stats cards at top (Hot, Warm, Medium, Cold counts from real data)
  - Follow-up Due section highlighting leads with nextFollowUp in the past
  - Framer-motion animations throughout
  - useMutation for create and status update, with query invalidation on success
  - Toast notifications via sonner

- Rewrote customers-view.tsx from hardcoded data to fully functional view with React Query
  - Fetches customers from /api/customers with useQuery
  - Loading skeleton while data loads
  - Search/filter functionality (text search + type filter)
  - Create Customer dialog/form with fields: name, email, phone, address, city, state, pincode, type, companyName, panNumber
  - Customer detail dialog that fetches from /api/customers/[id] with bookings and payments
  - Customer type badges (Individual vs Corporate) with distinct styling
  - Framer-motion animations throughout
  - useMutation for create with query invalidation on success
  - Toast notifications via sonner

- Updated /api/customers route.ts to add:
  - GET with search and type filter query parameters
  - PATCH endpoint for updating customers

- Created /api/customers/[id]/route.ts:
  - GET endpoint returning full customer detail with bookings, payments, and assigned user info

- All components use 'use client' directive
- All shadcn/ui Dialog, Select, Input, Badge components
- Orange (#F97316) as primary accent throughout
- Responsive design with mobile-first approach
- No lint errors introduced

Stage Summary:
- Leads view is fully functional with real API data, CRUD operations, filtering, AI score visualization, and follow-up tracking
- Customers view is fully functional with real API data, CRUD operations, search/filter, and detailed booking/payment display
- Both API routes enhanced with search/filter/PATCH support
- Customer detail endpoint added for booking/payment display
