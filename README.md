<<<<<<< HEAD
# 🎓 SkillSwap — Student Skill-Exchange Full-Stack Application

**SkillSwap** is a complete, production-minded peer-to-peer student skill-exchange web application built with **Java 21**, **Spring Boot 3.4.x**, **TiDB Cloud (Distributed MySQL-compatible SQL)**, and **React + Vite**. It enables university students to discover peers, exchange complementary skills, book 1-on-1 learning sessions, and engage in authenticated real-time private messaging over WebSocket (STOMP).

---

## 🛠️ Tech Stack

### 🚀 Frontend
- **Framework**: React with Vite
- **Language**: JavaScript (ESModules) & JSX
- **Styling**: Tailwind CSS & Glassmorphism design system
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios with central token interceptors
- **Icons**: Lucide React
- **Real-Time Messaging**: `@stomp/stompjs` + `sockjs-client`

### ⚙️ Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.4.3 (Maven)
- **Security**: Spring Security 6 with BCrypt password hashing & JJWT (HMAC-SHA256)
- **Persistence**: Spring Data JPA with Hibernate
- **Real-Time Broker**: Spring WebSocket with STOMP message broker (`/ws`, `/app`, `/user/queue/messages`)
- **Driver**: `com.mysql.cj.jdbc.Driver` (MySQL Connector/J)
- **Validation**: Spring Validation (Jakarta Validation)
- **Testing**: JUnit 5, Spring Boot Test, MockMvc, H2 in-memory test database

### ☁️ Database
- **Engine**: **TiDB Cloud** (Serverless / Dedicated Distributed MySQL protocol)
- **Port**: 4000
- **TLS/SSL**: `sslMode=VERIFY_IDENTITY`
- **Dialect**: `org.hibernate.dialect.MySQLDialect`

---

## 📂 Project Architecture

