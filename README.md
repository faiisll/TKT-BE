# Ticketing App - Backend Documentation

## Overview

Ticketing system backend API built with Node.js, Express, and Prisma ORM with MySQL database.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - ORM for database operations
- **MySQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Prisma client configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── ticketController.js  # Ticket CRUD operations
│   ├── middleware/
│   │   └── auth.js              # JWT verification & role-based access
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── tickets.js           # Ticket routes
│   ├── utils/
│   │   └── ticketNumber.js      # Generate ticket numbers
│   └── index.js                 # Express app entry point
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.js                  # Seed initial data
├── .env                         # Environment variables
└── package.json
```

## Database Schema

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key (auto-increment) |
| email | String | Unique email address |
| password | String | Hashed password |
| name | String | Full name |
| role | String | User role (Admin/Technician) |
| createdAt | DateTime | Account creation timestamp |

### Tickets Table
| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (UUID) |
| ticketNumber | String | Human-readable ticket ID (unique) |
| subject | String | Ticket subject/title |
| description | Text | Detailed description |
| status | String | Open, In Progress, Resolved, Closed |
| priority | String | Low, Medium, High |
| category | String | Ticket category |
| customerName | String | Customer's name |
| customerEmail | String | Customer's email |
| assignedTo | Int? | Assigned technician ID (nullable) |
| createdAt | DateTime | Ticket creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Ticket Updates Table
| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key (auto-increment) |
| ticketId | String | Foreign key to Tickets |
| message | Text | Update message/note |
| status | String? | New status (optional) |
| createdBy | Int | User ID who created update |
| createdAt | DateTime | Update creation timestamp |

## API Endpoints

### Public Endpoints (No Authentication)

#### Create Ticket
```http
POST /api/tickets
Content-Type: application/json

{
  "subject": "Login issue",
  "description": "I cannot login to my account",
  "category": "Technical Support",
  "priority": "High",
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

**Response:**
```json
{
  "id": "uuid",
  "ticketNumber": "TKT-2026-0001",
  "subject": "Login issue",
  "status": "Open",
  "priority": "High",
  "category": "Technical Support",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "createdAt": "2026-02-16T19:28:49.782Z",
  "assignedTo": null
}
```

#### Get Ticket by Number
```http
GET /api/tickets/ticket/:ticketNumber
```

**Response:**
```json
{
  "id": "uuid",
  "ticketNumber": "TKT-2026-0001",
  "subject": "Login issue",
  "description": "I cannot login to my account",
  "status": "In Progress",
  "priority": "High",
  "category": "Technical Support",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "createdAt": "2026-02-16T19:28:49.782Z",
  "updatedAt": "2026-02-16T19:35:00.000Z",
  "assignedTo": 2,
  "updates": [
    {
      "id": 1,
      "ticketId": "uuid",
      "message": "Assigned to technician",
      "status": "In Progress",
      "createdBy": 1,
      "createdAt": "2026-02-16T19:35:00.000Z"
    }
  ]
}
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ticketing.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@ticketing.com",
    "name": "Admin User",
    "role": "Admin"
  }
}
```

### Protected Endpoints (Requires JWT)

All protected endpoints require the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### List All Tickets
```http
GET /api/tickets?status=Open&priority=High&page=1&limit=20
```

**Query Parameters:**
- `status` (optional) - Filter by status
- `priority` (optional) - Filter by priority
- `category` (optional) - Filter by category
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "tickets": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### Get Ticket by ID
```http
GET /api/tickets/:id
```

#### Update Ticket
```http
PATCH /api/tickets/:id
Content-Type: application/json

{
  "status": "Resolved",
  "priority": "Low",
  "assignedTo": 2
}
```

#### Add Ticket Update
```http
POST /api/tickets/:id/updates
Content-Type: application/json

{
  "message": "Issue has been resolved",
  "status": "Resolved"
}
```

#### Get Ticket Updates
```http
GET /api/tickets/:id/updates
```

#### List Technicians
```http
GET /api/tickets/technicians
```

**Response:**
```json
[
  {
    "id": 2,
    "name": "John Technician",
    "email": "tech@ticketing.com"
  }
]
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/ticketing_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV="development"
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your database credentials
```

3. **Set up the database:**
```bash
# Create database in MySQL
mysql -u root -p
CREATE DATABASE ticketing_db;
EXIT;

# Run Prisma migrations
npx prisma migrate dev

# Seed initial admin user
npx prisma db seed
```

4. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## Default Users

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ticketing.com | admin123 |
| Technician | tech@ticketing.com | tech123 |

## Ticket Number Format

Tickets are automatically assigned numbers in the format: `TKT-YYYY-####`

Example: `TKT-2026-0001`

- **TKT** - Fixed prefix
- **2026** - Year
- **0001** - Sequential number (zero-padded)

## Error Responses

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Create Ticket
- `subject` - Required, min 1 character
- `description` - Required, min 1 character
- `category` - Required
- `customerName` - Required, min 1 character
- `customerEmail` - Required, valid email format
- `priority` - Optional (default: "Medium")

### Login
- `email` - Required, valid email format
- `password` - Required, min 1 character

## Security Features

- **Password Hashing** - All passwords are hashed using bcryptjs
- **JWT Authentication** - Token-based authentication for protected routes
- **Role-Based Access** - Admin and Technician roles for access control
- **Input Validation** - Request validation using express-validator
- **CORS** - Configured for cross-origin requests

## Development

### Available Scripts

```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npx prisma studio # Open Prisma Studio (database GUI)
npx prisma generate # Generate Prisma Client
npx prisma migrate dev # Create and run migrations
npx prisma db seed # Seed database
```

### Adding New Migrations

```bash
npx prisma migrate dev --name migration_name
```

### Resetting Database

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually
DROP DATABASE ticketing_db;
CREATE DATABASE ticketing_db;
npx prisma migrate dev
npx prisma db seed
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists
- Verify credentials are correct

### Port Already in Use
```bash
# Windows (PowerShell)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset Prisma
rm -rf node_modules/.prisma
npx prisma generate
```

## License

ISC
