-- Seed data for Agentic Fox Labs ERP on Cloudflare D1

-- Organization
INSERT OR IGNORE INTO Organization (id, name, slug, industry, plan, maxProjects, maxUsers) VALUES
('org_agentic_fox', 'Agentic Fox Labs', 'agentic-fox-labs', 'Real Estate', 'pro', 20, 50);

-- Users
INSERT OR IGNORE INTO User (id, email, name, role, orgId) VALUES
('user_admin', 'admin@agenticfox.com', 'Rahul Sharma', 'org_admin', 'org_agentic_fox'),
('user_manager', 'priya@agenticfox.com', 'Priya Patel', 'manager', 'org_agentic_fox'),
('user_agent1', 'vikram@agenticfox.com', 'Vikram Singh', 'agent', 'org_agentic_fox'),
('user_agent2', 'anita@agenticfox.com', 'Anita Desai', 'agent', 'org_agentic_fox');

-- Projects
INSERT OR IGNORE INTO Project (id, name, slug, description, location, city, state, pincode, type, status, totalUnits, soldUnits, reraId, amenities, orgId) VALUES
('proj_skyline', 'Skyline Towers', 'skyline-towers', 'Premium high-rise residential towers with panoramic city views.', 'BKC, Mumbai', 'Mumbai', 'Maharashtra', '400051', 'Residential', 'Under Construction', 120, 45, 'P52000012345', '["Swimming Pool","Gym","Clubhouse","Garden","Parking","Security"]', 'org_agentic_fox'),
('proj_green_valley', 'Green Valley Villas', 'green-valley-villas', 'Luxury villa community surrounded by nature.', 'Hadapsar, Pune', 'Pune', 'Maharashtra', '411028', 'Residential', 'Pre-Launch', 60, 12, 'P52000067890', '["Private Garden","Clubhouse","Jogging Track","Tennis Court","SPA","Smart Home"]', 'org_agentic_fox'),
('proj_metro_hub', 'Metro Business Hub', 'metro-business-hub', 'State-of-the-art commercial complex.', 'Cyber City, Gurgaon', 'Gurgaon', 'Haryana', '122002', 'Commercial', 'Ready to Move', 80, 55, 'P52000011111', '["Conference Rooms","Food Court","Parking","24/7 Security","Power Backup","EV Charging"]', 'org_agentic_fox'),
('proj_sunset_park', 'Sunset Park Residences', 'sunset-park-residences', 'Affordable luxury apartments in Bangalore.', 'Whitefield, Bangalore', 'Bangalore', 'Karnataka', '560066', 'Residential', 'Under Construction', 200, 88, 'P52000022222', '["Pool","Gym","Kids Play Area","Co-working Space","Mini Theatre","Garden"]', 'org_agentic_fox');

-- Units for Skyline Towers
INSERT OR IGNORE INTO Unit (id, unitNumber, floor, wing, type, bhk, area, price, pricePerSqft, facing, status, projectId) VALUES
('unit_a101', 'A-101', 1, 'A', 'Apartment', 2, 950, 8500000, 8947, 'East', 'Sold', 'proj_skyline'),
('unit_a201', 'A-201', 2, 'A', 'Apartment', 2, 950, 8700000, 9158, 'East', 'Sold', 'proj_skyline'),
('unit_a301', 'A-301', 3, 'A', 'Apartment', 3, 1350, 12500000, 9259, 'East', 'Available', 'proj_skyline'),
('unit_a302', 'A-302', 3, 'A', 'Apartment', 3, 1350, 12500000, 9259, 'West', 'Available', 'proj_skyline'),
('unit_a401', 'A-401', 4, 'A', 'Apartment', 3, 1450, 13500000, 9310, 'North', 'Blocked', 'proj_skyline'),
('unit_b101', 'B-101', 1, 'B', 'Apartment', 2, 1000, 9000000, 9000, 'South', 'Available', 'proj_skyline'),
('unit_b201', 'B-201', 2, 'B', 'Apartment', 2, 1000, 9200000, 9200, 'South', 'Sold', 'proj_skyline'),
('unit_b301', 'B-301', 3, 'B', 'Apartment', 3, 1400, 13000000, 9286, 'East', 'Available', 'proj_skyline'),
('unit_b401', 'B-401', 4, 'B', 'Apartment', 3, 1400, 13200000, 9429, 'North', 'Reserved', 'proj_skyline'),
('unit_c101', 'C-101', 1, 'C', 'Apartment', 2, 950, 8400000, 8842, 'West', 'Available', 'proj_skyline');

