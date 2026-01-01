import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js"
import Show from "../models/Show.js";

//API to check if user is admin
// API to check if user is admin
export const isAdmin = async (req, res) => {
    try {
        // Clerk attaches user info to req.auth
        const { sessionClaims } = req.auth;
        
        // Check if the role in metadata is admin
        const isAdmin = sessionClaims?.metadata?.role === 'admin';

        res.json({ success: true, isAdmin });
    } catch (error) {
        res.json({ success: false, isAdmin: false, message: error.message });
    }
}

//API to get dashboard data
export const getDashboardData=async(req,res)=>{
    try{
        const bookings=await Booking.find({isPaid:true});
        const activeShows=await Show.find({showDateTime:{$gte:new Date()}}).
        populate('movie');

        const totalUser = await clerkClient.users.getCount();
        const dashboardData={
            totalBookings:bookings.length,
            totalRevenue:bookings.reduce((acc,booking)=>acc+booking.amount,0),
            activeShows,
            totalUser
        }
        res.json({success:true,dashboardData})
    }catch(error){
        console.error(error);
        res.json({success:true,message:error.message})
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
  