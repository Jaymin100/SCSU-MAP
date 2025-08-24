const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express(); // This is what creates our expresss application 
const PORT = process.env.PORT || 3001; //sets the port we will run this on

// Middleware
app.use(cors()); // tells server too allow requests from other websites ie my app
app.use(express.json()); // this tells my server to understand json datat when it sends data check os ee what that means

// Database connection
const pool = new Pool({ 
  user: process.env.DB_USER ,
  host: process.env.DB_HOST ,
  database: process.env.DB_NAME ,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Simple auth middleware for JWT-protected routes
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('JWT auth error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}



// User registration endpoint
app.post('/api/register', async (req, res) => { // creating our post endpoint
  try {
    const { email, password, confirmPassword } = req.body; // grabs data from our frontend register modal

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if email is SCSU email
  if (!email.endsWith('@go.minnstate.edu')) {
      return res.status(400).json({ error: 'Please use your SCSU email address' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );


    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const {email,password} = req.body;
    
    if (!email || !password){
      return res.status(400).json({  error : 'all fields required'});
    }

    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (user.rows.length ===0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email
      },
      token
    });
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Buildings endpoint
app.get('/api/buildings', async (req, res) => {
  try {
    const buildings = await pool.query(
      'SELECT id, code, name, address, lat, long, description FROM buildings ORDER BY name'
    );

    // Convert coordinates to numbers and map to expected frontend names
    const processedBuildings = buildings.rows.map(building => ({
      id: building.id,
      name: building.name,
      building_code: building.code,            // Map code to building_code
      address: building.address,               // Include address field
      latitude: parseFloat(building.lat),      // Convert lat to latitude
      longitude: parseFloat(building.long),    // Convert long to longitude
      description: building.description
    }));

    res.json({
      buildings: processedBuildings
    });

  } catch (error) {
    console.error('Buildings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// Get the current user's schedule (single schedule per user)
app.get('/api/schedule', authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const coursesResult = await pool.query(
      `SELECT c.id, c.title, c.building_id, b.code AS building_code
       FROM courses c
       LEFT JOIN buildings b ON b.id = c.building_id
       WHERE c.user_id = $1
       ORDER BY c.id`,
      [userId]
    );
    const courseIds = coursesResult.rows.map(r => r.id);
    let meetingsByCourse = new Map();
    if (courseIds.length > 0) {
      const meetingsResult = await pool.query(
        `SELECT id, course_id, days, start_time, end_time, room
         FROM meetings
         WHERE course_id = ANY($1)
         ORDER BY course_id, id`,
        [courseIds]
      );
      meetingsByCourse = meetingsResult.rows.reduce((acc, m) => {
        const arr = acc.get(m.course_id) || [];
        arr.push({
          id: m.id,
          days: m.days || [],
          startTime: m.start_time ? m.start_time.toString().slice(0,5) : '',
          endTime: m.end_time ? m.end_time.toString().slice(0,5) : '',
          room: m.room || null
        });
        acc.set(m.course_id, arr);
        return acc;
      }, new Map());
    }

    const courses = coursesResult.rows.map(c => ({
      id: c.id,
      title: c.title,
      buildingId: c.building_id || null,
      buildingCode: c.building_code || null,
      meetings: meetingsByCourse.get(c.id) || []
    }));

    res.json({ courses });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Replace the current user's schedule with the provided one
app.post('/api/schedule', authenticateJWT, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.userId;
    const { courses } = req.body;
    if (!Array.isArray(courses)) {
      return res.status(400).json({ error: 'Invalid payload: courses must be an array' });
    }

    await client.query('BEGIN');
    // Delete existing schedule for user
    const userCourses = await client.query('SELECT id FROM courses WHERE user_id = $1', [userId]);
    const existingCourseIds = userCourses.rows.map(r => r.id);
    if (existingCourseIds.length > 0) {
      await client.query('DELETE FROM meetings WHERE course_id = ANY($1)', [existingCourseIds]);
      await client.query('DELETE FROM courses WHERE id = ANY($1)', [existingCourseIds]);
    }

    // Insert new schedule
    for (const course of courses) {
      const { title, buildingId, meetings } = course;
      if (!title || typeof title !== 'string') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Course title is required' });
      }

      const insertedCourse = await client.query(
        'INSERT INTO courses (user_id, title, building_id) VALUES ($1, $2, $3) RETURNING id',
        [userId, title, typeof buildingId === 'number' ? buildingId : null]
      );
      const courseId = insertedCourse.rows[0].id;

      if (Array.isArray(meetings)) {
        for (const m of meetings) {
          const days = Array.isArray(m.days) ? m.days : [];
          const startTime = typeof m.startTime === 'string' ? m.startTime : null;
          const endTime = typeof m.endTime === 'string' ? m.endTime : null;
          if (!startTime || !endTime) continue;
          await client.query(
            'INSERT INTO meetings (course_id, days, start_time, end_time, room) VALUES ($1, $2, $3, $4, $5)',
            [courseId, days, startTime, endTime, m.room || null]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Save schedule error:', error);
    res.status(500).json({ error: 'Failed to save schedule' });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
