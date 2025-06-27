const mongoose = require("mongoose");

const SubscribersSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    name: {
        type: String,
        trim: true
    },
    isSubscribed: { 
        type: Boolean, 
        default: true 
    },
    unsubscribeToken: {
        type: String,
        unique: true,
        sparse: true
    },
    unsubscribedAt: {
        type: Date,
        default: null
    },
    lastEmailedAt: {
        type: Date,
        default: null
    },
    emailCount: {
        type: Number,
        default: 0
    },
    metadata: {
        type: Map,
        of: String,
        default: {}
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add index for faster queries
SubscribersSchema.index({ email: 1, isSubscribed: 1 });
SubscribersSchema.index({ unsubscribeToken: 1 }, { unique: true, sparse: true });

// Pre-save hook to ensure unsubscribeToken is set for active subscriptions
SubscribersSchema.pre('save', function(next) {
    if (this.isSubscribed && !this.unsubscribeToken) {
        const { v4: uuidv4 } = require('uuid');
        this.unsubscribeToken = uuidv4();
    }
    next();
});

// Static method to handle subscription with welcome email
SubscribersSchema.statics.subscribeWithWelcome = async function(email, name) {
    const { sendWelcomeEmail } = require('../services/sendMail');
    
    try {
        let subscriber = await this.findOne({ email });
        
        if (subscriber) {
            if (!subscriber.isSubscribed) {
                // Resubscribe
                subscriber.isSubscribed = true;
                subscriber.unsubscribedAt = null;
                await subscriber.save();
                
                // Send welcome back email
                await sendWelcomeEmail({ to: email, name: name || subscriber.name });
                return { subscriber, isNew: false };
            }
            return { subscriber, isNew: false, alreadySubscribed: true };
        }
        
        // New subscriber
        subscriber = new this({ email, name, isSubscribed: true });
        await subscriber.save();
        
        // Send welcome email
        await sendWelcomeEmail({ to: email, name });
        
        return { subscriber, isNew: true };
    } catch (error) {
        console.error('Error in subscribeWithWelcome:', error);
        throw error;
    }
};

module.exports = mongoose.model("Subscribers", SubscribersSchema);
