const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { 
        type: String,
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    room: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, {
    versionKey: false
});

const messageModel = mongoose.model('message', messageSchema);

module.exports = { messageModel }; 