```
SkillSwapWebsite/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/skillswap/
│   │   │   │   ├── config/          # SecurityConfig, WebSocketConfig, DataInitializer
│   │   │   │   ├── controller/      # Auth, User, SkillRequest, Message, Session, Availability, DNA, Passport, Admin
│   │   │   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   │   │   ├── entity/          # User, UserSkill, SkillRequest, Message, Availability, SkillSession, Feedback
│   │   │   │   ├── exception/       # GlobalExceptionHandler, Custom Exceptions
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   ├── security/        # JwtTokenProvider, JwtAuthFilter, UserPrincipal, UserDetailsService
│   │   │   │   ├── service/         # AuthService, UserService, MessageService, SessionService, DnaService, etc.
│   │   │   │   ├── websocket/       # WebSocketAuthInterceptor (STOMP JWT Interceptor)
│   │   │   │   └── BackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties # TiDB connection config
│   │   └── test/                    # JUnit 5 Integration Test Suite
│   ├── .env.example
│   ├── mvnw / mvnw.cmd
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Sidebar, Modals, Badges
│   │   ├── context/                 # AuthContext, SocketContext
│   │   ├── pages/                   # Login, Register, Dashboard, Discover, Messages, Sessions, Availability,
│   │   │                            # SkillDNA, SkillPassport, SwapPoints, Subscription, Profile, Admin
│   │   ├── services/                # api.js (Axios), websocket.js (STOMP Client)
│   │   ├── App.jsx                  # React Router routes
│   │   ├── main.jsx                 # Entrypoint
│   │   └── index.css                # Tailwind + Glassmorphic CSS tokens
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## ☁️ TiDB Cloud Database Setup

1. Log into your **[TiDB Cloud Console](https://tidbcloud.com/)**.
2. Create or select your cluster (Serverless is free and instant).
3. Click **Connect** and select **MySQL Driver (Java)**.
4. Note your Host (e.g. `gateway01.us-east-1.prod.aws.tidbcloud.com`), Port (`4000`), Database Name (`skillswap`), Username, and Password.
5. Create database `skillswap` if it does not already exist:
   ```sql
   CREATE DATABASE IF NOT EXISTS skillswap;
   ```
6. Your JDBC URL format will be:
   ```
   jdbc:mysql://YOUR_TIDB_HOST:4000/skillswap?sslMode=VERIFY_IDENTITY&useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
   ```

---

## 💻 IntelliJ IDEA Setup & Run Configuration

### 1. Import Project
1. Open **IntelliJ IDEA**.
2. Select **File** ➔ **Open...** ➔ Select the `backend/pom.xml` file (or `backend` folder).
3. Choose **Open as Project**.
4. In **Project Structure** (`Ctrl + Alt + Shift + S` or `Cmd + ;`):
   - **Project SDK**: Select **Java 21**.
   - **Language Level**: Select **21 - Records, Pattern matching, etc.**

### 2. Configure Environment Variables in IntelliJ
1. In the top toolbar, click the Run Configuration dropdown (next to the green Run icon) ➔ **Edit Configurations...**.
2. Select **Spring Boot** ➔ **BackendApplication** (or click `+` ➔ Spring Boot ➔ Main class: `com.skillswap.BackendApplication`).
3. Click on **Modify options** (if environment variables are hidden) ➔ Check **Environment variables**.
4. Paste the following into the **Environment variables** field (replace with your TiDB Cloud values):
   ```env
   DB_URL=jdbc:mysql://YOUR_TIDB_HOST:4000/YOUR_DATABASE?sslMode=VERIFY_IDENTITY&useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true;DB_USERNAME=your_username;DB_PASSWORD=your_password;JWT_SECRET=SkillSwapSuperSecretKeyReplaceInProductionWith32BytesLongSecret2026!
   ```
5. Click **Apply** and **OK**.
6. Click the green **Run** button (`Shift + F10`) to start the backend!

---

## 🖥️ Running Locally from Terminal

### Backend

To run using Maven from terminal:
```bash
# Windows PowerShell
$env:DB_URL="jdbc:mysql://YOUR_TIDB_HOST:4000/YOUR_DATABASE?sslMode=VERIFY_IDENTITY&useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="your_username"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="SkillSwapSuperSecretKeyReplaceInProductionWith32BytesLongSecret2026!"

cd backend
mvn spring-boot:run
```

The backend server runs on `http://localhost:8080`.

### Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Automated Testing

The backend includes a comprehensive JUnit 5 integration test suite covering authentication, duplicate request prevention, messaging persistence, and concurrent booking isolation:

```bash
cd backend
mvn test
```

### Verified Test Scenarios:
1. `AuthAndUserWorkflowTest`:
   - Independent User A & User B registration and login.
   - Duplicate email registration rejection (`409 Conflict`).
   - Profile identity verification via `/api/auth/me` with JWT isolation.
2. `SkillExchangeWorkflowTest`:
   - User A sends exchange request to User B.
   - User B receives request in `/api/skill-requests/received`.
   - User B accepts request (`200 OK`).
   - Unauthorized User C attempt to accept request is blocked (`403 Forbidden`).
   - Duplicate pending request between same users is rejected (`409 Conflict`).
3. `MessagingAndConversationTest`:
   - User A sends private message to User B.
   - Message persisted in TiDB with timestamp and read status.
   - History loaded via `/api/messages/{userBId}`.
   - Conversations sidebar loaded with partner info and unread counts.
4. `SessionBookingAndConcurrencyTest`:
   - Mentor publishes availability slot.
   - Learner 1 books slot.
   - Concurrent booking by Learner 2 for the same slot is rejected (`409 Conflict`).
   - Mentor accepts session and generates meeting room.
   - Session completed and SwapPoints credited to mentor.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new student account (Awards 100 welcome SwapPoints) |
| `POST` | `/api/auth/login` | Authenticate with email & password, returns JWT |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile and skills |

### Peer Discovery & Profiles (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/discover` | Search peers by query/skill with real compatibility score (excludes self) |
| `GET` | `/api/users/{id}` | Get specific student profile |
| `PUT` | `/api/users/profile` | Update bio, avatar, and teach/learn skill matrix |

