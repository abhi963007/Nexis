const express = require('express');
const router = express.Router();
const { messageModel } = require('../features/model/message.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { authenticate } = require('../middleware/auth.middleware');

// Get messages for a room
router.get('/:room', authenticate, async (req, res) => {
    try {
        console.log('Fetching messages for room:', req.params.room);
        const messages = await messageModel.find({ room: req.params.room })
            .sort({ timestamp: 1 });
        console.log('Found messages:', messages.length);
        res.json({ ok: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            ok: false,
            msg: "Error fetching messages",
            error: error.message
        });
    }
});

// Save a new message
router.post('/', authenticate, async (req, res) => {
    try {
        console.log('Received message data:', req.body);
        const { sender, content, room } = req.body;

        if (!sender || !content || !room) {
            console.log('Missing fields:', { sender, content, room });
            return res.status(400).json({
                ok: false,
                msg: "Missing required fields"
            });
        }

        const message = new messageModel({
            sender,
            content,
            room,
            timestamp: new Date()
        });

        await message.save();
        console.log('Message saved:', message);

        res.status(201).json({
            ok: true,
            msg: "Message sent successfully",
            message
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({
            ok: false,
            msg: "Error saving message",
            error: error.message
        });
    }
});

module.exports = router; 