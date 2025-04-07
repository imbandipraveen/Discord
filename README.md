# RiscoL - A Discord Clone

A feature-rich Discord clone built with React, Node.js, and MongoDB. This project replicates core Discord functionality including real-time chat, server management, user authentication, and more.

## Features

- 🔐 **Authentication System**

  - User registration with email verification (OTP)
  - Secure login with JWT tokens
  - Password recovery functionality

- 💬 **Real-time Communication**

  - Direct messaging between users
  - Server-based text channels
  - Real-time message updates
  - Message history and persistence

- 🏠 **Server Management**

  - Create and join servers
  - Custom server settings
  - Server roles and permissions
  - Server member management

- 👥 **User Management**

  - Friend system with requests
  - User profiles with avatars
  - Online/offline status
  - User blocking functionality

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark theme interface
  - Customizable layouts
  - Smooth animations and transitions

## Tech Stack

- **Frontend**

  - React.js
  - Redux for state management
  - CSS Modules for styling
  - JWT for authentication

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - AWS S3 Bucket for Images
  - Socket.io for real-time features
  - JWT for authentication

## 🖼️ Screenshots

#### Login Page:

![alt text](https://discord-clone123.s3.eu-north-1.amazonaws.com/Screenshot+from+2025-04-07+17-54-29.png)

#### Register Page:

![alt text](https://discord-clone123.s3.eu-north-1.amazonaws.com/Screenshot+from+2025-04-07+17-55-05.png)

#### Home Page:

![alt text](https://discord-clone123.s3.eu-north-1.amazonaws.com/Screenshot+from+2025-04-07+17-55-56.png)

#### Server Page:

![alt text](https://discord-clone123.s3.eu-north-1.amazonaws.com/Screenshot+from+2025-04-07+17-56-26.png)

#### DirectChat Page:

![alt text](https://discord-clone123.s3.eu-north-1.amazonaws.com/Screenshot+from+2025-04-07+17-56-54.png)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://gitlab.com/username/discord-clonerepo2.git
cd discord-clonerepo2
```

2. Install dependencies for both client and server

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables
   - Create `.env` files in both client and server directories
   - Add necessary environment variables as shown below:

### Client Environment Variables (.env)

```env
REACT_APP_URL=your-url
REACT-APP_front_end_url=your-url
REACT_APP_S3_BU-KET_NAME=your-s3-bucket-name
REACT_APP_S3_REGION=your-s3-region
REACT_APP_S3_ACCESS_KEY=your-s3-access-key
REACT_APP_S3_SECRET_KEY=your-s3-secret-key
```

### Server Environment Variables (.env)

```env
PORT=port
MONGODB_URI=your-mongoUri
JWT_SECRET=your-jwt-secret-key
S3_BUCKET_NAME=your-s3-bucket-name
S3_REGION=your-s3-region
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
```

1. Start the development servers

```bash
# Start the backend server
cd server
npm start

# Start the frontend development server
cd client
npm start
```

## Project Structure

```
discord-clone/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   │   ├── components/    # React components
│   │   ├── Redux/        # State management
│   │   ├── config/       # Configuration files
│   │   └── utils/        # Utility functions
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── controllers/      # Route controllers
    ├── models/          # Database models
    ├── routes/          # API routes
    ├── middleware/      # Custom middleware
    ├── config/          # Configuration files
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Inspired by Discord
- Built with modern web technologies
- Community-driven development
