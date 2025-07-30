
// To use this file, open your MongoDB shell (mongosh) and run the following command,
// making sure you are connected to the correct database.

// Note: The passwords are base64 encoded to match the hashing in the application.
// superadmin123 -> c3VwZXJhZG1pbjEyMw==
// admin123 -> YWRtaW4xMjM=
// resident123 -> cmVzaWRlbnQxMjM=
// security123 -> c2VjdXJpdHkxMjM=
// receptionist123 -> cmVjZXB0aW9uaXN0MTIz
// accountant123 -> YWNjb3VudGFudDEyMw==

// Clear existing data
db.users.deleteMany({});
db.announcements.deleteMany({});
db.complaints.deleteMany({});
db.maintenancebills.deleteMany({});
db.ledgerentries.deleteMany({});
db.visitors.deleteMany({});
db.sites.deleteMany({});

// --- Sites ---
const siteOneId = new ObjectId();
const siteTwoId = new ObjectId();

db.sites.insertMany([
    {
        "_id": siteOneId,
        "name": "Prestige Falcon City",
        "address": "Kanakapura Road, Bangalore",
        "totalBlocks": 10,
        "floorsPerBlock": 20,
        "unitsPerFloor": 8,
        "adminName": "Rajesh Kumar",
        "adminEmail": "admin@prestige.com",
        "subscription": {
            "tier": "active",
            "startDate": new Date("2023-01-01"),
            "endDate": new Date("2025-12-31"),
            "fee": 50000
        },
        "createdAt": new Date(),
        "updatedAt": new Date()
    },
    {
        "_id": siteTwoId,
        "name": "Sobha Dream Acres",
        "address": "Panathur Road, Bangalore",
        "totalBlocks": 15,
        "floorsPerBlock": 14,
        "unitsPerFloor": 6,
        "adminName": "Priya Sharma",
        "adminEmail": "admin@sobha.com",
        "subscription": {
            "tier": "trial",
            "startDate": new Date("2024-07-01"),
            "endDate": new Date("2024-09-30"),
            "fee": 0
        },
        "createdAt": new Date(),
        "updatedAt": new Date()
    }
]);


// --- Users ---
const superAdminUserId = new ObjectId();
const adminUserId = new ObjectId("669d5e94b0d7a4f433f5b748");
const residentUserId = new ObjectId("669d5e94b0d7a4f433f5b749");
const securityUserId = new ObjectId("669d5e94b0d7a4f433f5b74a");
const receptionistUserId = new ObjectId("669d5e94b0d7a4f433f5b74b");
const accountantUserId = new ObjectId("669d5e94b0d7a4f433f5b74c");
const anotherResidentId = new ObjectId("669d5e94b0d7a4f433f5b74d");

