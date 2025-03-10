# SalonFlow System API Documentation

## Introduction

This API powers a SalonFlow System where Customer can book for appointments ..... , and manage authentication using JWT-based authentication.

## Base URL

```
http://localhost:8888/api
```

---

## 1⃣ Authentication Endpoints

| Method   | Endpoint                   | Description                                            | Completed |
| -------- | -------------------------- | ------------------------------------------------------ | --------- |
| **POST** | `/auth/customers/register` | Register a new customer account                        | ✅        |
| **POST** | `/auth/customers/login`    | Log in with a Customer account and receive a JWT token | ✅        |
| **POST** | `/auth/logout`             | Log out (invalidate token on the client side)          | ❌        |
| **POST** | `/auth/refresh`            | Refresh access token                                   | ❌        |

---

## 2⃣ Customer Endpoints

| Method  | Endpoint         | Description all actions require JWT authentication           |
| ------- | ---------------- | ------------------------------------------------------------ |
| **GET** | `/customers/:id` | Get a user profile                                           |
| **PUT** | `/customers/:id` | Update user profile (e.g., username, email, profile picture) |

---

## 3⃣ Question Endpoints

| Method     | Endpoint         | Description                          |
| ---------- | ---------------- | ------------------------------------ |
| **GET**    | `/questions`     | Get all questions                    |
| **GET**    | `/questions/:id` | Get a specific question by ID        |
| **POST**   | `/questions`     | Create a new question (Requires JWT) |
| **PUT**    | `/questions/:id` | Update a question (Requires JWT)     |
| **DELETE** | `/questions/:id` | Delete a question (Requires JWT)     |

---

## 4⃣ Answer Endpoints

| Method     | Endpoint                 | Description                                |
| ---------- | ------------------------ | ------------------------------------------ |
| **GET**    | `/questions/:id/answers` |                                            |
| **POST**   | `/questions/:id/answers` | Add an answer to a question (Requires JWT) |
| **PUT**    | `/answers/:id`           | Update an answer (Requires JWT)            |
| **DELETE** | `/answers/:id`           | Delete an answer (Requires JWT)            |

---

## 5⃣ Voting Endpoints

| Method   | Endpoint                  | Description                        |
| -------- | ------------------------- | ---------------------------------- |
| **POST** | `/questions/:id/upvote`   | Upvote a question (Requires JWT)   |
| **POST** | `/questions/:id/downvote` | Downvote a question (Requires JWT) |
| **POST** | `/answers/:id/upvote`     | Upvote an answer (Requires JWT)    |
| **POST** | `/answers/:id/downvote`   | Downvote an answer (Requires JWT)  |

---

## 6⃣ Tag Endpoints

| Method   | Endpoint                   | Description                             |
| -------- | -------------------------- | --------------------------------------- |
| **GET**  | `/tags`                    | Get a list of all tags                  |
| **POST** | `/tags`                    | Create a new tag (Requires JWT)         |
| **GET**  | `/tags/:tagName/questions` | Get all questions associated with a tag |

---

## 7⃣ Miscellaneous Endpoints

| Method  | Endpoint                | Description                             |
| ------- | ----------------------- | --------------------------------------- |
| **GET** | `/top-questions`        | Get the top 10 most asked questions     |
| **GET** | `/search?query=keyword` | Search for questions based on a keyword |

---

## Authentication & Authorization

- Endpoints marked **(Requires JWT)** require an authorization token in the request header:
  ```
  Authorization: Bearer <your_jwt_token>
  ```
- Use the `/auth/<customers/stylists>/login` endpoint to obtain a JWT token.

---

## Setup & Running the Server

1. Clone the repository:
   ```sh
   git clone https://github.com/Jett-Tan/3106-Project.git
   cd Backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a **.env** file and set the following:
   ```env
   JWT_SECRET=your_secret_key
   PORT=your_port_number
   MONGO_URI=your_mongodb_connection_string
   JWT_EXPIRY="2h"
   ```
   <!-- REFRESH_SECRET=your_refresh_secret -->
4. Start the server with env:
   ```sh
   npm run server
   ```
   <!-- 5. API will be available at:
      ```
      http://localhost:3000/
      ``` -->

---

## Contributing

Feel free to submit issues or pull requests! 🚀
