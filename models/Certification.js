const mongoose = require('mongoose')

const certificationSchema = new mongoose.Schema({

    certification_name: {
        type: String, 
        required: true
      },
      certification_image:{
        type: String,
        required: true,
        default: "https://placehold.co/100x100"
      },

},
{
    timestamps: true
})

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = Certification
;