-- Units for Green Valley Villas
INSERT OR IGNORE INTO Unit (id, unitNumber, type, bhk, area, price, pricePerSqft, facing, status, projectId) VALUES
('unit_v01', 'V-01', 'Villa', 3, 2500, 35000000, 14000, 'North', 'Sold', 'proj_green_valley'),
('unit_v02', 'V-02', 'Villa', 3, 2500, 35000000, 14000, 'East', 'Available', 'proj_green_valley'),
('unit_v03', 'V-03', 'Villa', 4, 3500, 52000000, 14857, 'North', 'Available', 'proj_green_valley'),
('unit_v04', 'V-04', 'Villa', 4, 3500, 52000000, 14857, 'South', 'Available', 'proj_green_valley'),
('unit_v05', 'V-05', 'Villa', 3, 2800, 39000000, 13929, 'West', 'Blocked', 'proj_green_valley');

-- Units for Metro Business Hub
INSERT OR IGNORE INTO Unit (id, unitNumber, floor, type, bhk, area, price, pricePerSqft, facing, status, projectId) VALUES
('unit_of101', 'OF-101', 1, 'Office', 0, 500, 7500000, 15000, 'East', 'Sold', 'proj_metro_hub'),
('unit_of102', 'OF-102', 1, 'Office', 0, 750, 10875000, 14500, 'West', 'Available', 'proj_metro_hub'),
('unit_of201', 'OF-201', 2, 'Office', 0, 1000, 14000000, 14000, 'North', 'Sold', 'proj_metro_hub'),
('unit_sh01', 'SH-01', 0, 'Shop', 0, 300, 6000000, 20000, 'South', 'Available', 'proj_metro_hub'),
('unit_sh02', 'SH-02', 0, 'Shop', 0, 400, 7600000, 19000, 'East', 'Sold', 'proj_metro_hub');

-- Brokers
INSERT OR IGNORE INTO Broker (id, name, phone, email, company, type, panNumber, commissionRate, orgId) VALUES
('broker_1', 'Sunil Kumar', '9876543210', 'sunil@realtors.com', 'SK Realtors', 'Agency', 'ABCDE1234F', 2.5, 'org_agentic_fox'),
('broker_2', 'Meera Joshi', '9876543211', 'meera@propadvisors.com', 'PropAdvisors', 'Agency', 'GHIJK5678L', 3.0, 'org_agentic_fox'),
('broker_3', 'Rajesh Nair', '9876543212', 'rajesh@gmail.com', NULL, 'Individual', 'MNOPQ9012R', 1.5, 'org_agentic_fox');

-- Customers
INSERT OR IGNORE INTO Customer (id, name, email, phone, city, type, panNumber, companyName, gstNumber, assignedToId, orgId) VALUES
('cust_1', 'Amit Verma', 'amit@gmail.com', '9988776655', 'Mumbai', 'Individual', 'AAAPV1234A', NULL, NULL, 'user_agent1', 'org_agentic_fox'),
('cust_2', 'Sneha Kapoor', 'sneha@outlook.com', '9988776656', 'Pune', 'Individual', 'BBBPK5678B', NULL, NULL, 'user_agent2', 'org_agentic_fox'),
('cust_3', 'TechCorp Solutions Pvt Ltd', 'info@techcorp.in', '9988776657', 'Gurgaon', 'Corporate', NULL, 'TechCorp Solutions Pvt Ltd', '06AABCT1234F1Z5', 'user_manager', 'org_agentic_fox'),
('cust_4', 'Deepak Reddy', 'deepak@yahoo.com', '9988776658', 'Bangalore', 'Individual', NULL, NULL, NULL, 'user_agent1', 'org_agentic_fox');

