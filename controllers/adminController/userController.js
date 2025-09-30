import userModel from '../../models/userModel.js';

const getAllUsers = async (req, res) => {
    try {
        let { limit = 3, offset = 0, sortField, sortBy,filters } = req.body;
        limit = parseInt(limit);
        offset = parseInt(offset);
        let aggregation = [];

        if (filters?.name) {
            aggregation.push({
                $match: {
                    name: { $regex: filters.name, $options: 'i' }
                }
            });
        }

        if (filters?.email) {
            aggregation.push({
                $match: {
                    email: { $regex: filters.email, $options: 'i' }
                }
            });
        }

        if (filters?.mobileNumber) {
            aggregation.push({
                $match: {
                    mobileNumber: { $regex: filters.mobileNumber, $options: 'i' }
                }
            });
        }

        if (sortField) {
            aggregation.push({
                $sort: {
                    [sortField]: parseInt(sortBy) === 1 ? 1 : -1
                }
            });
        }
        aggregation.push({
            $project: {
                name: 1,
                email: 1,
                mobileNumber: 1,
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

        const result = await userModel.aggregate(aggregation);
        const users = result[0].data;
        const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

        return res.status(200).json({
            status: 200,
            message: "Users fetched successfully",
            data: users,
            totalCount
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export { getAllUsers };