# 🗺️ SCSU MAP - Campus Navigation & Schedule System

A comprehensive campus mapping and scheduling application for Southern Connecticut State University students, featuring interactive maps, class scheduling, and real-time navigation between campus locations.

## 🎯 Project Overview

**SCSU MAP** is a full-stack web application designed to help SCSU students navigate campus efficiently while managing their class schedules. The system provides an interactive campus map with routing capabilities and schedule management features.

### 🚀 Current Features
- **User Authentication System** - Secure login/registration with SCSU email validation
- **Interactive Campus Map** - Built with Mapbox GL for smooth navigation
- **Modern React Frontend** - Built with React Router v7 and TypeScript
- **Secure Backend API** - Express.js server with JWT authentication
- **PostgreSQL Database** - Robust data storage for users and schedules

### 🔮 Planned Features
- **Class Schedule Display** - View and manage your course schedule
- **Real-time Navigation** - Get directions from your current location to class
- **Campus Building Integration** - Detailed building information and room locations
- **Schedule Optimization** - Suggest optimal routes between consecutive classes
- **Mobile Responsive Design** - Access your schedule and navigation on any device

## 🏗️ Architecture

```
SCSU MAP/
├── Backend/                 # Express.js API server
│   ├── server.js           # Main server file with authentication
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (not in git)
├── Frontend/               # React application
│   └── template/          # Main React app
│       ├── Components/    # React components
│       ├── routes/        # Application routes
│       └── package.json   # Frontend dependencies
└── Database/              # PostgreSQL database schema
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - Modern React with latest features
- **React Router v7** - Client-side routing
- **TypeScript** - Type-safe JavaScript
- **Mapbox GL** - Interactive mapping library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Mapbox API key

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your database credentials:
   ```env
   DB_USER=
   DB_HOST=
   DB_NAME=
   DB_PASSWORD=
   DB_PORT=
   JWT_SECRET=
   PORT=
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the Frontend template directory:
   ```bash
   cd Frontend/template
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📱 Current Application Routes

- **`/`** - Home page with campus map
- **`/dashboard`** - User dashboard (protected)
- **`/schedule`** - Class schedule view (planned)
- **`/userhome`** - User home page (protected)

## 🔐 Authentication System

The application uses JWT (JSON Web Tokens) for secure authentication:

- **Registration**: Users must use their SCSU email (@go.minnstate.edu)
- **Password Security**: Passwords are hashed using bcrypt
- **Session Management**: JWT tokens expire after 24 hours
- **Protected Routes**: Certain pages require valid authentication

## 🗄️ Database Schema

### Users Table
- `id` - Unique user identifier
- `email` - SCSU email address
- `password_hash` - Encrypted password
- `created_at` - Account creation timestamp

### Future Tables (Planned)
- **Classes** - Course information and schedules
- **Buildings** - Campus building details and coordinates
- **Rooms** - Classroom locations within buildings
- **User_Schedules** - Individual student schedules

## 🗺️ Mapping & Navigation

### Current Implementation
- Interactive campus map using Mapbox GL
- Responsive design for various screen sizes
- Campus logo integration

### Planned Navigation Features
- **Route Calculation** - Find optimal paths between locations
- **Real-time Location** - GPS integration for current position
- **Building Information** - Details about campus facilities
- **Accessibility Routes** - Wheelchair-friendly navigation options

## 📅 Schedule Management (Planned)

### Features in Development
- **Class Schedule View** - Visual representation of weekly schedule
- **Location Integration** - Connect classes to building locations
- **Time-based Routing** - Suggest routes based on class timing
- **Schedule Optimization** - Minimize travel time between classes

## 🧪 Development

### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Write meaningful commit messages
- Test authentication flows thoroughly

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based sessions
- **CORS Protection** - Controlled cross-origin requests
- **Input Validation** - Server-side data validation
- **Environment Variables** - Sensitive data protection

## 🚧 Roadmap

### Phase 1: Core Infrastructure ✅
- [x] User authentication system
- [x] Basic campus map integration
- [x] Database setup and API endpoints
- [x] Frontend routing and components

### Phase 2: Schedule Management 🚧
- [ ] Class schedule database schema
- [ ] Schedule display components
- [ ] Schedule CRUD operations
- [ ] User schedule management

### Phase 3: Navigation & Routing 🚧
- [ ] Building and room database
- [ ] Route calculation algorithms
- [ ] Real-time location integration
- [ ] Navigation interface

### Phase 4: Optimization & Polish 🚧
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [x] Accessibility improvements - doing as project contiunes
- [ ] User experience enhancements

## 🤝 Contributing

This project is designed for SCSU students and developers. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for SCSU Students**
