# Chirkut - Finance Tracker

A simple, self-hosted expense tracking application built specifically for roommates to manage shared expenses, settlements, and financial balances. Track household expenses, split costs, and keep your finances organized.

> I built this for personal-use, feel free to fork & customize to suit yourself.

## ✨ Features

- **Multi-User Support** - Configurable for any number of roommates
- **Expense Tracking** - Log expenses with categories, amounts, and notes
- **Category Management** - Predefined categories (Rent, Gas, Electricity, Groceries, etc.)
- **Balance Calculation** - Automatic calculation of who owes whom
- **Settlement Tracking** - Record payments between roommates
- **Reports & Analytics** - Visual reports and spending insights
- **Secure Authentication** - PIN-based authentication with bcrypt hashing for security
- **Self-Hosted** - Full control over your data and deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: PIN-based with bcrypt hashing
- **Charts**: Recharts for data visualization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database (local or hosted)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd buddha
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL database connection URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/chirkut"
```

Replace `username`, `password`, `localhost:5432`, and `chirkut` with your actual database credentials.

### 4. Configure Users

Create a `config.json` file in the project root by copying the example:

```bash
cp config.example.json config.json
```

Edit `config.json` to add your roommates:

```json
{
  "users": [
    {
      "name": "Alice",
      "pin": "123456"
    },
    {
      "name": "Bob",
      "pin": "234567"
    },
    {
      "name": "Charlie",
      "pin": "345678"
    }
  ]
}
```

- **users**: Array of roommates with their names and 6-digit PINs

> **⚠️ Security Note**: PINs are stored in plaintext in `config.json` but are hashed with bcrypt before being saved to the database. Keep `config.json` secure and never commit it to version control (it's already in `.gitignore`). The `DB_RESET_PIN` is stored in your `.env` file and should also be kept secure.

### 5. Set Up the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate deploy
```

### 6. Seed the Database

Populate the database with your configured users:

```bash
npm run prisma db seed
# or
npx prisma db seed
```

This will create user accounts based on your `config.json` file.

### 7. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be greeted with the login page where you can enter your 6-digit PIN to access the app.

## 📖 Usage Guide

### Logging In

1. Navigate to the login page
2. Enter your 6-digit PIN
3. The app will automatically identify you and log you in

### Adding an Expense

1. From the dashboard, click "Add Expense"
2. Fill in the expense details:
   - Title (e.g., "Electricity Bill")
   - Amount
   - Date
   - Category (Rent, Gas, Electricity, etc.)
   - Notes (optional)
3. Submit the expense - it will be recorded under your name

### Recording a Settlement

1. Navigate to the "Settlements" page
2. Click "Add Settlement"
3. Select who is paying whom
4. Enter the amount
5. Submit - balances will update automatically

### Viewing Balances

The dashboard displays current balances showing who owes whom. Balances are calculated automatically based on expenses and settlements.

### Viewing Reports

Navigate to the "Reports" page to see:
- Expense trends over time
- Category-wise spending breakdown
- Per-user expense analysis

### Database Reset

If you need to clear all expenses and settlements (keeps users intact):

1. Navigate to the settings/database page
2. Enter the `DB_RESET_PIN` configured in your `.env` file
3. Confirm the reset

## 🎯 Configuration

### Adding/Removing Users

1. Edit `config.json` and add/remove users from the `users` array
2. Run the seed script again: `npx prisma db seed`
3. Users will be created/removed in the database

### Changing PINs

1. Edit `config.json` and update the PIN for a user
2. Run the seed script again: `npx prisma db seed`
3. The user's PIN will be updated (re-hashed)

### Customizing Categories

Categories are defined in the Prisma schema (`prisma/schema.prisma`). To add custom categories:

1. Edit the `Category` enum in `schema.prisma`
2. Create a new migration: `npx prisma migrate dev --name add-custom-categories`
3. Update the UI forms to include the new categories

## 🏠 Self-Hosting & Deployment

This app is designed to be self-hosted. You can deploy it to:

- **Vercel** (easiest for Next.js apps)
- **Railway** / **Render** / **Fly.io**
- **Docker** container on your own server
- Any Node.js hosting platform

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables for Production

Make sure to set the `DATABASE_URL` environment variable in your hosting platform.

## 🔒 Security Considerations

This project was entirely vibe-coded using Gemini-CLI with entire system instructions being hand written. It is as secure as YOU could keep it. Primarily intended for self-hosting on local/restricted networks.

- **PIN Authentication**: This app uses simple PIN-based authentication with bcrypt hashing. It's suitable for trusted roommates in a self-hosted environment.
- **Not for Production**: This is **not enterprise-grade security**. It's designed for small groups of trusted users.
- **Keep Secrets Safe**: Never commit `.env` or `config.json` to version control.
- **Database Access**: Ensure your database is properly secured with strong passwords.

## 📝 License

This project is open source and available for personal use. Feel free to modify and adapt it to your needs. Checkout [LICENSE](LICENSE) for more information.

## 🤝 Contributing

This is a personal project built for roommate use. Feel free to fork and customize for your own needs.

## 💡 Tips

- Set clear agreements with roommates about expense logging
- Regularly review balances and settle up
- Use descriptive titles and notes for expenses
- Back up your database periodically

