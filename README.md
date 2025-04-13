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
5. Create an admin user (optional):
   ```bash
   # From the server directory
   node seedAdmin.js
   ```
   This will create an admin user with:
   - Email: admin@example.com
   - Password: adminpassword
   
   You can use this account to access the admin dashboard and approve owner accounts.

## Features

- User Authentication (login/register)
- User Roles: Renter, Owner, Admin
- Property Listings

  ![image](https://github.com/user-attachments/assets/22361664-b981-4922-8949-39e7f32a2ce7)
  ![image](https://github.com/user-attachments/assets/6c6ffa7e-09d2-4ed1-91ac-b5efdb16c5e2)

  ![image](https://github.com/user-attachments/assets/14bd5825-a387-4a18-9f1f-aeabb27f1c96)

  ![image](https://github.com/user-attachments/assets/581df7a9-f3e5-409f-a0cd-64d1e59c7b00)

  ![image](https://github.com/user-attachments/assets/cb476dc9-2524-4ad7-b458-22b984ffce51)

  ![image](https://github.com/user-attachments/assets/74705087-cd5c-498c-a274-54963dc1166c)
  ![image](https://github.com/user-attachments/assets/516b0025-8b94-458f-adea-eedc906664cd)
  ![image](https://github.com/user-attachments/assets/29204ba8-4c8e-432f-b942-a4d1533a005a)

  ![image](https://github.com/user-attachments/assets/16178018-a9de-4a64-a0af-7f6352ef2632)

  ![image](https://github.com/user-attachments/assets/d4840083-a0d6-491d-aaec-7193cfad5ee7)

  ![image](https://github.com/user-attachments/assets/d24e8d2f-66ca-4052-bf56-686c6d9a21f2)

  ![image](https://github.com/user-attachments/assets/253d6c50-2b83-402d-ac7a-ace19f54704a)
  ![image](https://github.com/user-attachments/assets/5895af43-4b0b-4d83-97b9-d34e3f4df298)
  ![image](https://github.com/user-attachments/assets/80d2cfd9-a37e-4ac5-adcc-a426dad948dd)

  ![image](https://github.com/user-attachments/assets/97c4d245-b8f6-4714-8599-a3a283ba5cc9)

  ![image](https://github.com/user-attachments/assets/ea0759aa-4462-4d26-b36d-0a4e77491237)
  
  ![image](https://github.com/user-attachments/assets/422ed9fc-e871-4b6c-a992-96d09c4db8d3)
  
  ![image](https://github.com/user-attachments/assets/07395109-8739-4a9e-a6d1-7f4c0b616194)
  
  ![image](https://github.com/user-attachments/assets/a67f56f6-473c-4cc2-9de9-b913e05692cf)

** VIDEO LINK**
https://drive.google.com/file/d/1lR6KoRJ8d4MVqKPC92EYtRfjplHf53-F/view?usp=sharing



















- Admin Dashboard for Owner Approval 
