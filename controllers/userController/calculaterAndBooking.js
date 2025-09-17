import FreightRate from "../../models/freightRateModel.js";
import Booking from "../../models/bookingModel.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const calculateFreight = async (req, res) => {
    try {
        const {
            containerSize,
            containerType,
            departureCountry,
            departurePort,
            arrivalCountry,
            arrivalPort
        } = req.body;

        const fields = [
            { key: "containerSize", value: containerSize },
            { key: "containerType", value: containerType },
            { key: "departureCountry", value: departureCountry },
            { key: "departurePort", value: departurePort },
            { key: "arrivalCountry", value: arrivalCountry },
            { key: "arrivalPort", value: arrivalPort }
        ];
        const missing = fields.find(f => !f.value);
        if (missing) {
            return res.status(400).json({ status: 400, message: `${missing.key} is required` });
        }

        const rate = await FreightRate.findOne({
            containerSize,
            departureCountry,
            departurePort,
            arrivalCountry,
            arrivalPort
        });

        if (!rate) {
            return res.status(404).json({ status: 404, message: "No matching freight rate found" });
        }

        const base = containerType === 'Reefer' ? rate.basePrice.Reefer : rate.basePrice.Dry;

        return res.status(200).json({
            status: 200,
            message: "Freight price calculated",
            data: {
                freightRateId: rate._id,
                price: base,
            }
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const {
            freightRateId,
            eta,
            price
        } = req.body;

        const required = [
            { key: "userId", value: userId },
            { key: "freightRateId", value: freightRateId },
            { key: "eta", value: eta },
            { key: "price", value: price }
        ];

        const missing = required.find(r => !r.value);
        if (missing) {
            return res.status(400).json({ status: 400, message: `${missing.key} is required` });
        }

        const rate = await FreightRate.findById(freightRateId);
        if (!rate) {
            return res.status(404).json({ status: 404, message: "Freight rate not found" });
        }

        const booking = new Booking({
            userId,
            freightRateId,
            eta,
            price,
        });

        await booking.save();

        return res.status(201).json({ status: 201, message: "Booking created", data: booking });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

const getBookings = async (req, res) => {
    try {
        const userId = req.user?.userId;
        let aggregation = [];

        aggregation.push({ $match: { userId: new ObjectId(userId) } });
        aggregation.push({
            $lookup: {
                from: "freightrates",
                localField: "freightRateId",
                foreignField: "_id",
                as: "freightRate"
            }
        });

        aggregation.push({
            $unwind: {
                path: "$freightRate",
                preserveNullAndEmptyArrays: true,
            },
        });

        aggregation.push({ $sort: { createdAt: -1 } });

        aggregation.push(

            {
                $project: {
                    _id: 1,
                    userId: 1,
                    freightRateId: 1,
                    "freightRate.departureCountry": 1,
                    "freightRate.departurePort": 1,
                    "freightRate.arrivalCountry": 1,
                    "freightRate.arrivalPort": 1,
                    "freightRate.containerSize": 1,
                    "freightRate.containerType": 1,
                    eta: 1,
                    price: 1,
                    status: 1,
                    createdAt: 1,
                },
            }
        )

        const bookings = await Booking.aggregate(aggregation);

        return res.status(200).json({
            status: 200,
            message: "Bookings retrieved",
            data: bookings,
        })
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

export { calculateFreight, createBooking, getBookings };


