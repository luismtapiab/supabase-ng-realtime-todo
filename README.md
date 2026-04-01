# 🚀 Realtime Todo with Supabase & Angular

A modern, high-performance Todo application built with **Angular 21** and **Supabase**, featuring real-time synchronization, secure authentication, and a clean UI powered by **Pico.css**.

---

## ✨ Features

- **Real-time Sync**: Todos update instantly across all clients using Supabase Realtime Broadcast.
- **Secure Authentication**: User login and registration using Supabase Auth.
- **Row Level Security (RLS)**: Data protection ensuring users only manage their own todos.
- **User Discovery**: Login with a list of already registered usernames.
- **Health Checks**: Integrated database connectivity verification.

---

## 🛠️ Tech Stack

- **Frontend**: [Angular v21](https://angular.dev/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Styling**: [Pico.css](https://picocss.com/)
- **State Management**: [RxJS](https://rxjs.dev/)

---

## ⚙️ Supabase Configuration

To get this project running with your own Supabase instance, follow these configuration steps:

### 1. Database Schema & Migrations
All database structures, including tables, functions, and triggers, are located in the `supabase/migrations` directory. Run these in your Supabase SQL Editor in the following order (better if you use the supabase cli):

1. `20260318020824_initial_structure.sql`: Creates core `todos` table and `db_is_alive` function.
2. `20260330102252_authenticated_access.sql`: Adds `user_id` to todos and implements strict RLS policies.
3. `20260330113500_get_usernames.sql`: Adds RPC to fetch registered usernames.
4. `20260330114000_update_usernames_rpc.sql`: Updates user metadata handling.

### 2. Enable Realtime
The application uses a custom broadcast trigger. Ensure that:
- The `handle_your_table_changes` trigger is active on the `todos` table (applied via migrations).
- Realtime is enabled for your project in the Supabase Dashboard (**Database -> Replication -> Source: public**).

### 3. Row Level Security (RLS)
RLS is mandatory for this project to function securely. The migrations set up the following:
- **Select**: Authenticated users can see all todos.
- **Insert/Update/Delete**: Users can only modify todos where `user_id` matches their own `auth.uid()`.
- **Realtime**: Policies for `realtime.messages` are included to allow authenticated users to receive broadcasts.

### 4. Auth Settings
For a smooth onboarding experience:
- Go to **Authentication -> Settings -> Email Auth**.
- **Disable "Confirm email"** to allow users to sign in immediately after registration without needing to verify an email address.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/luismtapiab/supabase-ng-realtime-todo.git
cd realtime-todo
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (or use `.env.local`) with your Supabase credentials:

```env
NG_APP_API_URL=https://your-project-ref.supabase.co
NG_APP_ANON_KEY=your-anon-public-key
```

> [!IMPORTANT]
> The variables must be prefixed with `NG_APP_` for the `@ngx-env/builder` to recognize them.

### 3. Run Development Server
```bash
npm run ng serve
```
Navigate to `http://localhost:4200/`.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
