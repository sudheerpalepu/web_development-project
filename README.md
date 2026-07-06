# Career Guide Dashboard

A full-stack web application for career recommendation, real-time job analytics, and personalised career management.

The Career Guide Dashboard helps users explore career options, search for live job opportunities, view employment analytics, and manage favourite careers and jobs from one secure dashboard. The application combines a React frontend, FastAPI backend, MongoDB Atlas database, JWT authentication, and external job API integration.

## Live Links

- Frontend: https://web-development-project-omega.vercel.app/
- Backend dashboard: https://dashboard.render.com/web/srv-d95kuguq1p3s73d5k430
- Repository: https://github.com/sudheerpalepu/web_development-project

## Features

- User registration and login
- JWT-based authentication
- Personalised user dashboard
- Career prediction support
- Real-time job search using an external job API
- Employment analytics with charts and visual summaries
- Favourite careers management
- Favourite jobs management
- User profile management
- CRUD operations for saved user data
- Responsive interface for desktop, tablet, and mobile devices
- Cloud deployment using Vercel and Render

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Builds the user interface |
| UI Framework | Material UI | Provides responsive and professional UI components |
| Routing | React Router | Handles frontend page navigation |
| HTTP Client | Axios | Connects the frontend with backend APIs |
| Charts | Recharts | Displays analytics using charts and graphs |
| Backend | FastAPI | Provides REST API endpoints |
| Database | MongoDB Atlas | Stores users, favourite careers, and favourite jobs |
| Authentication | JWT | Secures protected user routes |
| Hosting | Vercel | Hosts the frontend |
| Hosting | Render | Hosts the backend |
| Version Control | GitHub | Stores and manages source code |

## System Architecture

The application follows a client-server architecture with three main layers:

1. Presentation Layer  
   The React frontend displays pages, forms, dashboards, charts, and user controls.

2. Application Layer  
   The FastAPI backend manages authentication, job search, career prediction, analytics, favourites, profile updates, and API communication.

3. Database Layer  
   MongoDB Atlas stores user accounts, favourite careers, favourite jobs, and application data.

The frontend communicates with the backend through REST APIs. The backend validates requests, checks authentication tokens, interacts with MongoDB Atlas, fetches external job information, and returns structured JSON responses.

## Main Modules

- Authentication Module
- Dashboard Module
- Career Module
- Prediction Module
- Analytics Module
- Jobs Module
- Favourite Module
- Profile Module

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/dashboard/` | Retrieve dashboard information |
| GET | `/predictions/{domain}` | Generate career predictions |
| GET | `/jobs/fetch/{domain}` | Retrieve job listings |
| GET | `/analytics/{domain}` | Retrieve analytics data |
| POST | `/favorites/career` | Save a favourite career |
| POST | `/favorites/job` | Save a favourite job |
| GET | `/profile/` | Retrieve user profile |
| PUT | `/profile/` | Update user profile |

## Database Design

### Users Collection

Stores registered user details.

- User ID
- Name
- Email address
- Hashed password
- User role

### Favourite Careers Collection

Stores career domains saved by users.

- Favourite ID
- User email
- Career domain
- Date created

### Favourite Jobs Collection

Stores jobs saved by users.

- ID
- Job ID
- Job title
- Company
- Location
- User email

## Security

The application includes the following security measures:

- Password hashing before storing user passwords
- JWT authentication for protected routes
- Token validation before private API access
- Protected dashboard, favourites, and profile endpoints
- User-specific access control for CRUD operations
- CORS configuration for frontend-backend communication
- Environment variables for sensitive configuration values

## Installation

Clone the repository:

```bash
git clone https://github.com/sudheerpalepu/web_development-project.git
cd web_development-project
```

## Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm start
```

The frontend will usually run at:

```text
http://localhost:3000
```

## Backend Setup

Go to the backend folder if the project separates frontend and backend directories:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
uvicorn main:app --reload
```

The backend will usually run at:

```text
http://localhost:8000
```

FastAPI documentation can be viewed at:

```text
http://localhost:8000/docs
```

## Environment Variables

Create a `.env` file in the backend directory and add the required values:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
JOB_API_KEY=your_job_api_key
```

Update these names if your code uses different environment variable names.

## Usage

1. Register a new account.
2. Log in using your email and password.
3. View the dashboard.
4. Search for jobs by career domain.
5. Check job analytics, salary information, and employment trends.
6. Save favourite careers and jobs.
7. Update profile details when needed.

## Deployment

The project is deployed using:

- Vercel for the React frontend
- Render for the FastAPI backend
- MongoDB Atlas for the cloud database

The frontend sends requests to the deployed backend API, and the backend connects to MongoDB Atlas and the external job API.

## Project Aim

The aim of this project is to create a secure and easy-to-use career guidance dashboard that helps users make better career decisions. It combines job search, career prediction, analytics, and personalised career management in one full-stack web application.

## Future Enhancements

- Improve AI-based career recommendations
- Add job market prediction features
- Add notification services
- Improve filtering for jobs and analytics
- Add more dashboard visualisations
- Improve user profile personalisation
- Expand external API integrations

## Author

Sudheer Palepu

## Module Information

- Module: Web Development for Information Systems
- Module Code: B9IS130
- Assessment Type: Project
