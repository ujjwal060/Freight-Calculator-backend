import { Booking } from "../../models/bookingModel.js";
import User from "../../models/userModel.js";
import { emailTamplates } from "../../utils/emailTemplate.js";
import { sendEmail } from "../../utils/sendEmail.js";

const getAllBookings = async (req, res) => {
    try {
        const { limit, offset, sortBy, sortField, filters, status } = req.body;
        let aggregation = [];

        if (status && status !== "All") {
            aggregation.push({
                $match: { status }
            });
        }

        aggregation.push({
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        });

        aggregation.push({
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        });

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
                preserveNullAndEmptyArrays: true
            }
        });


        if (sortField) {
            aggregation.push({
                $sort: {
                    [sortField]: parseInt(sortBy) === 1 ? 1 : -1
                }
            });
        }

        aggregation.push({
            $project: {
                _id: 1,
                bookingId: 1,
                status: 1,
                price: 1,
                containerType: 1,
                totalContainers: 1,
                eta: 1,
                createdAt: 1,
                "user._id": 1,
                "user.name": 1,
                "user.email": 1,
                "user.mobileNumber": 1,
                "freightRate.containerSize": 1,
                "freightRate.departureCountry": 1,
                "freightRate.departurePort": 1,
                "freightRate.arrivalCountry": 1,
                "freightRate.arrivalPort": 1
            }
        });

        aggregation.push({
            $facet: {
                data: [
                    { $skip: offset },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: 'count' }
                ]
            }
        });

        const results = await Booking.aggregate(aggregation);
        const bookings = results[0].data;
        const totalCount = results[0].totalCount[0] ? results[0].totalCount[0].count : 0;

        return res.status(200).json({
            status: 200,
            message: "Bookings fetched successfully",
            data: {
                bookings,
                totalCount
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        })
    }
}

const getAllBookingCounts = async (req, res) => {
    try {
        const aggregation = [];

        aggregation.push({
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        });
        const results = await Booking.aggregate(aggregation);

        const counts = results.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});


        const allStatuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];

        allStatuses.forEach((status) => {
            if (!counts[status]) {
                counts[status] = 0;
            }
        });

        counts["All"] = allStatuses.reduce((sum, status) => sum + counts[status], 0);

        return res.status(200).json({
            status: 200,
            message: "Booking counts fetched successfully",
            data: counts
        })

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        })
    }
}

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid status value"
            });
        }
        const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true })
            .populate("userId").populate("freightRateId");

        if (!booking) {
            return res.status(404).json({
                status: 404,
                message: "Booking not found"
            });
        }

        const userEmail = booking.userId?.email;
        const userName = booking.userId?.name || "Customer";

        let subject, body;

        switch (status) {
            case 'Confirmed':
                ({ subject, body } = emailTamplates.bookingConfirmMail(
                    userName,
                    booking.bookingId,
                    booking.eta
                ));
                break;

            case 'Delivered':
                ({ subject, body } = emailTamplates.bookingDeliveredMail(
                    userName, booking.bookingId, booking.updatedAt, booking.freightRateId?.arrivalPort
                ));
                break;

            case 'Cancelled':
                ({ subject, body } = emailTamplates.bookingCancelledMail(
                    userName,
                    booking.bookingId
                ));
                break;
        }

        const otpSent = await sendEmail({ email: userEmail, subject, body });

        if (!otpSent.success) {
            return res.status(500).json({
                status: 500,
                message: otpSent.message,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Booking status updated successfully",
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        })
    }
}


export {
    getAllBookings,
    getAllBookingCounts,
    updateBookingStatus
};