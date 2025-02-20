const mongoose = require('mongoose')

const AccessorySchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description:{
        type: String,
        require: true,
    },
    image: {
        type: Buffer,
        require: true
    },
    type: {
        type: String,
        require: false
    },
    createAt:{
        type: Date,
        default : Date.now()
    }
})
const AccessoryModel = mongoose.model('accessories', AccessorySchema)
module.exports = AccessoryModel