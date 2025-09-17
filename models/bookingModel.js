import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        freightRateId: { type: mongoose.Schema.Types.ObjectId, ref: "FreightRate", required: true },
        eta: { type: Date },
        price: { type: Number, required: true },
        containerType: { type: String, enum: ['Dry', 'Reefer'], required: true },
        totalContainers: { type: Number, required: true },
        status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    },
    { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);


