# 💈 BuzzBook – Barber Booking System

## 🏠 Home

Welcome to **BuzzBook**, your all-in-one barber booking and management system.

---

## ✂️ Introduction

**BuzzBook** is a web-based management platform built exclusively for barbershops, transforming the way appointments, teams, and operations are handled.

From:
- Seamless customer bookings  
- Real-time stylist scheduling  
- Streamlined leave approvals  
- Centralized admin oversight  

BuzzBook replaces:
- Paper logs  
- Chat-based coordination  
- Outdated POS tools  

With an all-in-one, intuitive system.

Whether you're:
- A **customer** booking a trim  
- A **stylist** updating your profile  
- A **manager** coordinating staff  
- An **admin** overseeing branches  

BuzzBook keeps everyone connected, informed, and in control.

---

## 🎯 Project Purpose

Barbershops today face operational challenges:

- Overlapping appointments  
- Manual scheduling  
- Disconnected communication  
- Inflexible service setups  

BuzzBook was created to solve these problems by:

- Empowering each user role — customer, stylist, manager, admin — with tailored tools  
- Eliminating errors and miscommunication through real-time updates and centralized data  
- Enabling smarter decisions with visual leave planning, transaction tracking, and dynamic pricing  
- Boosting customer retention via loyalty points and transparent review systems  
- Supporting business growth with scalable, secure, and customizable multi-branch management  

---

Ultimately, **BuzzBook’s purpose** is to bring modern efficiency to barbershop operations — making every haircut, shift, and transaction seamless.


# Documentation

### Contributors

#### Group Members (Group 18):

| Name                 | Student number |
| -------------------- | -------------- |
| CAPRISE CHEW JYN-UUN | A0278239N      |
| FOO TOON XIAN, JOVAN | A0254629W      |
| KUAN YEW KHANG       | A0281483Y      |
| LAU TSE ERN, ANDRE   | A0272224M      |
| TAN JIAN FENG        | A0273495R      |
| WALLACE PHUA HUAI'EN | A0282796J      |

## System Architecture details

| Component                    | Technology Used      |
| ---------------------------- | -------------------- |
| Frontend Framework           | Vite                 |
| Backend Framework            | Express.js (node.js) |
| Database                     | MongoDB Atlas        |
| ODM (Object Document Mapper) | Mongoose             |
| Authentication Mechanism     | JWT (JSON Web Token) |
| Deployment Platform          | Vercel (Frontend)    |

## Setup & Running the RESTful API

Follow these steps to set up and run the server locally.

1. **Enter Backend Directory**
   ```
   cd Backend
   ```
2. **Install dependencies**
   ```
   npm install
   ```
3. **Create Environment Variables**
   ### For Windows
   Run the following command to copy the environment variables setup for a Windows system:
   ```
   npm run set-env-window
   ```
   ### For MacOS
   Run the following command to copy the environment variables setup for a MacOS system:
   ```
   npm run set-env-mac
   ```
4. **Start the server:**
   ```
   npm run server
   ```
5. **The end-points will be available at:**
   ```
   http://localhost:3000/
   ```

## Enviroment Variables for backend

The following environment variables are required for the project:

- PORT: Port the application runs on.
- MONGODB_URI: Connection URI for MongoDB (see below for how to configure it).
- JWT_SECRET: Secret key for JWT token generation.
- JWT_EXPIRY: Expiry time for JWT tokens.
- JWT_REFRESH_EXPIRY: Expiry time for JWT (refresh) tokens.
- NODE_MAILER_EMAIL: Google Gmail address
- NODE_MAILER_PASSWORD: Google app password
- CLIENT_URL: Front-end Url

### Example .env file:

```
PORT=3000
MONGODB_URI="mongodb+srv://user:Pass123@is3106-project.a4dmx.mongodb.net/?retryWrites=true&w=majority&appName=IS3106-Project"
JWT_SECRET="secretKey"
JWT_EXPIRY="2h"
JWT_REFRESH_EXPIRY="2w"
NODE_MAILER_EMAIL="salonflow@zohomail.com"
NODE_MAILER_PASSWORD="ch5H qmTa nmqj"
CLIENT_URL="https://3106-project.vercel.app"
```

## Setup & Running the Frontend (Admin)

Follow these steps to set up and run the server locally.

1. **Enter Frontend (Admin) Directory**
   ```
   cd Frontend\admin-frontend
   ```
2. **Install dependencies**
   ```
   npm install
   ```
3. **Create Environment Variables**
   ### For Windows
   Run the following command to copy the environment variables setup for a Windows system:
   ```
   npm run set-env-window
   ```
   ### For MacOS
   Run the following command to copy the environment variables setup for a MacOS system:
   ```
   npm run set-env-mac
   ```
4. **Start frontend:**
   ```
   npm run dev
   ```
5. **The website will be available at:**
   ```
   http://localhost:5173/
   ```

## Setup & Running the Frontend (Stylist/Manager)

Follow these steps to set up and run the server locally.

1. **Enter Frontend (Stylist/Manager) Directory**
   ```
   cd Frontend\StoreManager
   ```
2. **Install dependencies**
   ```
   npm install
   ```
3. **Create Environment Variables**
   ### For Windows
   Run the following command to copy the environment variables setup for a Windows system:
   ```
   npm run set-env-window
   ```
   ### For MacOS
   Run the following command to copy the environment variables setup for a MacOS system:
   ```
   npm run set-env-mac
   ```
4. **Start frontend:**
   ```
   npm run dev
   ```
5. **The website will be available at:**
   ```
   http://localhost:5174/
   ```

## Setup & Running the Frontend (Customer)

Follow these steps to set up and run the server locally.

1. **Enter Frontend (Customer) Directory**
   ```
   cd Frontend\customer-frontend
   ```
2. **Install dependencies**
   ```
   npm install
   ```
3. **Create Environment Variables**
   ### For Windows
   Run the following command to copy the environment variables setup for a Windows system:
   ```
   npm run set-env-window
   ```
   ### For MacOS
   Run the following command to copy the environment variables setup for a MacOS system:
   ```
   npm run set-env-mac
   ```
4. **Start frontend:**
   ```
   npm run dev
   ```
5. **The website will be available at:**
   ```
   http://localhost:5175/
   ```

# Deployment on vercel

| Frontend        | URL                                       |
| --------------- | ----------------------------------------- |
| Admin           | https://3106-project-admin.vercel.app/    |
| Stylist/Manager | https://3106-project-stylist.vercel.app/  |
| Customer        | https://3106-project-customer.vercel.app/ |
