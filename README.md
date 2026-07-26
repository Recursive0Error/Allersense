# 🩺 AllerSense

> **Track. Detect. Prevent.**
>
> AllerSense is an AI-assisted mobile application that helps users identify potential food allergies by tracking their daily meals, recording allergic reactions, and analyzing correlations between food consumption and symptoms.

---

# 📖 Table of Contents

- Overview
- Features
- How It Works
- Screens
- Tech Stack
- Project Structure
- Project Architecture
- Code Explanation
- Installation
- Future Scope
- AI Prediction Logic
- Privacy
- Team
- Disclaimer
- License

---

# 📱 Overview

Food allergies affect millions of people worldwide, yet many individuals struggle to identify the exact foods causing their reactions.

AllerSense is a cross-platform mobile application developed using **React Native** and **Expo** that enables users to:

- Record daily meals
- Log allergy symptoms
- Detect possible food triggers
- View personalized health insights
- Monitor allergy history

Instead of relying on guesswork, AllerSense uses correlation analysis and probability-based logic to identify foods that may be responsible for allergic reactions.

---

# ✨ Features

## 👤 User Authentication

- Login
- Signup
- Profile Management

## 🍽 Food Diary

- Record meals
- Timestamp every entry
- Edit & Delete entries

## 🤒 Symptom Logger

- Log allergic reactions
- Record severity
- Timestamp symptoms

## 🧠 AI-Assisted Detection

- Food-Symptom Correlation
- Trigger Score Calculation
- Allergy Pattern Detection

## 📊 Insights Dashboard

- High Risk Foods
- Safe Foods
- Statistics
- Personalized Recommendations

## 👤 User Profile

- Age
- Blood Group
- Known Allergies
- Medical Information

---

# 🏗 Project Architecture

```
                 User

                   │

                   ▼

             Expo Router

                   │

                   ▼

              App Screens

                   │

                   ▼

          Reusable Components

                   │

                   ▼

             React Context API

          ┌────────────────────┐
          │                    │
          ▼                    ▼

     AuthContext         DataContext

          │                    │
          └──────────┬─────────┘
                     │
                     ▼

            Business Logic Layer

                     │
                     ▼

              AsyncStorage

                     │
                     ▼

        Correlation Engine (AI)

                     │
                     ▼

           Insights Dashboard
```

---

# 📂 Project Structure

```text
AllerSense
│
├── app/
│   ├── login.tsx
│   ├── signup.tsx
│   ├── home.tsx
│   ├── allergy-setup.tsx
│   ├── food-diary.tsx
│   ├── symptoms.tsx
│   ├── insights.tsx
│   ├── profile.tsx
│   └── _layout.tsx
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── calendar/
│   │   └── cards/
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx
│   │
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── assets/
├── App.tsx
└── README.md
```

---

# 💻 Code Explanation

## Authentication

**Files**

```
AuthContext.tsx
login.tsx
signup.tsx
```

Handles:

- User Registration
- Login
- Logout
- Session Management
- Profile Updates

Workflow

```
Signup
   ↓
Store User
   ↓
Login
   ↓
Home
```

---

## Data Management

**File**

```
DataContext.tsx
```

This file acts as the application's central data manager.

It stores:

- Food Entries
- Symptom Logs
- Allergy Patterns
- Statistics
- Insights

Every screen communicates through DataContext instead of managing separate copies of the data.

---

## Food Diary

Stores every meal consumed.

Each record contains:

```ts
{
    id,
    foodName,
    quantity,
    date,
    time
}
```

Supports

- Add
- Edit
- Delete
- View History

---

## Symptom Logger

Stores allergic reactions.

```ts
{
    id,
    symptomName,
    severity,
    date,
    time
}
```

Supports

- Add
- Edit
- Delete

---

## Pattern Detection Engine

This is the intelligence behind AllerSense.

The engine compares

- Foods eaten
- Symptom time
- Reaction window
- Number of repeated occurrences

to determine whether a food is likely responsible for an allergic reaction.

---

### Trigger Score

```
Trigger Score

=

Reaction Count
────────────── ×100
Total Times Consumed
```

Example

```
Milk

Consumed = 10

Symptoms = 8

Trigger Score

80%
```

Status

```
0-29%

↓

Safe

30-59%

↓

Suspected

60-100%

↓

High Risk
```

---

## Local Database

The prototype uses

```
AsyncStorage
```

to save

- User
- Food Diary
- Symptoms
- Insights

Advantages

- Offline
- Fast
- No internet required

---

## Navigation

The application uses **Expo Router**.

Navigation Flow

```
Splash

↓

Login

↓

Signup

↓

Profile Setup

↓

Home

↓

Food Diary

↓

Symptoms

↓

Insights

↓

Profile
```

---

## Reusable Components

Examples

- Buttons
- Input Fields
- Cards
- Bottom Navigation
- Food Cards
- Symptom Cards
- Profile Components

This keeps the project modular and easy to maintain.

---

# 🔄 Application Flow

```
Launch App

      │

      ▼

Authentication

      │

      ▼

Create Profile

      │

      ▼

Home Dashboard

      │

 ┌────┴─────┐

 ▼          ▼

Food      Symptoms

Diary      Logger

 └────┬─────┘

      ▼

AI Correlation Engine

      ▼

Probability Calculation

      ▼

Insights Dashboard
```

---

# 🧠 AI Prediction Logic

The application follows these steps:

1. User logs food.
2. User logs symptoms.
3. The system checks the time difference.
4. Foods eaten within the reaction window become candidates.
5. Repeated matches increase the trigger score.
6. Foods are classified as:

- ✅ Safe
- ⚠ Suspected
- 🚨 High Risk

> **Note:** AllerSense does not diagnose medical conditions. It provides data-driven insights to help users recognize patterns and should not replace professional medical advice.

---

# 🚀 Installation

```bash
git clone https://github.com/yourusername/AllerSense.git

cd AllerSense

npm install

npx expo start
```

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile app |
| Expo | Development platform |
| TypeScript | Type safety |
| Expo Router | Navigation |
| React Context API | State management |
| AsyncStorage | Local storage |
| React Hooks | State & lifecycle |
| Probability-based Analysis | Allergy detection |

---

# 🔮 Future Scope

- Barcode Scanner
- OCR Ingredient Detection
- Cloud Backup
- Push Notifications
- AI Chatbot
- Hospital Integration
- Nutrition Analysis
- Restaurant Recommendations
- Smart Wearable Support

---

# 🔒 Privacy

- All data is stored locally using AsyncStorage.
- No personal information is shared with third parties.
- Future versions may support encrypted cloud synchronization.

---

# 👨‍💻 Team

**AllerSense Team**

Developed as a College Innovation & Health Technology Project.

---

# ⚠ Disclaimer

AllerSense is intended for educational and informational purposes only.

It should not be considered a substitute for professional medical advice, diagnosis, or treatment.

---

# 📄 License

Licensed under the **MIT License**.

---

# ⭐ Support

If you found this project helpful:

⭐ Star the repository

🍴 Fork the project

🐛 Report issues

💡 Suggest improvements

Contributions are always welcome!

---

> **"Track your meals today, understand your allergies tomorrow."**
