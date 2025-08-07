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

// GET all properties (Publicly Accessible) - Place the general route first
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

// GET properties owned by the authenticated host (Protected - Host Only)
// This more specific route must come BEFORE the :id route
app.get('/api/properties/host', authenticateToken, authorizeRole(['host']), async (req, res) => {
    const hostId = req.user.user.id;
    try {
        const result = await pool.query(`
            SELECT
                property_id, title, city, country, price_per_night, images
            FROM properties
            WHERE host_id = $1
            ORDER BY created_at DESC;
        `, [hostId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching host properties:', error);
        res.status(500).json({ message: 'Server error fetching host properties.' });
    }
});

// GET a single property by ID (Publicly Accessible) - Place the general route last
app.get('/api/properties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT
                p.*,
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
        if (error.code === '22P02') {
            return res.status(400).json({ message: 'Invalid property ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching property.' });
    }
});

// PUT Update a Property Listing (Protected - Host Only, Owner Only)
app.put(
  '/api/properties/:id',
  authenticateToken, // Ensure user is logged in
  authorizeRole(['host']), // Ensure user has 'host' role
  upload.array('images', 10), // Multer middleware for images (optional, if images are updated)
  async (req, res) => {
    const { id } = req.params; // Property ID from URL
    const hostId = req.user.user.id; // Host ID from authenticated user

    const {
      title, description, address, city, state, zipCode, country,
      latitude, longitude, pricePerNight, numGuests, numBedrooms,
      numBeds, numBathrooms, propertyType, amenities, isAvailable
    } = req.body;

    try {
      // First, fetch the existing property to verify ownership
      const existingPropertyResult = await pool.query(
        'SELECT host_id, images, amenities FROM properties WHERE property_id = $1;',
        [id]
      );

      const existingProperty = existingPropertyResult.rows[0];
      if (!existingProperty) {
        return res.status(404).json({ message: 'Property not found.' });
      }

      // Check if the authenticated host is the owner of this property
      if (existingProperty.host_id !== hostId) {
        return res.status(403).json({ message: 'Access denied: You do not own this property.' });
      }

      let imageUrls = existingProperty.images; // Default to existing images

      // If new images are uploaded, replace existing ones with new Cloudinary URLs
      if (req.files && req.files.length > 0) {
        console.log(`New images received for property ID: ${id}. Uploading to Cloudinary.`);
        const uploadedImages = await uploadMultipleImages(req.files, 'airbnb-properties');
        imageUrls = uploadedImages.map(img => img.secure_url);
        // TODO: In a production app, you might want to delete old images from Cloudinary here
      } else {
         // If no new files, and frontend sent 'images' as a string JSON, parse it
         // This handles cases where frontend sends back existing image URLs as part of the form
        if (req.body.images && typeof req.body.images === 'string') {
            try {
                const parsedImages = JSON.parse(req.body.images);
                if (Array.isArray(parsedImages)) {
                    imageUrls = parsedImages;
                }
            } catch (parseError) {
                console.warn("Could not parse images field as JSON array from body, using existing images.", parseError);
                // Fallback: continue using existingProperty.images if parsing fails
            }
        }
      }

      // Convert amenities string (if provided) to array or use existing
      const amenitiesArray = (amenities !== undefined)
        ? amenities.split(',').map(item => item.trim())
        : existingProperty.amenities;

      // Construct the dynamic UPDATE query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      const addField = (field, value) => {
        if (value !== undefined && value !== '') { // Only add if value is provided and not an empty string
          updateFields.push(`${field} = $${paramIndex++}`);
          updateValues.push(value);
        }
      };

      // Use the helper to add fields only if they exist
      addField('title', title);
      addField('description', description);
      addField('address', address);
      addField('city', city);
      addField('state', state);
      addField('zip_code', zipCode);
      addField('country', country);
      addField('latitude', latitude ? parseFloat(latitude) : undefined);
      addField('longitude', longitude ? parseFloat(longitude) : undefined);
      addField('price_per_night', pricePerNight ? parseFloat(pricePerNight) : undefined);
      addField('num_guests', numGuests ? parseInt(numGuests) : undefined);
      addField('num_bedrooms', numBedrooms ? parseInt(numBedrooms) : undefined);
      addField('num_beds', numBeds ? parseInt(numBeds) : undefined);
      addField('num_bathrooms', numBathrooms ? parseFloat(numBathrooms) : undefined);
      addField('property_type', propertyType);
      addField('amenities', amenitiesArray);
      addField('images', imageUrls); // Always update images based on logic above
      addField('is_available', isAvailable); // For toggling availability

      // If no fields to update, return early
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
      }

      const query = `
        UPDATE properties
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE property_id = $${paramIndex++} AND host_id = $${paramIndex++}
        RETURNING *;
      `;

      updateValues.push(id, hostId); // Add WHERE clause values

      const result = await pool.query(query, updateValues);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Property not found or you do not own it.' });
      }

      res.status(200).json({
        message: 'Property updated successfully!',
        property: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating property:', error);
      if (error.code === '22P02') { // Invalid text representation (e.g., non-numeric for price)
        return res.status(400).json({ message: 'Invalid data format for numeric fields.' });
      }
      res.status(500).json({ message: 'Server error updating property.' });
    }
  }
);

