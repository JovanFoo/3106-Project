## Features

1. Login/Signup ✅
2. Appointments
    - Create a new appointment (frontend not done)
    - View all existing appointments ✅
    - Edit an appointment
    - Cancel an appointment
    - View past appointments

## Setup & Running the Customer Frontend Application

1. Clone the repository:
   ```sh
   git clone https://github.com/Jett-Tan/3106-Project.git
   cd Frontend/customer-frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
   - make sure to have the 'dotenv' package for env variables to work
3. Create a **.env** file and set the following:
   ```env
   VITE_API_URL = 'your API URL here'
   ```
   <!-- REFRESH_SECRET=your_refresh_secret -->
4. Start the server with env:
   ```sh
   npm run server

## Local Storage Variables
- variable name "user": contains data in JSON format. Need to JSON.parse(data) first to read it
- This variable has 3 important data: .user, .tokens.token and .tokens.refresh_token(not sure about the name)