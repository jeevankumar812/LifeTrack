# LifeTrack

### Your Life. Your Goals. Your Tracker.

LifeTrack is a full-stack personal productivity application designed to help users manage their daily activities in one place. It combines task management, habit tracking, note-taking, expense tracking, and reminders through a clean, minimal black-and-white interface.

**Developed by K. Jeevan Kumar**

---

## Screenshots

### Registration

![Registration Screen](screenshots/register.png)

### Login

![Login Screen](screenshots/login.png)


### Dashboard

![LifeTrack Dashboard](screenshots/dashboard.png)

### Dashboard Overview

![Dashboard Overview](screenshots/dashboard-overview.png)

### Task Management

![Task Management](screenshots/tasks.png)

### Expense Tracking

![Expense Tracking](screenshots/expenses.png)





---

## Features

- **Authentication:** User registration and login using JWT authentication.
- **Dashboard:** View tasks, habits, expenses, notes, and reminders in one place.
- **Task Management:** Create, update, delete, filter, and complete tasks.
- **Habit Tracking:** Track daily habits, completion progress, and streaks.
- **Notes Management:** Create, edit, search, pin, and delete notes.
- **Expense Tracking:** Record income and expenses, manage categories, and view balances.
- **Reminders:** Create reminders and manage their completion status.
- **Cross-Platform:** Android and Web support using React Native and Expo.
- **Minimal UI:** Modern black-and-white interface inspired by Uber's design language.

---

## Tech Stack

### Backend

- C#
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core
- PostgreSQL
- JWT Authentication

### Frontend

- React Native
- Expo
- TypeScript
- React Navigation
- Axios

### Tools & Platforms

- Git
- GitHub
- Postman
- Visual Studio Code
- Linux

---

## Project Structure

```text
LifeTrack/
│
├── backend/
│   └── LifeTrack.API/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── ProfileController.cs
│       │   ├── TasksController.cs
│       │   ├── HabitsController.cs
│       │   ├── NotesController.cs
│       │   ├── ExpensesController.cs
│       │   ├── RemindersController.cs
│       │   └── DashboardController.cs
│       │
│       ├── Models/
│       ├── DTOs/
│       ├── Data/
│       ├── Services/
│       ├── Program.cs
│       └── LifeTrack.API.csproj
│
├── LifeTrack.Mobile/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── habits/
│   │   │   ├── notes/
│   │   │   └── expenses/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── screenshots/
│   ├── dashboard.png
│   ├── dashboard-overview.png
│   ├── tasks.png
│   ├── expenses.png
│   ├── login.png
│   └── register.png
│
├── .gitignore
└── README.md
```


## Getting Started

Follow these steps to run LifeTrack locally.

### Prerequisites

Install the following:

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Git](https://git-scm.com/)
- Android Studio (optional, for Android emulator)

### 1. Clone the Repository

```bash
git clone https://github.com/jeevankumar812/LifeTrack.git

cd LifeTrack


2. Database Setup
Make sure PostgreSQL is running.

Create the database:
CREATE DATABASE lifetrack_db;


Configure your PostgreSQL connection string and JWT settings in your local backend configuration.

Do not commit passwords or JWT secrets to GitHub.
3. Run the Backend (.NET 10)
Open Terminal 1:
cd LifeTrack/backend/LifeTrack.API

dotnet restore

dotnet build

dotnet run --urls http://0.0.0.0:5000


Backend API:
http://localhost:5000


The backend runs on port 5000.
4. Configure the Frontend API URL
Open:
LifeTrack.Mobile/src/config/api.ts


Configure the API URL based on where you are running the application:
Platform	API URL
Web browser	http://localhost:5000/api
Android emulator	http://10.0.2.2:5000/api
Physical Android device	http://YOUR_COMPUTER_IP:5000/api

For a physical Android device, both your phone and computer should be connected to the same Wi-Fi network.
5. Run the Frontend (React Native + Expo)
Open Terminal 2:
cd LifeTrack/LifeTrack.Mobile

npm install

npx expo start


6. Run on Different Platforms
Run on Web:
npx expo start --web


Open the URL displayed in your terminal, usually:
http://localhost:8081


Run on Android:
npx expo start


- Press a to open the Android emulator.
- Or scan the QR code using Expo Go on your Android phone.
7. Access the Application
Service	URL
Backend API	http://localhost:5000
Frontend Web	http://localhost:8081

Important: Start the backend before using the frontend. The application requires a running API and configured PostgreSQL database.
