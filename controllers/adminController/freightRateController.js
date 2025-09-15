import FreightRateModel from "../../models/FreightRateModel";

const addFreightRate = async (req, res) => {
    try {
        const { containerSize, departureCountry, departurePort, arrivalCountry, arrivalPort, basePrice } = req.body;
        if (!containerSize || !departureCountry || !departurePort || !arrivalCountry || !arrivalPort || !basePrice) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required",
            });
        }

        if (!basePrice.Dry || !basePrice.Reefer) {
            return res.status(400).json({
                status: 400,
                message: "Both Dry and Reefer prices are required",
            });
        }

        const existingRate = await FreightRateModel.findOne({
            containerSize,
            departureCountry,
            departurePort,
            arrivalCountry,
            arrivalPort
        });

        if (existingRate) {
            return res.status(400).json({
                status: 400,
                message: "Freight rate already exists",
            });
        }

        const newRate = new FreightRateModel({
            containerSize,
            departureCountry,
            departurePort,
            arrivalCountry,
            arrivalPort,
            basePrice
        });

        await newRate.save();

        return res.status(201).json({
            status: 201,
            message: "Freight rate added successfully",
            data: newRate
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const updateFreightRate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!Object.keys(updates).length) {
            return res.status(400).json({
                status: 400,
                message: "At least one field is required to update",
            });
        }
        const updatedRate = await FreightRateModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedRate) {
            return res.status(404).json({
                status: 404,
                message: "Freight rate not found",
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Freight rate updated successfully",
            data: updatedRate
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const deleteFreightRate = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRate = await FreightRateModel.findByIdAndDelete(id);
        if (!deletedRate) {
            return res.status(404).json({
                status: 404,
                message: "Freight rate not found",
            });
        }
        return res.status(200).json({
            status: 200,
            message: "Freight rate deleted successfully",
            data: deletedRate
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

const getAllFreightRates = async (req, res) => {
    try {
        let { limit = 10, offset = 0, sortField, sortBy } = req.body;
        limit = parseInt(limit);
        offset = parseInt(offset);
        let aggregation = [];

        if (sortField) {
            aggregation.push({
                $sort: {
                    [sortField]: parseInt(sortBy) === 1 ? 1 : -1
                }
            });
        }

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

        const result = await FreightRateModel.aggregate(aggregation);
        const freightRates = result[0].data;
        const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            status: 200,
            message: "Freight rates fetched successfully",
            data: freightRates,
            totalCount
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}

export { addFreightRate, updateFreightRate, deleteFreightRate, getAllFreightRates };