// DELETE a Property Listing (Protected - Host Only, Owner Only)
app.delete(
  '/api/properties/:id',
  authenticateToken, // Ensure user is logged in
  authorizeRole(['host']), // Ensure user has 'host' role
  async (req, res) => {
    const { id } = req.params; // Property ID from URL
    const hostId = req.user.user.id; // Host ID from authenticated user

    try {
      // First, verify ownership and get image URLs for potential deletion from Cloudinary
      const propertyResult = await pool.query(
        'SELECT host_id, images FROM properties WHERE property_id = $1;',
        [id]
      );

      const property = propertyResult.rows[0];
      if (!property) {
        return res.status(404).json({ message: 'Property not found.' });
      }

      // Check if the authenticated host is the owner
      if (property.host_id !== hostId) {
        return res.status(403).json({ message: 'Access denied: You do not own this property.' });
      }

      // Delete the property from the database
      const deleteResult = await pool.query(
        'DELETE FROM properties WHERE property_id = $1 AND host_id = $2 RETURNING *;',
        [id, hostId]
      );

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ message: 'Property not found or could not be deleted.' });
      }

      res.status(200).json({ message: 'Property deleted successfully!', deletedProperty: deleteResult.rows[0] });

    } catch (error) {
      console.error('Error deleting property:', error);
      if (error.code === '22P02') {
        return res.status(400).json({ message: 'Invalid property ID format.' });
      }
      res.status(500).json({ message: 'Server error deleting property.' });
    }
  }
);

// POST Create a new booking (Protected - Guest Only)
app.post(
  '/api/bookings',
  authenticateToken, // Ensure user is logged in
  authorizeRole(['guest']), // Ensure user has 'guest' role
  async (req, res) => {
    const { propertyId, checkInDate, checkOutDate, totalGuests } = req.body;
    const guestId = req.user.user.id; // Get the guest's ID from the JWT payload

    // Basic input validation
    if (!propertyId || !checkInDate || !checkOutDate || !totalGuests) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    try {
      // Check if the property exists and get its price
      const propertyResult = await pool.query(
        'SELECT price_per_night FROM properties WHERE property_id = $1;',
        [propertyId]
      );
      const property = propertyResult.rows[0];
      if (!property) {
        return res.status(404).json({ message: 'Property not found.' });
      }

      // Check for date conflicts
      const conflictResult = await pool.query(
        `SELECT booking_id FROM bookings
         WHERE property_id = $1
           AND (
             (check_in_date, check_out_date) OVERLAPS ($2::date, $3::date)
           );`,
        [propertyId, checkInDate, checkOutDate]
      );

      if (conflictResult.rows.length > 0) {
        return res.status(409).json({ message: 'These dates are not available for booking.' });
      }

      // Calculate total price
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
      const numberOfNights = Math.round(Math.abs((checkOut - checkIn) / oneDay));
      const totalPrice = numberOfNights * parseFloat(property.price_per_night);

      // Create the booking
      const newBookingResult = await pool.query(
        `INSERT INTO bookings (guest_id, property_id, check_in_date, check_out_date, total_guests, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
        [guestId, propertyId, checkInDate, checkOutDate, totalGuests, totalPrice]
      );

      res.status(201).json({
        message: 'Booking created successfully!',
        booking: newBookingResult.rows[0]
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.code === '22007' || error.code === '22008') { // invalid_datetime_format
          return res.status(400).json({ message: 'Invalid date format provided.' });
      }
      res.status(500).json({ message: 'Server error creating booking.' });
    }
  }
);

// GET all bookings for the authenticated guest (Protected - Guest Only)
app.get('/api/bookings/guest', authenticateToken, authorizeRole(['guest']), async (req, res) => {
    const guestId = req.user.user.id;
    try {
        const result = await pool.query(`
            SELECT
                b.booking_id, b.check_in_date, b.check_out_date, b.total_guests, b.total_price, b.status,
                p.title AS property_title, p.city AS property_city, p.country AS property_country,
                p.images AS property_images, p.property_id,
                u.first_name AS host_first_name, u.last_name AS host_last_name
            FROM bookings b
            JOIN properties p ON b.property_id = p.property_id
            JOIN users u ON p.host_id = u.user_id
            WHERE b.guest_id = $1
            ORDER BY b.created_at DESC;
        `, [guestId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching guest bookings:', error);
        res.status(500).json({ message: 'Server error fetching your bookings.' });
    }
  }
);

// GET all bookings for the authenticated host (Protected - Host Only)
app.get('/api/bookings/host', authenticateToken, authorizeRole(['host']), async (req, res) => {
    const hostId = req.user.user.id;
    try {
        const result = await pool.query(`
            SELECT
                b.booking_id, b.check_in_date, b.check_out_date, b.total_guests, b.total_price, b.status,
                p.property_id, p.title AS property_title, p.city AS property_city, p.country AS property_country,
                p.images AS property_images,
                u.first_name AS guest_first_name, u.last_name AS guest_last_name, u.email AS guest_email
            FROM bookings b
            JOIN properties p ON b.property_id = p.property_id
            JOIN users u ON b.guest_id = u.user_id
            WHERE p.host_id = $1
            ORDER BY b.created_at DESC;
        `, [hostId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching host bookings:', error);
        res.status(500).json({ message: 'Server error fetching your bookings.' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});