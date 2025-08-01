require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); //Import jsonwebtoken
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

//--- JWT Authentication Middleware ---
// This middleware will check if a valid token is present in the request header
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; //Get the token from "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.'}) //No token provided
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' }) //Token is invalid
    }
    req.user = user; // Attach user payload to the request object
    next(); // Proceed to the next middleware/route handler
  });
};

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

// User Login Route
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. Find the user by email
    const userResult = await pool.query(
      'SELECT user_id, username, email, password_hash, first_name, last_name, role FROM users WHERE email = $1;',
      [email]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); //User not found
    }

    // 2. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password Mismatch
    }

    // 3. Generate a JWT token
    const payload = {
      user : {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); //Token expires in 1 hour

    // 4. Send the token and basic user info back
    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get all users (now protected by authentication middleware)
// Only authenticated users can access this route
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    console.log('Accessed /api/users by user:', req.user); // Log who accessed it
    const result = await pool.query('SELECT user_id, username, email, first_name, last_name, role, created_at FROM users;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// --- Protected Route Example ---
// This route can only be accessed if a valid JWT is provided
app.get('/api/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'You accessed a protected route!',
    user: req.user // The user data from the token payload
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
