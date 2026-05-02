import Booking from "../models/Booking.js";
import Show from "../models/Show.js"

//Function to check availability of selected seats for a movie
const checkSeatsAvailability=async(showId,selectedSeats)=>{
    try{
       const showData= await Show.findById(showId)
       if(!showData)
        return false;
    const occupiedSeats=showData.occupiedSeats;
    const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat]);
    return !isAnySeatTaken;
    }
    catch(error){
        console.log(error.message);
        return false;
    }
}

export const createBooking=async(req,res)=>{
    try{
        const auth = req.auth?.();
if (!auth || !auth.userId) {
  return res.status(401).json({
    success: false,
    message: "User not authenticated"
  });
}

const userId = auth.userId;

        const {showId,selectedSeats,paymentMethod,last4}=req.body;
        const {origin}=req.headers;

        //Check if the seat is available for the selected show
        const isAvailable=await checkSeatsAvailability(showId,selectedSeats)
        if(!isAvailable){
            return res.json({success:false,message:"selected seats are not available."})
        }
        //Get the show details
        const showData=await Show.findById(showId).populate('movie');

        //Create new booking with payment info
        const booking=await Booking.create({
            user:userId,
            show:showId,
            amount:showData.showPrice*selectedSeats.length,
            bookedSeats:selectedSeats,
            isPaid: true, // Mark as paid for demo
            paymentMethod: paymentMethod || 'demo',
            paymentLink: last4 ? `****${last4}` : null
        })
        
        //Mark seats as occupied
        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat]=userId
        })
        showData.markModified('occupiedSeats');
        await showData.save();

        //Return success with booking details
        res.json({
            success:true,
            message:"Booked successfully! Your tickets are confirmed.",
            bookingId: booking._id
        })
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

export const getOccupiedSeats=async(req,res)=>{
    try{
        const {showId}=req.params;
        const showData=await Show.findById(showId)
        const occupiedSeats=Object.keys(showData.occupiedSeats)
        res.json({success:true,occupiedSeats})
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message})
    
    }
}