db.users.insertMany([
  {
    "_id": superAdminUserId,
    "name": "Super Admin",
    "email": "superadmin@society.com",
    "password": "c3VwZXJhZG1pbjEyMw==",
    "role": "superadmin",
    "phone": "1112223300",
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": adminUserId,
    "name": "Admin User",
    "email": "admin@society.com",
    "password": "YWRtaW4xMjM=",
    "role": "admin",
    "phone": "1112223330",
    "siteId": siteOneId.toString(),
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": residentUserId,
    "name": "John Resident",
    "email": "resident@society.com",
    "password": "cmVzaWRlbnQxMjM=",
    "role": "resident",
    "flatNumber": "A-101",
    "phone": "1112223331",
    "siteId": siteOneId.toString(),
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": securityUserId,
    "name": "Security Guard",
    "email": "security@society.com",
    "password": "c2VjdXJpdHkxMjM=",
    "role": "security",
    "phone": "1112223332",
    "siteId": siteOneId.toString(),
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": receptionistUserId,
    "name": "Receptionist",
    "email": "receptionist@society.com",
    "password": "cmVjZXB0aW9uaXN0MTIz",
    "role": "receptionist",
    "phone": "1112223333",
    "siteId": siteOneId.toString(),
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": accountantUserId,
    "name": "Accountant",
    "email": "accountant@society.com",
    "password": "YWNjb3VudGFudDEyMw==",
    "role": "accountant",
    "phone": "1112223334",
    "siteId": siteOneId.toString(),
    "createdAt": new Date(),
    "updatedAt": new Date()
  },
  {
    "_id": anotherResidentId,
    "name": "Jane Smith",
    "email": "jane.smith@society.com",
    "password": "cmVzaWRlbnQxMjM=",
    "role": "resident",
    "flatNumber": "B-205",
    "phone": "1112223335",
    "siteId": siteTwoId.toString(),
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
]);

// --- Announcements ---
db.announcements.insertMany([
    {
        "title": "Annual General Body Meeting",
        "content": "The Annual General Body Meeting will be held on August 15th, 2024 at 7:00 PM in the society clubhouse. All residents are requested to attend.",
        "category": "event",
        "targetRoles": ["resident", "admin"],
        "authorId": adminUserId.toString(),
        "isActive": true,
        "createdAt": new Date("2024-07-20T10:00:00Z"),
        "expiryDate": new Date("2024-08-15T19:00:00Z"),
        "siteId": siteOneId.toString()
    },
    {
        "title": "Urgent: Water Supply Disruption",
        "content": "Due to emergency pipeline repair work, the water supply will be suspended on July 25th from 10:00 AM to 4:00 PM. We regret the inconvenience caused.",
        "category": "maintenance",
        "targetRoles": ["resident"],
        "authorId": adminUserId.toString(),
        "isActive": true,
        "createdAt": new Date("2024-07-24T18:00:00Z"),
        "siteId": siteOneId.toString()
    },
    {
        "title": "Independence Day Celebration",
        "content": "Join us for the Independence Day flag hoisting ceremony on August 15th at 9:00 AM near the main gate, followed by breakfast.",
        "category": "event",
        "targetRoles": ["resident", "security", "receptionist", "accountant", "admin"],
        "authorId": adminUserId.toString(),
        "isActive": true,
        "createdAt": new Date("2024-07-22T11:00:00Z"),
        "siteId": siteTwoId.toString()
    }
]);


// --- Complaints ---
db.complaints.insertMany([
    {
        "title": "Water leakage in kitchen sink",
        "description": "There has been a constant drip from the kitchen sink for the past two days. It's causing water to pool on the floor.",
        "category": "plumbing",
        "priority": "high",
        "status": "in-progress",
        "residentId": residentUserId.toString(),
        "flatNumber": "A-101",
        "createdAt": new Date("2024-07-23T14:00:00Z"),
        "updatedAt": new Date("2024-07-24T09:00:00Z"),
        "siteId": siteOneId.toString()
    },
    {
        "title": "Stray dogs menace in Block C",
        "description": "A pack of stray dogs has been very aggressive near Block C, especially in the evening. It's a safety concern for children.",
        "category": "security",
        "priority": "urgent",
        "status": "open",
        "residentId": anotherResidentId.toString(),
        "flatNumber": "B-205",
        "createdAt": new Date("2024-07-24T11:30:00Z"),
        "updatedAt": new Date("2024-07-24T11:30:00Z"),
        "siteId": siteTwoId.toString()
    },
    {
        "title": "Corridor lights not working",
        "description": "The lights in the corridor of the 2nd floor, A-wing, are not working. It's completely dark at night.",
        "category": "electrical",
        "priority": "medium",
        "status": "resolved",
        "residentId": residentUserId.toString(),
        "flatNumber": "A-101",
        "createdAt": new Date("2024-07-20T20:00:00Z"),
        "updatedAt": new Date("2024-07-21T15:00:00Z"),
        "siteId": siteOneId.toString()
    }
]);

// --- Maintenance Bills ---
db.maintenancebills.insertMany([
    {
        "flatNumber": "A-101",
        "residentId": residentUserId.toString(),
        "amount": 2500,
        "month": "June",
        "year": 2024,
        "dueDate": new Date("2024-07-10T00:00:00Z"),
        "status": "paid",
        "paymentDate": new Date("2024-07-05T11:00:00Z"),
        "paymentId": "PAY123456",
        "paymentMethod": "upi",
        "createdAt": new Date("2024-07-01T00:00:00Z"),
        "siteId": siteOneId.toString()
    },
    {
        "flatNumber": "B-205",
        "residentId": anotherResidentId.toString(),
        "amount": 3000,
        "month": "June",
        "year": 2024,
        "dueDate": new Date("2024-07-10T00:00:00Z"),
        "status": "paid",
        "paymentDate": new Date("2024-07-08T16:30:00Z"),
        "paymentId": "PAY123457",
        "paymentMethod": "card",
        "createdAt": new Date("2024-07-01T00:00:00Z"),
        "siteId": siteTwoId.toString()
    },
    {
        "flatNumber": "A-101",
        "residentId": residentUserId.toString(),
        "amount": 2500,
        "month": "July",
        "year": 2024,
        "dueDate": new Date("2024-08-10T00:00:00Z"),
        "status": "pending",
        "createdAt": new Date("2024-08-01T00:00:00Z"),
        "siteId": siteOneId.toString()
    },
     {
        "flatNumber": "B-205",
        "residentId": anotherResidentId.toString(),
        "amount": 3000,
        "month": "July",
        "year": 2024,
        "dueDate": new Date("2024-08-10T00:00:00Z"),
        "status": "pending_confirmation",
        "paymentMethod": "cash",
        "createdAt": new Date("2024-08-01T00:00:00Z"),
        "siteId": siteTwoId.toString()
    }
]);

// --- Ledger Entries ---
db.ledgerentries.insertMany([
  { "date": new Date("2024-07-05"), "description": "Maintenance fees for June", "category": "maintenance_fee", "type": "credit", "amount": 150000, "siteId": siteOneId.toString() },
  { "date": new Date("2024-07-08"), "description": "Security staff salary", "category": "salaries", "type": "debit", "amount": 60000, "siteId": siteOneId.toString() },
  { "date": new Date("2024-07-10"), "description": "Electricity bill for common areas", "category": "utilities", "type": "debit", "amount": 22000, "siteId": siteOneId.toString() },
  { "date": new Date("2024-07-15"), "description": "Clubhouse booking income", "category": "facility_booking", "type": "credit", "amount": 5000, "siteId": siteOneId.toString() },
  { "date": new Date("2024-07-21"), "description": "Elevator repair work", "category": "repairs", "type": "debit", "amount": 12000, "siteId": siteOneId.toString() }
]);

// --- Visitors ---
db.visitors.insertMany([
    {
        "name": "Courier Delivery",
        "phone": "+91-9988776655",
        "purpose": "Delivery",
        "flatNumber": "A-101",
        "checkInTime": new Date("2024-07-24T14:00:00Z"),
        "securityId": securityUserId.toString(),
        "status": "checked-in",
        "vehicleNumber": "MH12AB3456",
        "siteId": siteOneId.toString()
    },
    {
        "name": "Alice Wonderland",
        "phone": "+91-9123456789",
        "purpose": "Guest",
        "flatNumber": "B-205",
        "checkInTime": new Date("2024-07-23T18:00:00Z"),
        "checkOutTime": new Date("2024-07-23T22:00:00Z"),
        "securityId": securityUserId.toString(),
        "status": "checked-out",
        "siteId": siteTwoId.toString()
    }
]);

// --- Verification Commands ---
// db.users.find().pretty();
// db.announcements.find().pretty();
// db.complaints.find().pretty();
// db.maintenancebills.find().pretty();
// db.ledgerentries.find().pretty();
// db.visitors.find().pretty();
// db.sites.find().pretty();
