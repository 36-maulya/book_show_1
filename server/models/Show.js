import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    // Reference must be Number to match Movie._id
    movie: { type: Number, required: true, ref: 'Movie' }, 
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} }
  },
  { minimize: false }
);

// Removed the space before "Show"
const Show = mongoose.models.Show || mongoose.model("Show",showSchema);
export default Show;