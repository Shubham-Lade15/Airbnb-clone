Airbnb Clone
A full-stack web application that replicates the core functionality of a property rental and booking platform, built from scratch to demonstrate a wide range of full-stack development skills.
________________________________________
Key Features
•	User Authentication: Secure login, registration, and session management with JWTs for both guests and hosts.
•	Property Management: A complete C.R.U.D. (Create, Read, Update, Delete) system for hosts to manage their property listings.
•	Booking System: A robust booking engine that includes date validation to prevent reservation conflicts.
•	Reviews & Ratings: A system for guests to leave reviews on properties after a completed stay, with average ratings displayed on all listings.
•	Search & Filtering: A dynamic search bar that allows users to find properties based on location, dates, and guest count.
•	Image Uploads: Seamless integration with Cloudinary for handling property image uploads, storage, and retrieval.
•	Responsive UI: A modern and responsive user interface designed with Tailwind CSS.
________________________________________
Technologies Used
•	Frontend:
  o	React.js
  o	Tailwind CSS
  o	React Router
  o	Axios
•	Backend:
  o	Node.js
  o	Express.js
  o	PostgreSQL
  o	JWT (JSON Web Tokens)
  o	Multer & Cloudinary (for image handling)
  o	bcryptjs (for password hashing)
________________________________________
Getting Started
Follow these steps to set up and run the project locally.
Prerequisites
  •	Node.js (LTS version)
  •	npm (Node Package Manager)
  •	PostgreSQL
  •	Git
1. Clone the Repository
Bash
  git clone https://github.com/Shubham-Lade15/airbnb-clone.git
  cd airbnb-clone

3. Backend Setup
  1.	Navigate to the server directory.
  Bash
    cd server
  2.	Install backend dependencies.
  Bash
    npm install
  3.	Create a .env file in the server directory and add the following configuration, replacing the placeholder values with your own.
  Code snippet
    PORT=5000
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=Your_PostgreSQL_password # <<< IMPORTANT: Change this to your actual PostgreSQL password
    DB_DATABASE=airbnb_clone_db
    JWT_SECRET=XKUlmoVxeoI6i2F77M5WveUSacvYpKGw
    CLOUDINARY_CLOUD_NAME=difdoxfzz
    CLOUDINARY_API_KEY=469155117141558
    CLOUDINARY_API_SECRET=6ZPMB_44DoFUt3mjrPmbeMQ86NA
  4.	Set up your PostgreSQL database. Create a new database named airbnb_clone_db and run the SQL commands (available in the project history) to create the tables.
  5.	Start the backend server.
  Bash
    npm start

3. Frontend Setup
  1.	Navigate to the client directory.
  Bash
    cd ../client
  2.	Install frontend dependencies.
  Bash
    npm install
  3.	Create a .env file in the client directory and add the backend URL.
  Code snippet
    VITE_API_URL=http://localhost:5000/api
  4.	Start the frontend development server.
  Bash
    npm run dev
The application should now be running and accessible at http://localhost:5173.
