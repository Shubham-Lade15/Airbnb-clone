require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const upload = require('./middleware/upload'); // Import multer upload middleware
const { uploadMultipleImages } = require('./utils/cloudinary'); // Import Cloudinary upload function

const app = express();
const port = process.env.PORT || 5000;

// Database connection pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Test database connection
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

// Middleware
app.use(express.json());
app.use(cors());

// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// --- Role-Based Authorization Middleware ---
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.user.role) { // req.user comes from authenticateToken
      return res.status(403).json({ message: 'Access denied: No role specified.' });
    }
    if (!roles.includes(req.user.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions.' });
    }
    next();
  };
};

// --- API Routes ---

// Root route
app.get('/', (req, res) => {
  res.send('Hello from the Airbnb Clone Backend!');
});

// Register a new user
app.post('/api/users/register', async (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All required fields are missing.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, username, email, first_name, last_name, role, created_at;`,
      [username, email, passwordHash, firstName, lastName, role || 'guest']
    );
    res.status(201).json({ message: 'User registered successfully!', user: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === '23505') {
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
    const userResult = await pool.query(
      'SELECT user_id, username, email, password_hash, first_name, last_name, role FROM users WHERE email = $1;',
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const payload = {
      user: { id: user.user_id, username: user.username, email: user.email, role: user.role }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.user_id, username: user.username, email: user.email,
        firstName: user.first_name, lastName: user.last_name, role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get all users (protected and logs who accessed it)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    console.log('Accessed /api/users by user:', req.user.user.username, ' (Role:', req.user.user.role + ')');
    const result = await pool.query('SELECT user_id, username, email, first_name, last_name, role, created_at FROM users;');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// Create New Property Listing (Protected - Host Only)
app.post(
  '/api/properties',
  authenticateToken, // Ensure user is logged in
  authorizeRole(['host']), // Ensure user has 'host' role
  upload.array('images', 10), // Use Multer for up to 10 images, field name 'images'
  async (req, res) => {
    const {
      title, description, address, city, state, zipCode, country,
      latitude, longitude, pricePerNight, numGuests, numBedrooms,
      numBeds, numBathrooms, propertyType, amenities
    } = req.body;

    const hostId = req.user.user.id; // Get host_id from authenticated user

    // Basic validation
    if (!title || !description || !address || !city || !state || !zipCode || !country ||
        !pricePerNight || !numGuests || !numBedrooms || !numBeds || !numBathrooms ||
        !propertyType || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'All required property details and at least one image are needed.' });
    }

    try {
      // Upload images to Cloudinary
      const uploadedImages = await uploadMultipleImages(req.files, 'airbnb-properties');
      const imageUrls = uploadedImages.map(img => img.secure_url);

      // Convert amenities string (if sent as comma-separated) to array
      const amenitiesArray = amenities ? amenities.split(',').map(item => item.trim()) : [];

      // Insert property into database
      const result = await pool.query(
        `INSERT INTO properties (
          host_id, title, description, address, city, state, zip_code, country,
          latitude, longitude, price_per_night, num_guests, num_bedrooms,
          num_beds, num_bathrooms, property_type, amenities, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *;`,
        [
          hostId, title, description, address, city, state, zipCode, country,
          latitude || null, longitude || null, parseFloat(pricePerNight),
          parseInt(numGuests), parseInt(numBedrooms), parseInt(numBeds),
          parseFloat(numBathrooms), propertyType, amenitiesArray, imageUrls
        ]
      );

      res.status(201).json({
        message: 'Property created successfully!',
        property: result.rows[0]
      });

    } catch (error) {
      console.error('Error creating property:', error);
      if (error.code === '22P02') { // Invalid text representation (e.g., non-numeric for price)
          return res.status(400).json({ message: 'Invalid data format for numeric fields.' });
      }
      res.status(500).json({ message: 'Server error creating property.' });
    }
  }
);

// GET all properties (Publicly Accessible)
app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
          p.property_id,
          p.title,
          p.description,
          p.city,
          p.state,
          p.country,
          p.price_per_night,
          p.num_guests,
          p.num_bedrooms,
          p.num_bathrooms,
          p.property_type,
          p.images,
          u.first_name AS host_first_name,
          u.last_name AS host_last_name
      FROM properties p
      JOIN users u ON p.host_id = u.user_id
      WHERE p.is_available = TRUE
      ORDER BY p.created_at DESC;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Server error fetching properties.' });
  }
});

// GET a single property by ID (Publicly Accessible)
app.get('/api/properties/:id', async (req, res) => {
  const { id } = req.params; // Get the property ID from URL parameters

  try {
    const result = await pool.query(`
      SELECT
          p.*, -- Select all columns from properties
          u.first_name AS host_first_name,
          u.last_name AS host_last_name,
          u.profile_picture_url AS host_profile_picture_url,
          u.bio AS host_bio
      FROM properties p
      JOIN users u ON p.host_id = u.user_id
      WHERE p.property_id = $1;
    `, [id]);

    const property = result.rows[0];

    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching single property:', error);
    // If the ID is not a valid UUID format, PostgreSQL will throw an error
    if (error.code === '22P02') { // invalid_text_representation
      return res.status(400).json({ message: 'Invalid property ID format.' });
    }
    res.status(500).json({ message: 'Server error fetching property.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});