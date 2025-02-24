const TypeModel = require("../Model/TypeAccessory")
const fs = require("fs")
const path = require("path")
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
            const typesWithBase64 = types.map(type =>({
                ...type._doc,
                image: type.image ? Buffer.from(type.image, "base64").toString("utf-8") : null
            }))
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
exports.createTypeAccessory = async (req,res)=>{
    try {
        const {title,contentType} = req.body
        console.log(title)
        if(!req.file){
            return res.status(400).json({
                status:400,
                message:"No file uploaded"
            })
        }
        const existsFolder = await TypeModel.findOne({title:title})

        if (existsFolder) {
            return res.status(400).json({
                status: 400,
                message: "Type already exists, cannot create a duplicate entry",
            });
        }
        const folderPath = path.join(__dirname, "../public/images", title)
        if(!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath, {recursive: true})
        }

        const filename = "image_" + Date.now() + path.extname(req.file.originalname) 
        const filePath = path.join(folderPath, filename)

        fs.writeFileSync(filePath, req.file.buffer)

        const imagePath = `/public/images/${title}/${req.file.filename}`
        const imageBase64 = Buffer.from(imagePath).toString("base64")
    
            const newType = new TypeModel({
                title: title,
                contentType:contentType,
                image: imageBase64
            })
            await newType.save()
    
            return res.status(201).json({
                status:201,
                message:"Create new type accessory successfully",
                data: {
                    _id: newType._id,
                    title: newType.title,
                    contentType: newType.contentType,
                    image: Buffer.from(newType.image, 'base64').toString("utf-8"),
                    __v : newType.__v
                }
            })
        
    } catch (error) {
        res.status(500).json({
            status:500,
            message:`Server error: ${error}`
        })
    }
}