### Skill Exchange Requests (`/api/skill-requests`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/skill-requests` | Send skill exchange request (notifies recipient via STOMP) |
| `GET` | `/api/skill-requests/received` | Get incoming exchange requests |
| `GET` | `/api/skill-requests/sent` | Get outgoing exchange requests |
| `PATCH` | `/api/skill-requests/{id}/accept` | Accept exchange request |
| `PATCH` | `/api/skill-requests/{id}/reject` | Reject exchange request |

### Real-Time Messaging (`/api/messages`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/messages` | Save message to TiDB and deliver over STOMP `/user/queue/messages` |
| `GET` | `/api/messages/{userId}` | Load complete conversation history between authenticated user and partner |
| `GET` | `/api/messages/conversations` | Get active contacts with preview, timestamp, and unread counts |
| `GET` | `/api/messages/unread-count` | Get total unread messages count |
| `PATCH` | `/api/messages/{partnerId}/read`| Mark conversation as read |

### Availability Slots (`/api/availability`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/availability` | Publish tutoring availability slot with concurrency lock |
| `GET` | `/api/availability` | Get public upcoming availability slots |
| `GET` | `/api/availability/my` | Get current user's published slots |
| `DELETE` | `/api/availability/{id}` | Delete unbooked slot |

### Learning Sessions (`/api/sessions`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sessions` | Request/Book a learning session (prevents double-booking) |
| `GET` | `/api/sessions/my` | Get user's upcoming and completed sessions |
| `PATCH` | `/api/sessions/{id}/accept` | Mentor accepts booking (generates meeting room) |
| `PATCH` | `/api/sessions/{id}/reject` | Mentor rejects booking |
| `PATCH` | `/api/sessions/{id}/cancel` | Cancel session |
| `PATCH` | `/api/sessions/{id}/complete` | Mark session completed (awards +50 SP to mentor) |
| `POST` | `/api/sessions/feedback` | Post 5-star rating and review |

### Skill DNA & Skill Passport
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/skill-dna/my` | Algorithmic skill breakdown, versatility score, strengths, and recommendations |
| `GET` | `/api/skill-passport/my` | Verifiable digital credential, completed swaps, milestone badges |
| `GET` | `/api/points/my` | SwapPoints balance and TiDB transaction ledger |
| `POST` | `/api/points/claim-daily` | Claim daily streak bonus (+15 SP) |
| `GET` | `/api/admin/stats` | System metrics (Role `ROLE_ADMIN` required) |

---

## ⚡ WebSocket STOMP Protocol

- **Handshake Endpoint**: `/ws` (with SockJS fallback)
- **STOMP Application Prefix**: `/app`
- **User Destination Prefix**: `/user`
- **Private Messages Queue**: `/user/queue/messages`
- **Real-Time Notifications Queue**: `/user/queue/notifications`
- **Authentication**: JWT token sent in STOMP `CONNECT` native headers (`Authorization: Bearer <token>`).

---

## 👥 Multi-User Testing Guide

1. **User A**: Open browser tab at `http://localhost:5173/register` and register as `alice@university.edu`.
2. **User B**: Open an Incognito window at `http://localhost:5173/register` and register as `bob@university.edu`.
3. In User A's window, navigate to **Discover**. User B appears with dynamic skill compatibility score.
4. User A clicks **Exchange** to send a skill exchange request.
5. In User B's incognito window, a real-time notification banner appears instantly via WebSocket without refreshing.
6. User B accepts the request.
7. User A opens **Messages**, types a message to User B, and clicks Send.
8. User B receives the message instantly in real time over STOMP! Both messages are persisted in TiDB and load upon refreshing or reconnecting.
=======
# SkillSwapWebsite
SkillSwap skill exchange application
>>>>>>> b302a099937382beac73a1b5c7b544401a7f2d0d
