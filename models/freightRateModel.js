import mongoose from "mongoose";

const FreightRateSchema = new mongoose.Schema({
    containerSize: {
        type: String,
        enum: ['20ft', '20ft HQ', '40ft', '40ft HQ'],
        required: true
    },
    departureCountry: { type: String, required: true },
    departurePort: { type: String, required: true },
    arrivalCountry: { type: String, required: true },
    arrivalPort: { type: String, required: true },
    basePrice: {
        Dry: { type: Number, required: true },
        Reefer: { type: Number, required: true }
    }
}, { timestamps: true });

export default mongoose.model("FreightRate", FreightRateSchema);