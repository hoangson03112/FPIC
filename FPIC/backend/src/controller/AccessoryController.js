const Accessory = require('../Model/Accessory')
const AccessoryModel = require("../Model/Accessory")
const path = require("path")
const fs = require("fs")
exports.getAccessories = async (req, res) => {
    try {
        let { page, limit, type } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 12;
        const skip = (page - 1) * limit;

        let accessories = []
        if(type){
            accessories = await AccessoryModel.find({type:type})
            .sort({_id:-1})
            .skip(skip)
            .limit(limit);
        }

        const totalItem = type != null ? accessories.length : await AccessoryModel.countDocuments();

        if (accessories) {
            const accessoriesWithBase64 = accessories.map(accessory => ({
                ...accessory._doc,
                image: accessory.image ? Buffer.from(accessory.image, "base64").toString("utf-8") : null
            }));

            return res.status(200).json({
                status: 200,
                message: "Get data successfully",
                data: accessoriesWithBase64,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalItem / limit),
                    totalItem: totalItem
                }
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: "Accessories not found"
            });
        }
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: `Server error: ${e}`
        });
    }
};
exports.getAccessory = async (req, res) =>{
    try {
        const {id} = req.params
        const accessory = await AccessoryModel.findById(id)
        if(accessory){
            return res.status(200).json({
                status:200,
                message:"get accessory successfully",
                data:accessory
            })
        }else{
            return res.status(404).json({
                status:404,
                message:"accessory not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status:500,
            message:`Server error: ${error}`
        })
    }
}
exports.createAccessory = async (req,res) =>{
    try {
        const accessory = req.body
        if(!req.file){
            return res.status(400).json({
                status:400,
                message:"No file uploaded"
            })
        }
        const imageBase64 = req.file.buffer
        const newAccessory = new Accessory({
            title: accessory.title,
            description: accessory.description,
            image: imageBase64,
            type: accessory.type
        })
        await newAccessory.save()
        
        return res.status(201).json({
        status: 201,
        message: "create new accessory successfully",
        data: newAccessory,
        })
    } catch (error) {
        res.status(500).json({
            status:500,
            message:`Server error: ${error}`
        })
    }
}
exports.updateAccessory = async (req, res)=>{
    try {
        const {id} = req.params
        const accessory = req.body
        const existsAccessory = await AccessoryModel.findById(id)
        if(!existsAccessory){
            return res.status(404).json("ID accessory not found")
        }
        if(req.file){
            const imageBase64 = req.file.buffer
            accessory.image = imageBase64;
        }
        const updateAccessory = await AccessoryModel.findByIdAndUpdate(id, accessory,{new: true})
        if(updateAccessory){
            return res.status(200).json({
                status:200,
                message:"update accessory succesfully",
                data:updateAccessory
            })
        }else{
            return res.status(404).json({
                status: 404,
                message:"update accessory failed"
            })
        }
    } catch (error) {
        res.status(500).json({
            status:500,
            message:`Server error: ${error}`
        })
    }
}
exports.deleteAccessory = async(req, res) =>{
    try {
        const {id} = req.params
        const existsAccessory = await AccessoryModel.findById(id)
        if(!existsAccessory){
            return res.status(404).json("ID accessory not found")
        }
        const deleteAccessory = await AccessoryModel.findByIdAndDelete(id)
        if(deleteAccessory){
            return res.status(200).json({
                status:200,
                message:"delete accessory successfully"
            })
        }else{
            return res.status(404).json({
                status:404,
                message: "delete accessory failed"
            })
        }
    } catch (error) {
        res.status(500).json({
            status:500,
            message:`Server error: ${error}`
        })
    }
}
const DIR_IMAGE = path.join(__dirname, "../public/images/V")
exports.importAccessories = async (req, res) => {
  try {
    const images = fs.readdirSync(DIR_IMAGE).filter(image =>
      image.endsWith(".png") || image.endsWith("jpg") || image.endsWith("jpeg"))

    if (images.length === 0) return null

    const saveAccessories = images.map(async image => {
      const accessoryPath = `/public/images/V/${image}`
      const imageBase64 = Buffer.from(accessoryPath).toString("base64")

      const newAccessory = new AccessoryModel({
        title: image,
        description: "",
        image: imageBase64,
        type: "67bb2d4a9e8b6d1860f8dd66"
      })
      return await newAccessory.save()
    })

    const results = await Promise.all(saveAccessories)
    res.json({ message: `Luwu thành công ${results.filter(Boolean).length} file` })
  } catch (error) {
    console.log("Lưu thất bại", error)
    res.json({ message: `Luwu thất bại` })
  }
}