-- Leads
INSERT OR IGNORE INTO Lead (id, name, phone, email, source, status, priority, budgetMin, budgetMax, interestedIn, assignedToId, aiScore, orgId) VALUES
('lead_1', 'Ravi Malhotra', '9812345001', 'ravi.m@gmail.com', 'Website', 'New', 'Hot', 8000000, 15000000, 'Skyline Towers', 'user_agent1', 87, 'org_agentic_fox'),
('lead_2', 'Pooja Iyer', '9812345002', 'pooja.i@outlook.com', 'Social Media', 'Contacted', 'Warm', 30000000, 50000000, 'Green Valley Villas', 'user_agent2', 72, 'org_agentic_fox'),
('lead_3', 'Karan Thakur', '9812345003', 'karan.t@gmail.com', 'Referral', 'Qualified', 'Hot', 5000000, 10000000, 'Metro Business Hub', 'user_agent1', 91, 'org_agentic_fox'),
('lead_4', 'Nisha Agarwal', '9812345004', 'nisha.a@gmail.com', 'Walk-in', 'Site Visit', 'Hot', 8000000, 13000000, 'Skyline Towers', 'user_agent2', 95, 'org_agentic_fox'),
('lead_5', 'Suresh Menon', '9812345005', 'suresh.m@gmail.com', 'Broker', 'Negotiation', 'Hot', 12000000, 18000000, 'Skyline Towers', 'user_agent1', 88, 'org_agentic_fox'),
('lead_6', 'Lakshmi Raman', '9812345006', 'lakshmi.r@gmail.com', 'Advertisement', 'Contacted', 'Warm', 6000000, 9000000, 'Sunset Park Residences', 'user_agent2', 65, 'org_agentic_fox'),
('lead_7', 'Arjun Das', '9812345007', 'arjun.d@gmail.com', 'Website', 'New', 'Cold', 3000000, 5000000, 'Sunset Park Residences', 'user_agent1', 32, 'org_agentic_fox'),
('lead_8', 'Divya Sharma', '9812345008', 'divya.s@gmail.com', 'Social Media', 'Qualified', 'Medium', 10000000, 20000000, 'Green Valley Villas', 'user_agent2', 68, 'org_agentic_fox'),
('lead_9', 'Manish Gupta', '9812345009', 'manish.g@techcorp.in', 'Referral', 'Site Visit', 'Hot', 5000000, 8000000, 'Metro Business Hub', 'user_manager', 79, 'org_agentic_fox'),
('lead_10', 'Swati Pandey', '9812345010', 'swati.p@gmail.com', 'Walk-in', 'Lost', 'Cold', 4000000, 7000000, NULL, 'user_agent2', 15, 'org_agentic_fox');

-- Update lead customer references
UPDATE Lead SET customerId = 'cust_1' WHERE id = 'lead_5';
UPDATE Lead SET customerId = 'cust_3' WHERE id = 'lead_9';

-- Bookings
INSERT OR IGNORE INTO Booking (id, bookingNumber, status, bookingAmount, totalAmount, discount, gstAmount, agreementDate, customerId, unitId, brokerId, createdById, projectId, orgId) VALUES
('book_1', 'AFL-2024-001', 'Confirmed', 850000, 8500000, 200000, 153000, '2024-08-15', 'cust_1', 'unit_a101', 'broker_1', 'user_admin', 'proj_skyline', 'org_agentic_fox'),
('book_2', 'AFL-2024-002', 'Confirmed', 1050000, 35000000, 500000, 630000, '2024-09-20', 'cust_2', 'unit_v01', 'broker_2', 'user_manager', 'proj_green_valley', 'org_agentic_fox'),
('book_3', 'AFL-2024-003', 'Pending', 375000, 7500000, 0, 135000, NULL, 'cust_3', 'unit_of101', 'broker_3', 'user_admin', 'proj_metro_hub', 'org_agentic_fox'),
('book_4', 'AFL-2024-004', 'Confirmed', 1300000, 13000000, 300000, 234000, '2024-10-10', 'cust_4', 'unit_b301', NULL, 'user_agent1', 'proj_skyline', 'org_agentic_fox');

-- Payments
INSERT OR IGNORE INTO Payment (id, amount, paymentDate, paymentMode, status, milestone, customerId, bookingId, orgId) VALUES
('pay_1', 850000, '2024-08-15', 'Bank Transfer', 'Cleared', 'Booking Amount', 'cust_1', 'book_1', 'org_agentic_fox'),
('pay_2', 1700000, '2024-09-15', 'Bank Transfer', 'Cleared', 'Agreement', 'cust_1', 'book_1', 'org_agentic_fox'),
('pay_3', 850000, '2024-10-15', 'UPI', 'Pending', 'Slab 1 - Foundation', 'cust_1', 'book_1', 'org_agentic_fox'),
('pay_4', 1050000, '2024-09-20', 'Bank Transfer', 'Cleared', 'Booking Amount', 'cust_2', 'book_2', 'org_agentic_fox'),
('pay_5', 5250000, '2024-10-20', 'Cheque', 'Cleared', 'Agreement', 'cust_2', 'book_2', 'org_agentic_fox'),
('pay_6', 375000, '2024-11-01', 'Bank Transfer', 'Pending', 'Booking Amount', 'cust_3', 'book_3', 'org_agentic_fox'),
('pay_7', 1300000, '2024-10-10', 'Bank Transfer', 'Cleared', 'Booking Amount', 'cust_4', 'book_4', 'org_agentic_fox'),
('pay_8', 2600000, '2024-11-10', 'Online', 'Cleared', 'Agreement', 'cust_4', 'book_4', 'org_agentic_fox');

