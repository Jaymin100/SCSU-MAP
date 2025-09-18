-- SCSU MAP Database Migration for Railway PostgreSQL
-- This script creates all the necessary tables for the SCSU MAP application

-- Enable UUID extension (Railway PostgreSQL supports this)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    lat DECIMAL(10, 8),
    long DECIMAL(11, 8),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    building_id INTEGER REFERENCES buildings(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table (class sessions)
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    days TEXT[] DEFAULT '{}', -- Array of days (e.g., ['Monday', 'Wednesday'])
    start_time TIME,
    end_time TIME,
    room VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_course_id ON meetings(course_id);
CREATE INDEX IF NOT EXISTS idx_buildings_code ON buildings(code);

-- Insert some sample building data for SCSU
INSERT INTO buildings (code, name, address, lat, long, description) VALUES
('AS', 'Adanti Student Center', '501 Crescent St, New Haven, CT 06515', 41.3083, -72.9281, 'Student center with dining, bookstore, and meeting rooms'),
('BU', 'Buley Library', '501 Crescent St, New Haven, CT 06515', 41.3085, -72.9285, 'Main campus library with study spaces'),
('EN', 'Engleman Hall', '501 Crescent St, New Haven, CT 06515', 41.3080, -72.9283, 'Academic building with classrooms'),
('FA', 'Faculty Hall', '501 Crescent St, New Haven, CT 06515', 41.3082, -72.9284, 'Faculty offices and meeting rooms'),
('GR', 'Granoff Hall', '501 Crescent St, New Haven, CT 06515', 41.3081, -72.9282, 'Academic building with labs and classrooms')
ON CONFLICT (code) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
