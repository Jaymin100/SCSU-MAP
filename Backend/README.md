# SCSU MAP Backend

This is the backend server for the SCSU MAP application, handling user authentication and database operations.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up PostgreSQL Database
1. Install PostgreSQL on your system
2. Create a new database called `scsu_map`
3. Run the schema file to create tables:
   ```bash
   psql -d scsu_map -f schema.sql
   ```

### 3. Configure Environment Variables
1. Copy `env.example` to `.env`
2. Update the values in `.env` with your database credentials:
   ```
   DB_USER=your_postgres_username
   DB_HOST=localhost
   DB_NAME=scsu_map
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   JWT_SECRET=your-super-secret-jwt-key
   ```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST /api/register
Register a new user
- **Body**: `{ email, password, confirmPassword }`
- **Response**: `{ message, user, token }`

### POST /api/login
Login existing user
- **Body**: `{ email, password }`
- **Response**: `{ message, user, token }`

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP) 