# Discord Clone Server

This is the backend server for the Discord Clone application built with Node.js, Express, and MongoDB.

## Project Structure

```
server/
├── config/
│   └── database.js         # Database configuration
├── controllers/
│   ├── authController.js   # Authentication related controllers
│   ├── serverController.js # Server management controllers
│   ├── chatController.js   # Chat functionality controllers
│   └── friendController.js # Friend system controllers
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Server.js          # Server model
│   ├── Chat.js            # Chat model
│   └── Invite.js          # Invite model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── server.js          # Server management routes
│   ├── chat.js            # Chat routes
│   └── friend.js          # Friend system routes
├── utils/
│   └── helpers.js         # Helper functions
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── index.js              # Main application file
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3090
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN=your_jwt_secret
user=your_email
password=your_email_password
default_profile_pic=default_profile_picture_url
```

3. Start the development server:
```bash
npm run dev
```

4. For production:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register a new user
- POST `/api/auth/signin` - Login user
- POST `/api/auth/verify` - Verify user email
- POST `/api/auth/verify_route` - Verify authentication token

### Server Management
- POST `/api/server/create` - Create a new server
- POST `/api/server/info` - Get server information
- POST `/api/server/channel` - Add new channel
- POST `/api/server/category` - Add new category
- POST `/api/server/invite/create` - Create invite link
- POST `/api/server/invite/info` - Get invite link information
- POST `/api/server/invite/accept` - Accept server invite
- POST `/api/server/delete` - Delete server
- POST `/api/server/leave` - Leave server

### Chat
- POST `/api/chat/store` - Store message
- POST `/api/chat/get` - Get messages

### Friend System
- POST `/api/friend/add` - Add friend
- GET `/api/friend/relations` - Get user relations
- POST `/api/friend/process` - Process friend request

## Socket.IO Events

- `get_userid` - Join user's personal room
- `send_req` - Send friend request
- `req_accepted` - Friend request accepted
- `join_chat` - Join chat channel
- `send_message` - Send message in channel 