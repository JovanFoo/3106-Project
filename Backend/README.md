# SalonFlow System API Documentation

## Introduction

This API powers a SalonFlow System where Customer can book for appointments ..... , and manage authentication using JWT-based authentication.

## Base URL

```
http://localhost:8888/api
```

---

## View Endpoints

| Method  | Endpoint                | Description          | Authentication | Completed |
| ------- | ----------------------- | -------------------- | -------------- | --------- |
| **GET** | `/error`                | Error 404            | NA             | ✅        |
| **GET** | `/reset-password:token` | Reset password page  | YES (PARAMS)   | ✅        |
| **GET** | `/success-update`       | Update details       | NA             | ✅        |
| **GET** | `/unsuccessful-update`  | Something went wrong | NA             | ✅        |

## Authentication Endpoints

| Method   | Endpoint                                | Description                                            | Authentication | Completed |
| -------- | --------------------------------------- | ------------------------------------------------------ | -------------- | --------- |
| **POST** | `/auth/customers/register`              | Register a new customer account                        | NA             | ✅        |
| **POST** | `/auth/customers/login`                 | Log in with a Customer account and receive a JWT token | NA             | ✅        |
| **POST** | `/auth/customers/forget-password`       | Send a reset password email                            | NA             | ✅        |
| **POST** | `/auth/customers/reset-password/:token` | Reset customer password                                | YES (PARAMS)   | ✅        |
| **POST** | `/auth/stylists/register`               | Register a new Stylist account                         | NA             | ❌        |
| **POST** | `/auth/stylists/login`                  | Log in with a Stylist account and receive a JWT token  | NA             | ❌        |
| **POST** | `/auth/stylists/forget-password`        | Send a reset password email                            | NA             | ❌        |
| **POST** | `/auth/stylists/reset-password/:token`  | Reset Stylist password                                 | YES (PARAMS)   | ❌        |
| **POST** | `/auth/logout`                          | Log out (invalidate token on the client side)          | YES            | ❌        |

---

## Customer Endpoints

| Method     | Endpoint                      | Description                                           | Authentication     | Completed |
| ---------- | ----------------------------- | ----------------------------------------------------- | ------------------ | --------- |
| **GET**    | `/customers/:id`              | Get a customer profile                                | YES (CUST)         | ✅        |
| **PUT**    | `/customers/:id`              | Update customer profile (e.g., username, email, name) | YES (CUST)         | ✅        |
| **PUT**    | `/customers/profilePicture`   | Update customer profile picture                       | YES (CUST)         | ❌        |
| **DELETE** | `/customers`                  | Delete a customer                                     | YES (CUST)         | ❌        |
| **GET**    | `/customers/:id/appointments` | Get a customer appointments                           | YES (CUST/STYLIST) | ❌        |

---

## Appointment Endpoints

| Method     | Endpoint                      | Description                             | Authentication     | Completed |
| ---------- | ----------------------------- | --------------------------------------- | ------------------ | --------- |
| **GET**    | `/appointments`               | Get customer's appointments             | YES (CUST)         | ✅        |
| **GET**    | `/appointments/:id`           | Get a specific appointment by ID        | YES (CUST)         | ✅        |
| **POST**   | `/appointments`               | Create a new appointments               | YES (CUST)         | ✅        |
| **PUT**    | `/appointments/:id`           | Update a appointments                   | YES (CUST/STYLIST) | ✅        |
| **PUT**    | `/appointments/:id/completed` | Update a appointments completion status | YES (STYLIST)      | ✅        |
| **DELETE** | `/appointments/:id`           | Delete a appointments                   | YES (CUST)         | ✅        |

---

## Stylist Endpoints

| Method  | Endpoint                       | Description all actions require JWT authentication | Authentication | Completed |
| ------- | ------------------------------ | -------------------------------------------------- | -------------- | --------- |
| **GET** | `/stylists/:id`                | Get stylist profile                                | ???            | ✅        |
| **PUT** | `/stylists/:id`                | Update stylist profile (e.g., username, email)     | ???            | ✅        |
| **PUT** | `/stylists/:id/profilePicture` | Update stylist profile picture only                | ???            | ✅        |
| **GET** | `/stylists/:id/appointments`   | Get stylist's appointments                         | ???            | ✅        |

---

## Payment Endpoints

| Method   | Endpoint                  | Description                        | Authentication | Completed |
| -------- | ------------------------- | ---------------------------------- | -------------- | --------- |
| **POST** | `/payments/:id/upvote`    | Upvote a question (Requires JWT)   | ???            | ❌        |
| **POST** | `/questions/:id/downvote` | Downvote a question (Requires JWT) | ???            | ❌        |
| **POST** | `/answers/:id/upvote`     | Upvote an answer (Requires JWT)    | ???            | ❌        |
| **POST** | `/answers/:id/downvote`   | Downvote an answer (Requires JWT)  | ???            | ❌        |

---

## Review Endpoints

| Method   | Endpoint   | Description                             | Authentication | Completed |
| -------- | ---------- | --------------------------------------- | -------------- | --------- |
| **GET**  | `/reviews` | Get a list of all tags                  | ???            | ❌        |
| **POST** | `/reviews` | Create a new tag (Requires JWT)         | ???            | ❌        |
| **GET**  | `/reviews` | Get all questions associated with a tag | ???            | ❌        |

---

## Branch Endpoints

| Method     | Endpoint    | Description                         | Authentication | Completed |
| ---------- | ----------- | ----------------------------------- | -------------- | --------- |
| **POST**   | `/branches` | Get the top 10 most asked questions | YES (MANAGER)  | ✅        |
| **GET**    | `/`         | View all Branches                   | NA             | ✅        |
| **GET**    | `/:id`      | View a Branch by id                 | NA             | ✅        |
| **PUT**    | `/:id`      | Update a Branch by id               | YES (MANAGER)  | ✅        |
| **DELETE** | `/:id`      | Delete a Branch by id               | YES (MANAGER)  | ✅        |

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
