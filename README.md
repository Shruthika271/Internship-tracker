\# Internship \& Placement Tracker



A full-stack web application designed to help students manage and track their internship and placement applications in one place.



\## Overview



The Internship \& Placement Tracker provides a centralized interface for recording applications, monitoring their progress, tracking deadlines, storing job-posting information, managing application notes, and keeping relevant resumes organized.



The application supports both guest users and registered users.



\## Features



\- Dashboard with application statistics

\- Add, edit, and delete applications

\- Application status tracking

\- Search, filter, and sort applications

\- Location-based filtering

\- Upcoming deadline tracking

\- Application status history

\- Favorite applications

\- Application-specific notes

\- Application URL storage

\- Original job posting storage

\- CV / resume upload for registered users

\- Guest mode with browser-based local storage

\- User registration and login

\- Email verification using OTP

\- Forgot password and password reset

\- Change password

\- Profile and account settings

\- Analytics dashboard

\- Responsive interface

\- Dark, light, and system theme options



\## Guest Mode



Users can continue without creating an account.



Guest users can create, edit, delete, and manage their applications without signing in. Guest application data is stored locally in the browser on the user's device.



CV / resume upload is available only to registered users.



Registered users have their application data stored through the backend and PostgreSQL database.



\## Tech Stack



\### Frontend



\- React

\- Vite

\- JavaScript

\- React Router

\- HTML

\- CSS



\### Backend



\- Node.js

\- Express.js

\- REST API



\### Database



\- PostgreSQL



\### Authentication



\- JWT

\- bcrypt

\- Email OTP verification

\- Password reset through email OTP



\## Project Structure



Internship-Tracker/

│

├── backend/

│   ├── middleware/

│   ├── auth.js

│   ├── db.js

│   ├── schema.sql

│   ├── server.js

│   └── package.json

│

├── internship-tracker-frontend/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   └── services/

│   └── package.json

│

├── index.html

├── script.js

├── style.css

└── README.md



\## Running Locally



The application currently runs locally with the React frontend, Node.js/Express backend, and PostgreSQL database.



\### Backend



Open a terminal in the `backend` directory and run:



npm run dev



The backend runs on:



http://localhost:5000



\### Frontend



Open a separate terminal in the `internship-tracker-frontend` directory and run:



npm run dev



The frontend runs on:



http://localhost:5173



\### Database



The application uses PostgreSQL for registered-user data.



Database configuration and other sensitive credentials are stored in environment variables and are not included in this repository.



\## Security



Sensitive configuration such as database credentials, authentication secrets, and email credentials is stored in environment variables and is not included in the repository.



\## Current Status



The core application has been developed and tested locally.



The project is currently being prepared for online deployment and final portfolio refinement.



\## Future Work



\- Deploy the frontend, backend, and PostgreSQL database online

\- Configure production environment variables

\- Perform additional end-to-end testing

\- Improve documentation and project presentation

\- Add screenshots and live demo information



\## Author



Shruthika

