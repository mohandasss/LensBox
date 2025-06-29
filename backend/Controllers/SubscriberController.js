require("dotenv").config();
const Subscribers = require("../Models/Subscribers");
const { sendWelcomeEmail } = require("../services/sendMail");
const { v4: uuidv4 } = require('uuid');

const subscribe = async (req, res) => {
    try {
        const { email, name } = req.body;
        
        // Validate email
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is required" 
            });
        }

        // Check if already subscribed
        let subscriber = await Subscribers.findOne({ email });
        if (subscriber) {
            // If already subscribed but unsubscribed before, update the status
            if (!subscriber.isSubscribed) {
                subscriber.isSubscribed = true;
                subscriber.unsubscribeToken = uuidv4();
                await subscriber.save();
                
                // Send welcome email
                try {
                    await sendWelcomeEmail({ to: email, name });
                } catch (error) {
                    // Continue even if welcome email fails
                }
                
                return res.status(200).json({ 
                    success: true, 
                    message: "You have been resubscribed successfully" 
                });
            }
            return res.status(400).json({ 
                success: false, 
                message: "You are already subscribed" 
            });
        }

        // Create new subscriber
        const newSubscriber = new Subscribers({ 
            email, 
            name,
            unsubscribeToken: uuidv4(),
            isSubscribed: true
        });
        
        await newSubscriber.save();
        
        // Send welcome email
        try {
            await sendWelcomeEmail({ to: email, name });
        } catch (error) {
            // Continue even if welcome email fails
        }
        
        res.status(200).json({ 
            success: true, 
            message: "You have been subscribed successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process subscription' 
        });
    }
};

const unsubscribe = async (req, res) => {
    try {
        const { email, token } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is required" 
            });
        }

        const subscriber = await Subscribers.findOne({ email });
        
        if (!subscriber) {
            return res.status(404).json({ 
                success: false, 
                message: "No subscription found with this email" 
            });
        }

        // If token is provided, verify it matches
        if (token && subscriber.unsubscribeToken !== token) {
            return res.status(403).json({ 
                success: false, 
                message: "Invalid unsubscribe token" 
            });
        }

        // Soft delete by marking as unsubscribed
        subscriber.isSubscribed = false;
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();
        
        res.status(200).json({ 
            success: true, 
            message: "You have been unsubscribed successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process unsubscription' 
        });
    }
};

module.exports = {
    subscribe,
    unsubscribe
};