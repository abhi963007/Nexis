const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API with validation
let genAI;
let model;

try {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('Gemini API initialized successfully');
} catch (error) {
    console.error('Failed to initialize Gemini API:', error);
}

// Chat history storage (in-memory for demo, use database in production)
const chatHistory = new Map();

// Initialize a new chat
router.post('/chat/start', async (req, res) => {
    try {
        if (!model) {
            throw new Error('Gemini API not properly initialized');
        }
        
        const chatId = Math.random().toString(36).substring(7);
        chatHistory.set(chatId, []);
        console.log('New chat session created:', chatId);
        res.json({ ok: true, chatId });
    } catch (error) {
        console.error('Error starting chat:', error);
        res.status(500).json({ 
            ok: false, 
            error: error.message
        });
    }
});

// Send message and get response
router.post('/chat/message', async (req, res) => {
    try {
        if (!model) {
            throw new Error('Gemini API not properly initialized');
        }

        const { message, chatId } = req.body;
        console.log('Received request:', { message, chatId });
        
        if (!message) {
            return res.status(400).json({ ok: false, error: 'Message is required' });
        }

        if (!chatId) {
            return res.status(400).json({ ok: false, error: 'Chat ID is required' });
        }

        // Get or initialize chat history
        let history = chatHistory.get(chatId);
        if (!history) {
            console.log('No history found for chatId:', chatId);
            history = [];
            chatHistory.set(chatId, history);
        }

        // Add user message to history
        const userMessage = { role: 'user', parts: [{ text: message }] };
        history.push(userMessage);

        try {
            // Create chat context with history
            console.log('Creating chat with history:', JSON.stringify(history, null, 2));
            const chat = model.startChat({
                history: history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: msg.parts
                }))
            });

            // Get response from Gemini
            console.log('Sending message to Gemini API...');
            try {
                const result = await chat.sendMessage(message);
                console.log('Raw result:', JSON.stringify(result, null, 2));
                const response = result.response;
                console.log('Raw response:', JSON.stringify(response, null, 2));
                const responseText = response.text();
                console.log('Response text:', responseText);
                console.log('Received response from Gemini API');

                // Add AI response to history
                const aiResponse = { role: 'assistant', parts: [{ text: responseText }] };
                history.push(aiResponse);
                chatHistory.set(chatId, history);

                res.json({
                    ok: true,
                    response: responseText,
                    history: history
                });
            } catch (apiError) {
                console.error('Gemini API Error:', {
                    message: apiError.message,
                    stack: apiError.stack,
                    details: apiError.details,
                    name: apiError.name
                });
                res.status(500).json({ 
                    ok: false, 
                    error: 'Error communicating with Gemini API',
                    details: apiError.message,
                    name: apiError.name
                });
            }
        } catch (error) {
            console.error('Error in chat:', error);
            res.status(500).json({ 
                ok: false, 
                error: error.message
            });
        }
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ 
            ok: false, 
            error: error.message
        });
    }
});

// Get chat history
router.get('/chat/history/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const history = chatHistory.get(chatId) || [];
        res.json({ ok: true, history });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

module.exports = router; 