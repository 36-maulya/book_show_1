🎬 BookShow – Full Stack Movie Ticket Booking Platform

🚀 A modern, scalable MERN stack application for seamless movie ticket booking with real-time seat selection and admin management.

🔥 Live Demo
🌐 Frontend: https://book-show-1.vercel.app
⚙️ Backend API: https://book-show-backend-fanx.onrender.com
💻 Repository: https://github.com/36-maulya/book_show_1

🧠 Project Highlights
🎟️ Real-world ticket booking workflow
🪑 Interactive seat selection system
🔐 Secure authentication & authorization
📊 Admin dashboard for full control
⚡ Optimized frontend performance
🌍 Fully deployed using Vercel & Render

🏗️ System Architecture
Client (React)  --->  REST API (Node.js/Express)  --->  Database (MongoDB)
       │                         │                         │
       └────── Axios Calls ──────┴────── Mongoose ─────────┘
       
✨ Features

👤 User Side
🔐 Login / Signup with authentication
🎬 Browse latest movies
🔍 Search functionality
📄 Detailed movie pages
🪑 Dynamic seat selection UI
🎟️ Ticket booking system
📂 Booking history tracking

👨‍💼 Admin Panel

➕ Add / Update / Delete movies
🎭 Manage shows & timings
📊 Monitor bookings
⚙️ Tech Stack
Category	Technology
Frontend	React.js, Tailwind CSS
Backend	Node.js, Express.js
Database	MongoDB
Deployment	Vercel, Render

📁 Project Structure
book_show_1/
├── client/              # React Frontend
├── server/              # Node.js Backend
├── README.md

⚡ Getting Started
1. Clone Repo
git clone https://github.com/36-maulya/book_show_1.git
cd book_show_1

3. Install Dependencies

Frontend

cd client
npm install

Backend

cd server
npm install

3. Environment Setup

Create .env file inside server/

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000
4. Run Locally
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
📡 API Overview
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
GET	/api/movies	Get movies
POST	/api/bookings	Book tickets
📈 Why This Project Stands Out
💡 Solves a real-world problem (ticket booking)
🧩 Demonstrates full-stack development
🔄 Covers CRUD + authentication + UI logic
📦 Production-ready deployment
🎯 Strong portfolio project for placements
🚀 Future Enhancements
💳 Payment Integration (Stripe / Razorpay)
🎥 Movie trailers
⭐ Ratings & reviews
📱 Mobile responsiveness improvements
🔔 Notifications system
👨‍💻 Author

Maulya D S

GitHub: https://github.com/36-maulya
⭐ Support

If you found this useful, give it a ⭐ — it helps a lot!
