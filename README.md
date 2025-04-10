# MERN Stack Project

A full-stack application using MongoDB, Express.js, React.js, and Node.js.

## Project Structure

```
.
├── client/          # React frontend
├── server/          # Express backend
└── .env.example     # Environment variables template
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```
3. Copy `.env.example` to `.env` in both client and server directories and update the variables
4. Start the development servers:
   ```bash
   # Start server (from server directory)
   npm run dev

   # Start client (from client directory)
   npm start
   ``` 