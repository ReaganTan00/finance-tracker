# RightNow Rinance Tracker

A cross-platform personal finance tracking mobile application for managing individual and shared budgets, built with React Native and Spring Boot.

---

## 📱 Overview

**Purpose:** Personal finance tracking application for you and your partner to manage budgets, track expenses, monitor subscriptions, and collaborate on shared expenses across Android and iOS devices.

**Key Features:**
- 💰 Budget planning with categories and sub-categories
- 📊 Transaction tracking and analytics
- 🔄 Recurring transactions and subscription management
- 👥 Shared budgets and collaborative ledgers
- 📅 Budget calendar view
- 📈 Interactive charts and spending insights
- 🔔 Real-time updates via WebSocket

---

## 🛠️ Tech Stack

### **Frontend (Mobile)**
```
Framework:        React Native 0.72+ with Expo SDK 49+
Language:         TypeScript 5.0+
Navigation:       React Navigation v6
State Management: Zustand + React Query (TanStack Query)
UI Components:    React Native Paper, NativeBase
Charts:           Victory Native
Real-time:        @stomp/stompjs, SockJS Client
Storage:          AsyncStorage, Expo SecureStore
HTTP Client:      Axios
Forms:            React Hook Form + Zod validation
Build:            Expo EAS (Expo Application Services)
```

### **Backend (API Server)**
```
Framework:        Spring Boot 3.2+
Language:         Java 21 (LTS)
Build Tool:       Maven 3.9+
ORM:              Spring Data JPA
Database Driver:  PostgreSQL JDBC Driver
Security:         Spring Security 6 + JWT
Real-time:        Spring WebSocket (STOMP)
Validation:       Spring Validation
Utilities:        Lombok, MapStruct
API Docs:         Springdoc OpenAPI 3 (Swagger)
Migration:        Flyway
Testing:          JUnit 5, Mockito, Spring Boot Test
```

### **Database**
```
Service:          Supabase (Managed PostgreSQL)
Version:          PostgreSQL 15.x
Features:         Automatic backups, Connection pooling, SSL encryption
```

### **Infrastructure & Deployment**
```
Hosting:          Oracle Cloud Infrastructure (OCI) - Free Tier
Compute:          ARM-based (Ampere A1) - 2 vCPUs, 12GB RAM
Container:        Docker + Docker Compose
Reverse Proxy:    Nginx (optional)
SSL/TLS:          Let's Encrypt + Certbot
```

### **Development Tools**
```
IDEs:             IntelliJ IDEA Community (Backend), VS Code (Frontend)
Version Control:  Git + GitHub
API Testing:      Postman / Insomnia
Mobile Testing:   Expo Go, Android Studio, Xcode (Mac only)
Database Client:  DBeaver / pgAdmin / Supabase Dashboard
```

---

## 📋 Prerequisites

