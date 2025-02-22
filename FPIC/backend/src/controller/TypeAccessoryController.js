const TypeModel = require("../Model/TypeAccessory")
const Type = require("../Model/TypeAccessory")
const fs = require('fs')
const path = require("path")
const IMAGE_DIR_MAIN = "C:/Users/nguye/Documents/gui/gui"
exports.importData = async (req, res) => {
    try {
        //lấy danh sách folder
        const subfolders = fs.readdirSync(IMAGE_DIR_MAIN)
            .filter(folder =>
                fs.statSync(path.join(IMAGE_DIR_MAIN, folder)).isDirectory()
            );

        const savePromises = subfolders.map(async (folder) => {
            const folderPath = path.join(IMAGE_DIR_MAIN, folder);
            const files = fs.readdirSync(folderPath).filter(file =>
                file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg")
            )

            if (files.length === 0) return null

            const firstImagePath = path.join(folderPath, files[0])
            const fileData = fs.readFileSync(firstImagePath)

            const newType = new Type({
                title: folder,
                contentType: "image/png",
                image: fileData,
            })
            return await newType.save();
        })
        const results = await Promise.all(savePromises)

        res.json({ message: `Lưu thành công: ${results.filter(Boolean).length}thư mục!` })
    } catch (error) {
        console.error("Lỗi khi lưu ảnh:", error);
        res.status(500).json({ error: "Lỗi khi lưu ảnh" });
    }
}
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

        const totalItem = await TypeModel.countDocuments()
        
        if(types){
            const typesWithBase64 = types.map(type => ({
                ...type._doc,
                image: type.image ? type.image.toString("base64") : null
            }));
            res.status(200).json({
                status:200,
                message:"get types successfully",
                data:typesWithBase64,
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