const TypeModel = require("../Model/TypeAccessory")

exports.getTypesAccessory = async (req, res) =>{
    try {
        let {page, limit, query} = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 12
        const skip = (page - 1) * limit
        const filter = {};
            if (query) {
                filter.title = { $regex: query, $options: "i" };
            }
        const types = await TypeModel.find(filter)
        .skip(skip)
        .limit(limit)

        const totalItem = query != null ? types.length : await TypeModel.countDocuments()
        
        if(types){
            res.status(200).json({
                status:200,
                message:"get types successfully",
                data:types,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalItem / limit),
                    totalItem: totalItem
                }
            })
        }
        else {
            return res.status(404).json({
                status: 404,
                message: "Types not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "get types accessory failed"
        })
        console.log(error)
    }
}