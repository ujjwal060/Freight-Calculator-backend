import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1000 },
});

const Counter = mongoose.model("Counter", counterSchema);

const BookingSchema = new mongoose.Schema(
    {
        bookingId: { type: String, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        freightRateId: { type: mongoose.Schema.Types.ObjectId, ref: "FreightRate", required: true },
        eta: { type: Date },
        price: { type: Number, required: true },
        containerType: { type: String, enum: ['Dry', 'Reefer'], required: true },
        totalContainers: { type: Number, required: true },
        status: { type: String, enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'], default: 'Pending' },
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

export { Booking, Counter };
