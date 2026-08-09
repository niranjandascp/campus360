# 🎓 Campus360 — Smart Digital Campus Platform

> *"Everything happening. Everything you need. One campus."*

Campus360 is a modern, student-centric digital campus platform designed to consolidate university services into a single, high-density SaaS dashboard. Built with **React 18**, **Vite**, **Tailwind CSS v4**, **Node.js**, **Express**, and **MongoDB**, Campus360 replaces fragmented campus communication with real-time room reservations, maintenance issue tracking, campus mapping, and event discovery.

---

## 🌟 Key Features

### 1. 🛠️ Campus Issue Tracker & Upvoting Engine
- **Report Maintenance Issues**: Students can file reports for broken classroom equipment, lab defects, or dorm repairs with attached photo proof.
- **Community Upvotes**: Upvoting mechanism allows students to prioritize urgent campus issues.
- **Resolution Timeline**: 4-stage tracking flow: `Reported` → `Acknowledged` → `In Progress` → `Resolved`.
- **Discussion Thread**: Real-time comment section for updates between students and facility administrators.

### 2. 🚪 Smart Room Finder & Instant Reservations
- **Interactive Search**: Search and filter study pods, lecture halls, and lab spaces by building, capacity, and available facilities (Wi-Fi 6, 4K Projector, AC, Whiteboards).
- **Real-Time Slot Availability**: Instant visibility into whether a room is `Available Now`, `Occupied`, or `Reserved`.
- **1-Click Student Booking**: Select date, start time, duration, purpose, and attendee count to generate a booking pass. Synchronized directly to the **My Bookings** manager.

### 3. 🗺️ Interactive Campus Map & Building Inspector
- **Campus Building Overview**: Visual cards for **Block A (Engineering)**, **Block B (Science & Humanities)**, **Central Library**, **Cafeteria**, **Sports Complex**, and **Main Seminar Hall**.
- **Building Detail Inspector**: Inspect available study rooms, active maintenance alerts, and facility equipment inside any specific building.

### 4. 📅 Campus Events Hub & RSVP System
- **Event Discovery**: Filter hackathons, cultural night concerts, and club workshops.
- **1-Click RSVP**: Track attending counts in real-time and bookmark upcoming events to your student profile.

### 5. ⚡ Live Infrastructure Status Monitor
- Live operational metrics monitoring campus core services: **Campus Wi-Fi (99.8% Uptime)**, **Water Supply**, **Sanitation**, **Cafeteria**, **Power Grid**, and **HVAC**.

### 6. 🎨 SaaS Design System & Light/Dark Theme
- **Deep Navy Sidebar (`#0A0B1C`)**: Persistent dark navy navigation sidebar for a professional SaaS feel.
- **Centralized CSS Tokens**: Semantic feature colors (Purple for Issues, Blue for Rooms, Green for Events, Orange for Map).
- **Instant Light/Dark Mode**: Smooth theme toggling with automatic user preference persistence.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 8 (Sub-500ms HMR execution)
- **Styling:** Tailwind CSS v4 & Centralized CSS Variables
- **Icons:** Lucide React Icons
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Uploads:** Multer for photo proof attachments

---

## 📁 Project Directory Structure

```
campus360/
├── Client/                      # React Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI & Section Components
│   │   │   ├── DashboardLayout.jsx         # Deep Navy Sidebar Shell & Top Header
│   │   │   ├── CampusMapSection.jsx        # Interactive Campus Map & Inspector
│   │   │   ├── IssueTrackerSection.jsx     # Upvoting Issue List & Detail Modal
│   │   │   ├── SmartRoomFinderSection.jsx  # Room Search, Filters & Booking Modal
│   │   │   ├── EventsSection.jsx           # Events Grid & 1-Click RSVP Modal
│   │   │   ├── CampusStatusSection.jsx     # Infrastructure Status Indicators
│   │   │   ├── CreateIssueModal.jsx        # Report Filing Form Modal
│   │   │   └── MyBookingsModal.jsx         # Active Reservation Manager
│   │   ├── pages/               # Main Page Views (Home, Login, Admin, Issues)
│   │   ├── services/            # Axios API Integration Services
│   │   ├── index.css            # Centralized CSS Tokens & Light/Dark Themes
│   │   └── App.jsx              # React Router Entry Point
│   └── package.json
├── Server/                      # Node.js Express REST Backend
│   ├── src/
│   │   ├── config/              # Database Connection (db.js)
│   │   ├── controllers/         # Auth, Issues, Events & Rooms Controllers
│   │   ├── models/              # Mongoose Schemas (User, Issue, Room, Event)
│   │   ├── routes/              # Express API Endpoint Routes
│   │   └── server.js            # Express App Server Entry
│   └── package.json
├── Campus360_Project_Documentation.md    # Official Competition Documentation
├── Campus360_Project_Documentation.html  # Printable PDF Documentation
└── README.md                    # Project Readme
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB Community Server or MongoDB Atlas Uri)

---

### 1. Clone the Repository
```bash
git clone https://github.com/niranjandascp/campus360.git
cd campus360
```

---

### 2. Backend Setup (`Server/`)
Navigate to the `Server` directory, install dependencies, and configure environment variables:

```bash
cd Server
npm install
```

Create a `.env` file inside the `Server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campus360
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server in development mode:
```bash
npm run dev
```
*The server will start running on `http://localhost:5000`.*

---

### 3. Frontend Setup (`Client/`)
Open a new terminal window, navigate to the `Client` directory, and install dependencies:

```bash
cd Client
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The React client application will start running on `http://localhost:5173`.*

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student account | Public |
| `POST` | `/api/auth/login` | Student / Admin login & return JWT | Public |
| `GET` | `/api/issues` | Get all reported maintenance issues | Public |
| `POST` | `/api/issues` | Report a new campus issue (Multipart) | Authenticated |
| `PUT` | `/api/issues/:id/upvote` | Upvote an issue ticket | Authenticated |
| `GET` | `/api/rooms` | Get list of study rooms & availability | Public |
| `POST` | `/api/rooms/book` | Reserve a study room | Authenticated |
| `GET` | `/api/events` | Get upcoming campus events | Public |
| `POST` | `/api/events/:id/rsvp` | Toggle RSVP for an event | Authenticated |

---

## 📜 Project Documentation & PDF Export

For detailed competition submission guidelines, architectural flow diagrams, and judge criteria matrices:
- **Markdown Docs:** [`Campus360_Project_Documentation.md`](./Campus360_Project_Documentation.md)
- **Printable PDF Document:** Double-click [`Campus360_Project_Documentation.html`](./Campus360_Project_Documentation.html) in your browser and click **"🖨️ Save as PDF / Print Document"**.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center>Crafted with ❤️ for the Campus360 Web Development Competition</p>
