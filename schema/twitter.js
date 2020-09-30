var mongoose = require("mongoose");

//Create TwitterSchema
var TwitterSchema = new mongoose.Schema({

    name: { type: String, required: false  , default: ''},
    webhook: [
        {
            channelid: { type: String, required: false  , default: '' },
            webhook: { type: String, required: false  , default: '' }
        }
    ],

    webhook_id: [
            {
                channelid: { type: String, required: false  , default: '' },
                webhook_id: { type: String, required: false  , default: '' }
            }
        ],

    webhook_secret: [
            {
                channelid: { type: String, required: false  , default: '' },
                webhook_secret: { type: String, required: false  , default: '' }
            }
        ],
    
    twitid: { type: String, required: false  , default: ''},
    retweet: { type: Boolean, required: false  , default: false},
    twitstartbiostatus: { type: Boolean, required: false  , default: false},
    twitstartbiourlstatus: { type: Boolean, required: false  , default: false},
    twitbio: { type: String, required: false  , default: ''},
    twitfollower: { type: Number, required: false  , default: 0},
    twitfollowerckeck: { type: Boolean, required: false  , default: false},
    twiturl: { type: String, required: false  , default: ''},
    footername: { type: String, required: false  , default: ''},
    footericon: { type: String, required: false  , default: ''}
    
},{
    timestamps: true
});


// Export your module
module.exports = mongoose.model("Twitter", TwitterSchema);
