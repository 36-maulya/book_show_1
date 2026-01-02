import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js"
import Show from "../models/Show.js";

//API to check if user is admin
// API to check if user is admin
// adminController.js
// adminController.js
export const isAdmin = async (req, res) => {
    try {
        // FIX: Change req.auth to req.auth()
        const { sessionClaims } = req.auth(); 
        
        const isAdmin = sessionClaims?.metadata?.role === 'admin';
        res.json({ success: true, isAdmin });
    } catch (error) {
        res.json({ success: false, isAdmin: false, message: error.message });
    }
}

//API to get dashboard data
// server/controllers/adminController.js
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    
    // TEMPORARY: Remove the date filter to see if data appears
    const activeShows = await Show.find({}).populate('movie'); 

    const totalUser = await clerkClient.users.getCount();
    
    res.json({
      success: true,
      dashboardData: {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((acc, b) => acc + b.amount, 0),
        activeShows,
        totalUser
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//API to get all shows
export const getAllShows=async(req,res)=>{
    try{
        const shows=await Show.find({showDateTime:{$gte:new Date()}}).populate('movie').sort({showDateTime:1})
        res.json({success:true,shows})
   
    }
    catch(error){
        console.error(error);
        res.json({success:false,message:error.message})
    }
}
  
//API to get all bookings
export const getAllBookings=async(req,res)=>{
    try{
        const bookings=await Booking.find({}).populate('user').populate({
            path:'show',
            populate:{path:'movie'}

        }).sort({createdAt:-1})
        res.json({success:true,bookings})
   
    }
    catch(error){
        console.error(error);
        res.json({success:false,message:error.message})
    }
}
  