-- Commissions
INSERT OR IGNORE INTO Commission (id, amount, status, paidDate, brokerId, bookingId, orgId) VALUES
('comm_1', 212500, 'Paid', '2024-09-01', 'broker_1', 'book_1', 'org_agentic_fox'),
('comm_2', 1050000, 'Pending', NULL, 'broker_2', 'book_2', 'org_agentic_fox'),
('comm_3', 112500, 'Pending', NULL, 'broker_3', 'book_3', 'org_agentic_fox');

-- Site Visits
INSERT OR IGNORE INTO SiteVisit (id, scheduledAt, status, feedback, rating, travelMode, paxCount, leadId, projectId, assignedToId, orgId) VALUES
('visit_1', '2024-12-05T10:00:00', 'Scheduled', NULL, NULL, 'Company Cab', 3, 'lead_4', 'proj_skyline', 'user_agent2', 'org_agentic_fox'),
('visit_2', '2024-12-06T14:00:00', 'Scheduled', NULL, NULL, 'Own Vehicle', 2, 'lead_9', 'proj_metro_hub', 'user_manager', 'org_agentic_fox'),
('visit_3', '2024-11-20T11:00:00', 'Completed', 'Very interested, wants to negotiate price', 4, 'Own Vehicle', 4, 'lead_5', 'proj_skyline', 'user_agent1', 'org_agentic_fox'),
('visit_4', '2024-11-15T16:00:00', 'Completed', 'Looking for bigger unit, considering 3 BHK', 3, NULL, 2, 'lead_1', 'proj_skyline', 'user_agent1', 'org_agentic_fox');

-- Activities
INSERT OR IGNORE INTO Activity (id, type, title, detail, orgId) VALUES
('act_1', 'lead_created', 'New Lead: Ravi Malhotra', 'Lead from Website, interested in Skyline Towers', 'org_agentic_fox'),
('act_2', 'booking_confirmed', 'Booking Confirmed: Amit Verma', 'Unit A-101 at Skyline Towers - ₹85,00,000', 'org_agentic_fox'),
('act_3', 'payment_received', 'Payment Received: ₹17,00,000', 'From Amit Verma for Skyline Towers Agreement', 'org_agentic_fox'),
('act_4', 'visit_completed', 'Site Visit Completed', 'Suresh Menon visited Skyline Towers - Rating: 4/5', 'org_agentic_fox'),
('act_5', 'booking_confirmed', 'Booking Confirmed: Sneha Kapoor', 'Villa V-01 at Green Valley Villas - ₹3,50,00,000', 'org_agentic_fox'),
('act_6', 'lead_created', 'New Lead: Nisha Agarwal', 'Walk-in lead, interested in Skyline Towers', 'org_agentic_fox'),
('act_7', 'payment_received', 'Payment Received: ₹52,50,000', 'From Sneha Kapoor for Green Valley Agreement', 'org_agentic_fox'),
('act_8', 'commission_paid', 'Commission Paid: ₹2,12,500', 'To SK Realtors for Amit Verma booking', 'org_agentic_fox');

-- Notifications
INSERT OR IGNORE INTO Notification (id, title, message, type, orgId) VALUES
('notif_1', 'New Lead Alert', 'Hot lead Ravi Malhotra from Website - AI Score: 87', 'info', 'org_agentic_fox'),
('notif_2', 'Payment Pending', 'Booking amount pending for TechCorp Solutions booking', 'warning', 'org_agentic_fox'),
('notif_3', 'Booking Confirmed!', 'Sneha Kapoor booked Villa V-01 at Green Valley', 'success', 'org_agentic_fox'),
('notif_4', 'Follow-up Reminder', 'Follow up with Lakshmi Raman - last contacted 3 days ago', 'info', 'org_agentic_fox'),
('notif_5', 'Site Visit Tomorrow', 'Nisha Agarwal visit scheduled for tomorrow at 10:00 AM', 'info', 'org_agentic_fox');
