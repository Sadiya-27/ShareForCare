# ShareForCare – A Community Donation & Support Platform
ShareForCare is a web application designed to connect donors, NGOs, volunteers, and community members on a single platform. The platform enables users to donate items such as clothes, food, books, and essentials while allowing NGOs to manage donation drives, verify contributions, and coordinate volunteers efficiently.

---
## Deployed Link: https://share-for-care.vercel.app/
---

## 🚀 Features

### 1. User Authentication (Firebase)
- Secure login/signup using Firebase Auth
- Social logins supported (Google, etc.)
- Real-time authentication state tracking

### 2. Donation Management
- Donate clothes, books, or other essential items
- Upload multiple images (UploadThing / Firebase Storage)
- View past donation history
- Status updates: Completed or not

### 3. NGO Dashboard
- Manage donation requests
- View volunteer data
- Request items
- Status updates: Completed or not

### 4. Volunteer Dashboard
- Volunteers can sign up and showcase the items they have for donation
- View donations and track

### 5. Search & Filters
- Search donations
- Filter by category (Clothes, Food, Books, etc.)
- Role-based dashboards (User / NGO / Volunteer)

### 6. Admin Controls
- Manage NGOs
- Approve NGO registrations
- Track overall donation statistics

---

## 🧰 Tech Stack

### 1. Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- UI Components
- Lucide Icons

### 2. Backend / Database
- Firebase Auth
- MongoDB
- UploadThing for images and docs

### 3. Deployment
- Vercel (Frontend & serverless functions)

### 4. Other Integrations
- UploadThing (Optional for images)
- Realtime listeners for auth & database updates

---

## ⚙️ Environment Variables
Create a .env.local file:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxxx
MONGODB_URI=xxxx
UPLOADTHING_TOKEN=xxxx
```
---

## ▶️ Running Locally

1. Clone the repository
```bash
git clone https://github.com/your-username/shareforcare.git
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Open in browser
```bash
http://localhost:3000
```

---

## 🌐 Deploying on Vercel
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy
Every push to main will automatically redeploy your Vercel app.

---

## 🛡️ Security
- User authentication handled with Firebase
- Role-based access: User / NGO / Volunteer / Admin
- Secure image uploads
- Protected routes for dashboards

---

## 📌 Current Integrations
1. Firebase login connected to Vercel origin URL
2. Role-based dashboard routing
3. Dynamic volunteer/donation data fetch
4. File upload with previews

---

## 📈 Future Enhancements
- Real-time chat between donors & NGOs
- OTP-based login
- Donation tracking map
- Notification system
- AI-based volunteer–donation matching

---

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Submit a pull request

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
