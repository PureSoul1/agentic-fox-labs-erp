-- Agentic Fox Labs ERP - Cloudflare D1 Schema
-- Multi-tenant Real Estate Business Management

-- Organization
CREATE TABLE IF NOT EXISTS Organization (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  industry TEXT DEFAULT 'Real Estate',
  plan TEXT DEFAULT 'free',
  maxProjects INTEGER DEFAULT 5,
  maxUsers INTEGER DEFAULT 10,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- User
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'viewer',
  phone TEXT,
  isActive INTEGER DEFAULT 1,
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Project
CREATE TABLE IF NOT EXISTS Project (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  latitude REAL,
  longitude REAL,
  type TEXT DEFAULT 'Residential',
  status TEXT DEFAULT 'Pre-Launch',
  totalUnits INTEGER DEFAULT 0,
  soldUnits INTEGER DEFAULT 0,
  reraId TEXT,
  amenities TEXT,
  imageUrls TEXT,
  brochureUrl TEXT,
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  UNIQUE(orgId, slug)
);

-- Unit
CREATE TABLE IF NOT EXISTS Unit (
  id TEXT PRIMARY KEY,
  unitNumber TEXT NOT NULL,
  floor INTEGER DEFAULT 0,
  wing TEXT,
  type TEXT DEFAULT 'Apartment',
  bhk INTEGER DEFAULT 1,
  area REAL DEFAULT 0,
  areaUnit TEXT DEFAULT 'sqft',
  price REAL DEFAULT 0,
  pricePerSqft REAL DEFAULT 0,
  facing TEXT,
  status TEXT DEFAULT 'Available',
  possession TEXT,
  features TEXT,
  projectId TEXT NOT NULL REFERENCES Project(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  UNIQUE(projectId, unitNumber)
);

-- Lead
CREATE TABLE IF NOT EXISTS Lead (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  alternatePhone TEXT,
  source TEXT DEFAULT 'Website',
  status TEXT DEFAULT 'New',
  priority TEXT DEFAULT 'Medium',
  budget REAL,
  budgetMin REAL,
  budgetMax REAL,
  interestedIn TEXT,
  notes TEXT,
  aiScore REAL,
  aiInsights TEXT,
  lastContactedAt TEXT,
  nextFollowUp TEXT,
  orgId TEXT NOT NULL REFERENCES Organization(id),
  assignedToId TEXT REFERENCES User(id),
  customerId TEXT REFERENCES Customer(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Customer
CREATE TABLE IF NOT EXISTS Customer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  panNumber TEXT,
  aadhaarNumber TEXT,
  gstNumber TEXT,
  type TEXT DEFAULT 'Individual',
  companyName TEXT,
  orgId TEXT NOT NULL REFERENCES Organization(id),
  assignedToId TEXT REFERENCES User(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- SiteVisit
CREATE TABLE IF NOT EXISTS SiteVisit (
  id TEXT PRIMARY KEY,
  scheduledAt TEXT NOT NULL,
  completedAt TEXT,
  status TEXT DEFAULT 'Scheduled',
  feedback TEXT,
  rating INTEGER,
  travelMode TEXT,
  paxCount INTEGER DEFAULT 1,
  notes TEXT,
  leadId TEXT NOT NULL REFERENCES Lead(id),
  projectId TEXT NOT NULL REFERENCES Project(id),
  assignedToId TEXT NOT NULL REFERENCES User(id),
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Booking
CREATE TABLE IF NOT EXISTS Booking (
  id TEXT PRIMARY KEY,
  bookingNumber TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'Pending',
  bookingAmount REAL DEFAULT 0,
  agreementDate TEXT,
  possessionDate TEXT,
  discount REAL DEFAULT 0,
  gstAmount REAL DEFAULT 0,
  totalAmount REAL DEFAULT 0,
  notes TEXT,
  customerId TEXT NOT NULL REFERENCES Customer(id),
  unitId TEXT UNIQUE NOT NULL REFERENCES Unit(id),
  brokerId TEXT REFERENCES Broker(id),
  createdById TEXT NOT NULL REFERENCES User(id),
  projectId TEXT NOT NULL REFERENCES Project(id),
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Payment
CREATE TABLE IF NOT EXISTS Payment (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  paymentDate TEXT NOT NULL,
  paymentMode TEXT DEFAULT 'Bank Transfer',
  transactionRef TEXT,
  status TEXT DEFAULT 'Pending',
  milestone TEXT,
  dueDate TEXT,
  notes TEXT,
  receiptUrl TEXT,
  customerId TEXT NOT NULL REFERENCES Customer(id),
  bookingId TEXT NOT NULL REFERENCES Booking(id),
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Broker
CREATE TABLE IF NOT EXISTS Broker (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  type TEXT DEFAULT 'Individual',
  panNumber TEXT,
  gstNumber TEXT,
  bankAccount TEXT,
  ifscCode TEXT,
  bankName TEXT,
  commissionRate REAL DEFAULT 0,
  isActive INTEGER DEFAULT 1,
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Commission
CREATE TABLE IF NOT EXISTS Commission (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'Pending',
  paidDate TEXT,
  remarks TEXT,
  brokerId TEXT NOT NULL REFERENCES Broker(id),
  bookingId TEXT NOT NULL REFERENCES Booking(id),
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- Activity
CREATE TABLE IF NOT EXISTS Activity (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  leadId TEXT REFERENCES Lead(id),
  orgId TEXT NOT NULL REFERENCES Organization(id),
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Notification
CREATE TABLE IF NOT EXISTS Notification (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  isRead INTEGER DEFAULT 0,
  orgId TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_orgId ON User(orgId);
CREATE INDEX IF NOT EXISTS idx_project_orgId ON Project(orgId);
CREATE INDEX IF NOT EXISTS idx_unit_projectId ON Unit(projectId);
CREATE INDEX IF NOT EXISTS idx_lead_orgId ON Lead(orgId);
CREATE INDEX IF NOT EXISTS idx_lead_assignedToId ON Lead(assignedToId);
CREATE INDEX IF NOT EXISTS idx_customer_orgId ON Customer(orgId);
CREATE INDEX IF NOT EXISTS idx_booking_orgId ON Booking(orgId);
CREATE INDEX IF NOT EXISTS idx_booking_customerId ON Booking(customerId);
CREATE INDEX IF NOT EXISTS idx_payment_orgId ON Payment(orgId);
CREATE INDEX IF NOT EXISTS idx_payment_bookingId ON Payment(bookingId);
CREATE INDEX IF NOT EXISTS idx_broker_orgId ON Broker(orgId);
CREATE INDEX IF NOT EXISTS idx_sitevisit_orgId ON SiteVisit(orgId);
CREATE INDEX IF NOT EXISTS idx_sitevisit_leadId ON SiteVisit(leadId);
CREATE INDEX IF NOT EXISTS idx_activity_orgId ON Activity(orgId);
CREATE INDEX IF NOT EXISTS idx_notification_orgId ON Notification(orgId);
