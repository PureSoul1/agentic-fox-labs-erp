import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const orgId = 'org_agentic_fox'

    // Check if already seeded
    const existingOrg = await db.organization.findUnique({ where: { slug: 'agentic-fox-labs' } })
    if (existingOrg) {
      return NextResponse.json({ message: 'Already seeded', orgId: existingOrg.id })
    }

    // Create Organization
    const org = await db.organization.create({
      data: {
        id: orgId,
        name: 'Agentic Fox Labs',
        slug: 'agentic-fox-labs',
        industry: 'Real Estate',
        plan: 'pro',
        maxProjects: 20,
        maxUsers: 50,
      },
    })

    // Create Users
    const admin = await db.user.create({
      data: { id: 'user_admin', email: 'admin@agenticfox.com', name: 'Rahul Sharma', role: 'org_admin', orgId: org.id },
    })
    const manager = await db.user.create({
      data: { id: 'user_manager', email: 'priya@agenticfox.com', name: 'Priya Patel', role: 'manager', orgId: org.id },
    })
    const agent1 = await db.user.create({
      data: { id: 'user_agent1', email: 'vikram@agenticfox.com', name: 'Vikram Singh', role: 'agent', orgId: org.id },
    })
    const agent2 = await db.user.create({
      data: { id: 'user_agent2', email: 'anita@agenticfox.com', name: 'Anita Desai', role: 'agent', orgId: org.id },
    })

    // Create Projects
    const skyline = await db.project.create({
      data: {
        id: 'proj_skyline',
        name: 'Skyline Towers',
        slug: 'skyline-towers',
        description: 'Premium high-rise residential towers with panoramic city views. Features 3 towers with 2/3 BHK apartments.',
        location: 'BKC, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051',
        type: 'Residential',
        status: 'Under Construction',
        totalUnits: 120,
        soldUnits: 45,
        reraId: 'P52000012345',
        amenities: '["Swimming Pool", "Gym", "Clubhouse", "Garden", "Parking", "Security"]',
        orgId: org.id,
      },
    })

    const greenValley = await db.project.create({
      data: {
        id: 'proj_green_valley',
        name: 'Green Valley Villas',
        slug: 'green-valley-villas',
        description: 'Luxury villa community surrounded by nature. Spacious 3/4 BHK villas with private gardens.',
        location: 'Hadapsar, Pune',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411028',
        type: 'Residential',
        status: 'Pre-Launch',
        totalUnits: 60,
        soldUnits: 12,
        reraId: 'P52000067890',
        amenities: '["Private Garden", "Clubhouse", "Jogging Track", "Tennis Court", "SPA", "Smart Home"]',
        orgId: org.id,
      },
    })

    const metroHub = await db.project.create({
      data: {
        id: 'proj_metro_hub',
        name: 'Metro Business Hub',
        slug: 'metro-business-hub',
        description: 'State-of-the-art commercial complex for modern businesses. Office spaces and retail shops.',
        location: 'Cyber City, Gurgaon',
        city: 'Gurgaon',
        state: 'Haryana',
        pincode: '122002',
        type: 'Commercial',
        status: 'Ready to Move',
        totalUnits: 80,
        soldUnits: 55,
        reraId: 'P52000011111',
        amenities: '["Conference Rooms", "Food Court", "Parking", "24/7 Security", "Power Backup", "EV Charging"]',
        orgId: org.id,
      },
    })

    const sunsetPark = await db.project.create({
      data: {
        id: 'proj_sunset_park',
        name: 'Sunset Park Residences',
        slug: 'sunset-park-residences',
        description: 'Affordable luxury apartments in the heart of Bangalore. 1/2/3 BHK options with modern amenities.',
        location: 'Whitefield, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560066',
        type: 'Residential',
        status: 'Under Construction',
        totalUnits: 200,
        soldUnits: 88,
        reraId: 'P52000022222',
        amenities: '["Pool", "Gym", "Kids Play Area", "Co-working Space", "Mini Theatre", "Garden"]',
        orgId: org.id,
      },
    })

    // Create Units for Skyline Towers
    const unitData = [
      { unitNumber: 'A-101', floor: 1, wing: 'A', type: 'Apartment', bhk: 2, area: 950, price: 8500000, pricePerSqft: 8947, facing: 'East', status: 'Sold' },
      { unitNumber: 'A-201', floor: 2, wing: 'A', type: 'Apartment', bhk: 2, area: 950, price: 8700000, pricePerSqft: 9158, facing: 'East', status: 'Sold' },
      { unitNumber: 'A-301', floor: 3, wing: 'A', type: 'Apartment', bhk: 3, area: 1350, price: 12500000, pricePerSqft: 9259, facing: 'East', status: 'Available' },
      { unitNumber: 'A-302', floor: 3, wing: 'A', type: 'Apartment', bhk: 3, area: 1350, price: 12500000, pricePerSqft: 9259, facing: 'West', status: 'Available' },
      { unitNumber: 'A-401', floor: 4, wing: 'A', type: 'Apartment', bhk: 3, area: 1450, price: 13500000, pricePerSqft: 9310, facing: 'North', status: 'Blocked' },
      { unitNumber: 'B-101', floor: 1, wing: 'B', type: 'Apartment', bhk: 2, area: 1000, price: 9000000, pricePerSqft: 9000, facing: 'South', status: 'Available' },
      { unitNumber: 'B-201', floor: 2, wing: 'B', type: 'Apartment', bhk: 2, area: 1000, price: 9200000, pricePerSqft: 9200, facing: 'South', status: 'Sold' },
      { unitNumber: 'B-301', floor: 3, wing: 'B', type: 'Apartment', bhk: 3, area: 1400, price: 13000000, pricePerSqft: 9286, facing: 'East', status: 'Available' },
      { unitNumber: 'B-401', floor: 4, wing: 'B', type: 'Apartment', bhk: 3, area: 1400, price: 13200000, pricePerSqft: 9429, facing: 'North', status: 'Reserved' },
      { unitNumber: 'C-101', floor: 1, wing: 'C', type: 'Apartment', bhk: 2, area: 950, price: 8400000, pricePerSqft: 8842, facing: 'West', status: 'Available' },
    ]
    for (const u of unitData) {
      await db.unit.create({ data: { ...u, projectId: skyline.id } })
    }

    // Units for Green Valley
    const villaUnits = [
      { unitNumber: 'V-01', floor: 0, type: 'Villa', bhk: 3, area: 2500, price: 35000000, pricePerSqft: 14000, facing: 'North', status: 'Sold' },
      { unitNumber: 'V-02', floor: 0, type: 'Villa', bhk: 3, area: 2500, price: 35000000, pricePerSqft: 14000, facing: 'East', status: 'Available' },
      { unitNumber: 'V-03', floor: 0, type: 'Villa', bhk: 4, area: 3500, price: 52000000, pricePerSqft: 14857, facing: 'North', status: 'Available' },
      { unitNumber: 'V-04', floor: 0, type: 'Villa', bhk: 4, area: 3500, price: 52000000, pricePerSqft: 14857, facing: 'South', status: 'Available' },
      { unitNumber: 'V-05', floor: 0, type: 'Villa', bhk: 3, area: 2800, price: 39000000, pricePerSqft: 13929, facing: 'West', status: 'Blocked' },
    ]
    for (const u of villaUnits) {
      await db.unit.create({ data: { ...u, projectId: greenValley.id } })
    }

    // Units for Metro Business Hub
    const officeUnits = [
      { unitNumber: 'OF-101', floor: 1, type: 'Office', bhk: 0, area: 500, price: 7500000, pricePerSqft: 15000, facing: 'East', status: 'Sold' },
      { unitNumber: 'OF-102', floor: 1, type: 'Office', bhk: 0, area: 750, price: 10875000, pricePerSqft: 14500, facing: 'West', status: 'Available' },
      { unitNumber: 'OF-201', floor: 2, type: 'Office', bhk: 0, area: 1000, price: 14000000, pricePerSqft: 14000, facing: 'North', status: 'Sold' },
      { unitNumber: 'SH-01', floor: 0, type: 'Shop', bhk: 0, area: 300, price: 6000000, pricePerSqft: 20000, facing: 'South', status: 'Available' },
      { unitNumber: 'SH-02', floor: 0, type: 'Shop', bhk: 0, area: 400, price: 7600000, pricePerSqft: 19000, facing: 'East', status: 'Sold' },
    ]
    for (const u of officeUnits) {
      await db.unit.create({ data: { ...u, projectId: metroHub.id } })
    }

    // Brokers
    const broker1 = await db.broker.create({
      data: { id: 'broker_1', name: 'Sunil Kumar', phone: '9876543210', email: 'sunil@realtors.com', company: 'SK Realtors', type: 'Agency', panNumber: 'ABCDE1234F', commissionRate: 2.5, orgId: org.id },
    })
    const broker2 = await db.broker.create({
      data: { id: 'broker_2', name: 'Meera Joshi', phone: '9876543211', email: 'meera@propadvisors.com', company: 'PropAdvisors', type: 'Agency', panNumber: 'GHIJK5678L', commissionRate: 3.0, orgId: org.id },
    })
    const broker3 = await db.broker.create({
      data: { id: 'broker_3', name: 'Rajesh Nair', phone: '9876543212', email: 'rajesh@gmail.com', type: 'Individual', panNumber: 'MNOPQ9012R', commissionRate: 1.5, orgId: org.id },
    })

    // Customers
    const customer1 = await db.customer.create({
      data: { id: 'cust_1', name: 'Amit Verma', email: 'amit@gmail.com', phone: '9988776655', city: 'Mumbai', type: 'Individual', panNumber: 'AAAPV1234A', assignedToId: agent1.id, orgId: org.id },
    })
    const customer2 = await db.customer.create({
      data: { id: 'cust_2', name: 'Sneha Kapoor', email: 'sneha@outlook.com', phone: '9988776656', city: 'Pune', type: 'Individual', panNumber: 'BBBPK5678B', assignedToId: agent2.id, orgId: org.id },
    })
    const customer3 = await db.customer.create({
      data: { id: 'cust_3', name: 'TechCorp Solutions Pvt Ltd', email: 'info@techcorp.in', phone: '9988776657', city: 'Gurgaon', type: 'Corporate', companyName: 'TechCorp Solutions Pvt Ltd', gstNumber: '06AABCT1234F1Z5', assignedToId: manager.id, orgId: org.id },
    })
    const customer4 = await db.customer.create({
      data: { id: 'cust_4', name: 'Deepak Reddy', email: 'deepak@yahoo.com', phone: '9988776658', city: 'Bangalore', type: 'Individual', assignedToId: agent1.id, orgId: org.id },
    })

    // Leads
    const leads = [
      { name: 'Ravi Malhotra', phone: '9812345001', email: 'ravi.m@gmail.com', source: 'Website', status: 'New', priority: 'Hot', budgetMin: 8000000, budgetMax: 15000000, interestedIn: 'Skyline Towers', assignedToId: agent1.id, aiScore: 87, orgId: org.id },
      { name: 'Pooja Iyer', phone: '9812345002', email: 'pooja.i@outlook.com', source: 'Social Media', status: 'Contacted', priority: 'Warm', budgetMin: 30000000, budgetMax: 50000000, interestedIn: 'Green Valley Villas', assignedToId: agent2.id, aiScore: 72, orgId: org.id },
      { name: 'Karan Thakur', phone: '9812345003', email: 'karan.t@gmail.com', source: 'Referral', status: 'Qualified', priority: 'Hot', budgetMin: 5000000, budgetMax: 10000000, interestedIn: 'Metro Business Hub', assignedToId: agent1.id, aiScore: 91, orgId: org.id },
      { name: 'Nisha Agarwal', phone: '9812345004', email: 'nisha.a@gmail.com', source: 'Walk-in', status: 'Site Visit', priority: 'Hot', budgetMin: 8000000, budgetMax: 13000000, interestedIn: 'Skyline Towers', assignedToId: agent2.id, aiScore: 95, orgId: org.id },
      { name: 'Suresh Menon', phone: '9812345005', email: 'suresh.m@gmail.com', source: 'Broker', status: 'Negotiation', priority: 'Hot', budgetMin: 12000000, budgetMax: 18000000, interestedIn: 'Skyline Towers', customerId: customer1.id, assignedToId: agent1.id, aiScore: 88, orgId: org.id },
      { name: 'Lakshmi Raman', phone: '9812345006', email: 'lakshmi.r@gmail.com', source: 'Advertisement', status: 'Contacted', priority: 'Warm', budgetMin: 6000000, budgetMax: 9000000, interestedIn: 'Sunset Park Residences', assignedToId: agent2.id, aiScore: 65, orgId: org.id },
      { name: 'Arjun Das', phone: '9812345007', email: 'arjun.d@gmail.com', source: 'Website', status: 'New', priority: 'Cold', budgetMin: 3000000, budgetMax: 5000000, interestedIn: 'Sunset Park Residences', assignedToId: agent1.id, aiScore: 32, orgId: org.id },
      { name: 'Divya Sharma', phone: '9812345008', email: 'divya.s@gmail.com', source: 'Social Media', status: 'Qualified', priority: 'Medium', budgetMin: 10000000, budgetMax: 20000000, interestedIn: 'Green Valley Villas', assignedToId: agent2.id, aiScore: 68, orgId: org.id },
      { name: 'Manish Gupta', phone: '9812345009', email: 'manish.g@techcorp.in', source: 'Referral', status: 'Site Visit', priority: 'Hot', budgetMin: 5000000, budgetMax: 8000000, interestedIn: 'Metro Business Hub', customerId: customer3.id, assignedToId: manager.id, aiScore: 79, orgId: org.id },
      { name: 'Swati Pandey', phone: '9812345010', email: 'swati.p@gmail.com', source: 'Walk-in', status: 'Lost', priority: 'Cold', budgetMin: 4000000, budgetMax: 7000000, assignedToId: agent2.id, aiScore: 15, orgId: org.id },
    ]
    for (const lead of leads) {
      await db.lead.create({ data: lead })
    }

    // Bookings
    const booking1 = await db.booking.create({
      data: {
        id: 'book_1',
        bookingNumber: 'AFL-2024-001',
        status: 'Confirmed',
        bookingAmount: 850000,
        totalAmount: 8500000,
        discount: 200000,
        gstAmount: 153000,
        agreementDate: new Date('2024-08-15'),
        customerId: customer1.id,
        unitId: (await db.unit.findFirst({ where: { unitNumber: 'A-101', projectId: skyline.id } }))!.id,
        brokerId: broker1.id,
        createdById: admin.id,
        projectId: skyline.id,
        orgId: org.id,
      },
    })
    const booking2 = await db.booking.create({
      data: {
        id: 'book_2',
        bookingNumber: 'AFL-2024-002',
        status: 'Confirmed',
        bookingAmount: 1050000,
        totalAmount: 35000000,
        discount: 500000,
        gstAmount: 630000,
        agreementDate: new Date('2024-09-20'),
        customerId: customer2.id,
        unitId: (await db.unit.findFirst({ where: { unitNumber: 'V-01', projectId: greenValley.id } }))!.id,
        brokerId: broker2.id,
        createdById: manager.id,
        projectId: greenValley.id,
        orgId: org.id,
      },
    })
    const booking3 = await db.booking.create({
      data: {
        id: 'book_3',
        bookingNumber: 'AFL-2024-003',
        status: 'Pending',
        bookingAmount: 375000,
        totalAmount: 7500000,
        discount: 0,
        gstAmount: 135000,
        customerId: customer3.id,
        unitId: (await db.unit.findFirst({ where: { unitNumber: 'OF-101', projectId: metroHub.id } }))!.id,
        brokerId: broker3.id,
        createdById: admin.id,
        projectId: metroHub.id,
        orgId: org.id,
      },
    })
    const booking4 = await db.booking.create({
      data: {
        id: 'book_4',
        bookingNumber: 'AFL-2024-004',
        status: 'Confirmed',
        bookingAmount: 1300000,
        totalAmount: 13000000,
        discount: 300000,
        gstAmount: 234000,
        agreementDate: new Date('2024-10-10'),
        customerId: customer4.id,
        unitId: (await db.unit.findFirst({ where: { unitNumber: 'B-301', projectId: skyline.id } }))!.id,
        createdById: agent1.id,
        projectId: skyline.id,
        orgId: org.id,
      },
    })

    // Payments
    const payments = [
      { amount: 850000, paymentDate: new Date('2024-08-15'), paymentMode: 'Bank Transfer', status: 'Cleared', milestone: 'Booking Amount', bookingId: booking1.id, customerId: customer1.id, orgId: org.id },
      { amount: 1700000, paymentDate: new Date('2024-09-15'), paymentMode: 'Bank Transfer', status: 'Cleared', milestone: 'Agreement', bookingId: booking1.id, customerId: customer1.id, orgId: org.id },
      { amount: 850000, paymentDate: new Date('2024-10-15'), paymentMode: 'UPI', status: 'Pending', milestone: 'Slab 1 - Foundation', bookingId: booking1.id, customerId: customer1.id, orgId: org.id },
      { amount: 1050000, paymentDate: new Date('2024-09-20'), paymentMode: 'Bank Transfer', status: 'Cleared', milestone: 'Booking Amount', bookingId: booking2.id, customerId: customer2.id, orgId: org.id },
      { amount: 5250000, paymentDate: new Date('2024-10-20'), paymentMode: 'Cheque', status: 'Cleared', milestone: 'Agreement', bookingId: booking2.id, customerId: customer2.id, orgId: org.id },
      { amount: 375000, paymentDate: new Date('2024-11-01'), paymentMode: 'Bank Transfer', status: 'Pending', milestone: 'Booking Amount', bookingId: booking3.id, customerId: customer3.id, orgId: org.id },
      { amount: 1300000, paymentDate: new Date('2024-10-10'), paymentMode: 'Bank Transfer', status: 'Cleared', milestone: 'Booking Amount', bookingId: booking4.id, customerId: customer4.id, orgId: org.id },
      { amount: 2600000, paymentDate: new Date('2024-11-10'), paymentMode: 'Online', status: 'Cleared', milestone: 'Agreement', bookingId: booking4.id, customerId: customer4.id, orgId: org.id },
    ]
    for (const p of payments) {
      await db.payment.create({ data: p })
    }

    // Commissions
    await db.commission.create({ data: { amount: 212500, status: 'Paid', paidDate: new Date('2024-09-01'), brokerId: broker1.id, bookingId: booking1.id, orgId: org.id } })
    await db.commission.create({ data: { amount: 1050000, status: 'Pending', brokerId: broker2.id, bookingId: booking2.id, orgId: org.id } })
    await db.commission.create({ data: { amount: 112500, status: 'Pending', brokerId: broker3.id, bookingId: booking3.id, orgId: org.id } })

    // Site Visits
    await db.siteVisit.create({ data: { scheduledAt: new Date('2024-12-05T10:00:00'), status: 'Scheduled', leadId: (await db.lead.findFirst({ where: { name: 'Nisha Agarwal' } }))!.id, projectId: skyline.id, assignedToId: agent2.id, orgId: org.id, travelMode: 'Company Cab', paxCount: 3 } })
    await db.siteVisit.create({ data: { scheduledAt: new Date('2024-12-06T14:00:00'), status: 'Scheduled', leadId: (await db.lead.findFirst({ where: { name: 'Manish Gupta' } }))!.id, projectId: metroHub.id, assignedToId: manager.id, orgId: org.id, travelMode: 'Own Vehicle', paxCount: 2 } })
    await db.siteVisit.create({ data: { scheduledAt: new Date('2024-11-20T11:00:00'), completedAt: new Date('2024-11-20T13:00:00'), status: 'Completed', feedback: 'Very interested, wants to negotiate price', rating: 4, leadId: (await db.lead.findFirst({ where: { name: 'Suresh Menon' } }))!.id, projectId: skyline.id, assignedToId: agent1.id, orgId: org.id, travelMode: 'Own Vehicle', paxCount: 4 } })
    await db.siteVisit.create({ data: { scheduledAt: new Date('2024-11-15T16:00:00'), completedAt: new Date('2024-11-15T17:30:00'), status: 'Completed', feedback: 'Looking for bigger unit, considering 3 BHK', rating: 3, leadId: (await db.lead.findFirst({ where: { name: 'Ravi Malhotra' } }))!.id, projectId: skyline.id, assignedToId: agent1.id, orgId: org.id, paxCount: 2 } })

    // Activities
    const activities = [
      { type: 'lead_created', title: 'New Lead: Ravi Malhotra', detail: 'Lead from Website, interested in Skyline Towers', orgId: org.id },
      { type: 'booking_confirmed', title: 'Booking Confirmed: Amit Verma', detail: 'Unit A-101 at Skyline Towers - ₹85,00,000', orgId: org.id },
      { type: 'payment_received', title: 'Payment Received: ₹17,00,000', detail: 'From Amit Verma for Skyline Towers Agreement', orgId: org.id },
      { type: 'visit_completed', title: 'Site Visit Completed', detail: 'Suresh Menon visited Skyline Towers - Rating: 4/5', orgId: org.id },
      { type: 'booking_confirmed', title: 'Booking Confirmed: Sneha Kapoor', detail: 'Villa V-01 at Green Valley Villas - ₹3,50,00,000', orgId: org.id },
      { type: 'lead_created', title: 'New Lead: Nisha Agarwal', detail: 'Walk-in lead, interested in Skyline Towers', orgId: org.id },
      { type: 'payment_received', title: 'Payment Received: ₹52,50,000', detail: 'From Sneha Kapoor for Green Valley Agreement', orgId: org.id },
      { type: 'commission_paid', title: 'Commission Paid: ₹2,12,500', detail: 'To SK Realtors for Amit Verma booking', orgId: org.id },
    ]
    for (const a of activities) {
      await db.activity.create({ data: a })
    }

    // Notifications
    const notifications = [
      { title: 'New Lead Alert', message: 'Hot lead Ravi Malhotra from Website - AI Score: 87', type: 'info', orgId: org.id },
      { title: 'Payment Pending', message: 'Booking amount pending for TechCorp Solutions booking', type: 'warning', orgId: org.id },
      { title: 'Booking Confirmed!', message: 'Sneha Kapoor booked Villa V-01 at Green Valley', type: 'success', orgId: org.id },
      { title: 'Follow-up Reminder', message: 'Follow up with Lakshmi Raman - last contacted 3 days ago', type: 'info', orgId: org.id },
      { title: 'Site Visit Tomorrow', message: 'Nisha Agarwal visit scheduled for tomorrow at 10:00 AM', type: 'info', orgId: org.id },
    ]
    for (const n of notifications) {
      await db.notification.create({ data: n })
    }

    return NextResponse.json({ message: 'Seed data created successfully!', orgId: org.id })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
