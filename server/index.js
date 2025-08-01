require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // For password hashing
const cors = require('cors'); // To allow frontend to make requests

const app = express();
const port = process.env.PORT || 5000; // Use port from .env or default to 5000

// Database connection pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Test database connection (keep this for confirmation)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Database connected successfully! Current time from DB:', result.rows[0].now);
  });
});
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors()); // Enable CORS for frontend communication

// --- API Routes ---

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from the Airbnb Clone Backend!');
});

// Register a new user
app.post('/api/users/register', async (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  // Basic validation
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, username, email, first_name, last_name, role, created_at;`,
      [username, email, passwordHash, firstName, lastName, role || 'guest'] // Default role to 'guest'
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === '23505') { // PostgreSQL unique violation error code
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Get all users (for testing purposes, remove or restrict in production)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, username, email, first_name, last_name, role, created_at FROM users;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
