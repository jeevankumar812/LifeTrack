# LifeTrack

### Your Life. Your Goals. Your Tracker.

LifeTrack is a full-stack personal productivity application designed to help users manage their daily activities in one place. It combines task management, habit tracking, note-taking, expense tracking, and reminders through a clean, minimal black-and-white interface.

**Developed by K. Jeevan Kumar**

---

## Screenshots

### Dashboard

![LifeTrack Dashboard](screenshots/dashboard.png)

### Dashboard Overview

![Dashboard Overview](screenshots/dashboard-overview.png)

### Task Management

![Task Management](screenshots/tasks.png)

### Expense Tracking

![Expense Tracking](screenshots/expenses.png)

### Login

![Login Screen](screenshots/login.png)

### Registration

![Registration Screen](screenshots/register.png)

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