### **Backend Requirements**
- ☕ **Java 21** (JDK) - [Download](https://adoptium.net/temurin/releases/?version=21)
- 📦 **Maven 3.9+** - [Download](https://maven.apache.org/download.cgi)
- 🐳 **Docker Desktop** (optional, for containerization) - [Download](https://www.docker.com/products/docker-desktop/)
- 🗄️ **PostgreSQL** or **Supabase Account** - [Supabase](https://supabase.com)
- 💻 **IntelliJ IDEA Community** (recommended) - [Download](https://www.jetbrains.com/idea/download/)

### **Frontend Requirements**
- 🟢 **Node.js 20.x+** and **npm** - [Download](https://nodejs.org/)
- 📱 **Expo CLI** - Installed via npm
- 🤖 **Android Studio** (for Android emulator) - [Download](https://developer.android.com/studio)
- 🍎 **Xcode** (Mac only, for iOS simulator) - [App Store](https://apps.apple.com/app/xcode/id497799835)
- 📲 **Expo Go App** (on physical device) - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- 💻 **Visual Studio Code** (recommended) - [Download](https://code.visualstudio.com/)

### **Verify Installations**
```bash
# Java
java -version        # Should show: openjdk version "21.x.x"
javac -version       # Should show: javac 21.x.x

# Maven
mvn -version         # Should show: Apache Maven 3.9.x

# Node.js & npm
node --version       # Should show: v20.x.x
npm --version        # Should show: 10.x.x

# Expo
npx expo --version   # Should show: ~50.x.x

# Docker (optional)
docker --version     # Should show: Docker version 24.x.x

# Android SDK (optional)
adb --version        # Should show: Android Debug Bridge version x.x.x
```

---

## 🚀 Getting Started

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

---

## 🖥️ Backend Setup

### **1. Navigate to Backend Directory**

```bash
cd backend/finance-tracker-api
```

### **2. Configure Database**

#### **Option A: Using Supabase (Recommended)**

1. Create a Supabase account at https://supabase.com
2. Create a new project named `finance-tracker`
3. Go to **Settings → Database** and copy your connection details
4. Create `src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: Finance-Tracker
  
  datasource:
    url: jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
    username: postgres.[your-project-ref]
    password: your-supabase-password
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: 8080

logging:
  level:
    root: INFO
    com.finance.tracker: DEBUG
```

#### **Option B: Using Local PostgreSQL**

1. Install PostgreSQL 16+
2. Create database:
```sql
CREATE DATABASE finance_tracker;
```
3. Update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/finance_tracker
    username: postgres
    password: your-postgres-password
```

### **3. Install Dependencies**

```bash
# Using Maven Wrapper (recommended)
./mvnw clean install

# Or using installed Maven
mvn clean install
```

### **4. Run the Backend**

#### **Option A: Using Maven**
```bash
./mvnw spring-boot:run
```

#### **Option B: Using IntelliJ IDEA**
1. Open `finance-tracker-api` folder in IntelliJ IDEA
2. Wait for Maven to download dependencies
3. Find `FinanceTrackerApiApplication.java`
4. Click the green ▶ button next to `main()` method

#### **Option C: Using JAR**
```bash
# Build JAR
./mvnw clean package -DskipTests

# Run JAR
java -jar target/tracker-0.0.1-SNAPSHOT.jar
```

### **5. Verify Backend is Running**

```bash
# Check health endpoint (if actuator is enabled)
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

Open browser: http://localhost:8080
- You should see a **Whitelabel Error Page** (this is normal - no endpoints yet!)

### **Backend Environment Variables (Optional)**

For production or custom configurations:

```bash
# Linux/Mac
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=jdbc:postgresql://...
export DATABASE_USER=postgres
export DATABASE_PASSWORD=your-password
export JWT_SECRET=your-secret-key

# Windows (PowerShell)
$env:SPRING_PROFILES_ACTIVE="prod"
$env:DATABASE_URL="jdbc:postgresql://..."
$env:DATABASE_USER="postgres"
$env:DATABASE_PASSWORD="your-password"
$env:JWT_SECRET="your-secret-key"
```

---

## 📱 Frontend Setup

### **1. Navigate to Frontend Directory**

```bash
cd mobile
# or from project root:
cd ../mobile
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Configure API Endpoint**

Create `src/constants/config.ts`:

```typescript
// For local development
export const API_BASE_URL = 'http://localhost:8080/api/v1';
export const WS_BASE_URL = 'http://localhost:8080/ws';

// For Android Emulator (if backend is on host machine)
// export const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';

// For physical device on same network
// export const API_BASE_URL = 'http://192.168.1.100:8080/api/v1';
```

### **4. Run the Frontend**

```bash
# Start Expo development server
npm start

# Or specifically for a platform:
npm run android    # For Android emulator
npm run ios        # For iOS simulator (Mac only)
npm run web        # For web browser
```

### **5. Open on Device/Emulator**

#### **Physical Device (Easiest)**
1. Install **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. App will load automatically

#### **Android Emulator**
1. Start Android Studio
2. Open AVD Manager
3. Start an emulator (e.g., Pixel 5)
4. Press `a` in the Expo terminal
5. App will open in emulator

#### **iOS Simulator (Mac only)**
1. Ensure Xcode is installed
2. Press `i` in the Expo terminal
3. App will open in iOS Simulator

### **Frontend Environment Variables (Optional)**

Create `.env`:

```bash
API_URL=http://localhost:8080/api/v1
WS_URL=http://localhost:8080/ws
```

---

## 📖 API Documentation

Once the backend is running, access the Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

This provides interactive API documentation and testing.

---

## 🧪 Running Tests

### **Backend Tests**

```bash
cd backend/finance-tracker-api

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=BudgetServiceTest

# Run with coverage
./mvnw clean test jacoco:report
```

### **Frontend Tests**

```bash
cd mobile

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- BudgetCard.test.tsx
```

---

## 📁 Project Structure

```
finance-tracker/
├── backend/
│   └── finance-tracker-api/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/finance/tracker/
│       │   │   │   ├── controller/
│       │   │   │   ├── service/
│       │   │   │   ├── repository/
│       │   │   │   ├── entity/
│       │   │   │   ├── dto/
│       │   │   │   ├── config/
│       │   │   │   ├── security/
│       │   │   │   └── FinanceTrackerApiApplication.java
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       └── db/migration/
│       │   └── test/
│       ├── pom.xml
│       └── Dockerfile
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── theme/
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
├── .gitignore
└── README.md
```

---

## 🌐 Default Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8080 | http://localhost:8080 |
| Swagger UI | 8080 | http://localhost:8080/swagger-ui.html |
| Expo Metro | 19000 | http://localhost:19000 |
| Expo DevTools | 19002 | http://localhost:19002 |
| PostgreSQL | 5432 | localhost:5432 |
| Supabase | 6543 | (SSL required) |

---

## 📚 Useful Commands

### **Backend**
```bash
# Clean build
./mvnw clean install

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Package as JAR
./mvnw clean package -DskipTests

# Run tests only
./mvnw test

# Skip tests during build
./mvnw clean install -DskipTests
```

### **Frontend**
```bash
# Start development server
npm start

# Clear cache and start
npx expo start -c

# Run on specific platform
npm run android
npm run ios

# Install new package
npm install <package-name>

# Update dependencies
npm update

# Build for production (requires EAS)
eas build --platform android
eas build --platform ios
```

---

## 👨‍💻 Authors

- **Reagan Tan** - Initial work
