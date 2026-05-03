import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

// 🔵 DB Connection
await connectDB();

// 🔵 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 FIXED CORS (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-vercel-app.vercel.app"
  ],
  credentials: true
}));

app.use(clerkMiddleware());

// 🔵 Logger
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// 🔵 Routes
app.get('/', (req, res) => res.send('Server is Live!'));

app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// 🔥 FIX PORT (IMPORTANT for Render)
const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);