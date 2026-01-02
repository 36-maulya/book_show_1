import express from 'express';
import { getAllBookings, getAllShows, getDashboardData, isAdmin } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/auth.js';

const adminRouter=express.Router();

adminRouter.get('/is-admin',protectAdmin,isAdmin)
adminRouter.get('/dashboard',getDashboardData)
adminRouter.get('/all-shows',getAllShows)
adminRouter.get('/all-bookings',getAllBookings)

export default adminRouter;