require("dotenv").config();
const Subscribers = require("../Models/Subscribers");

const subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = await Subscribers.findOne({ email });
        if (subscriber) {
            return res.status(400).json({ success: false, message: "You are already subscribed" });
        }
        const newSubscriber = new Subscribers({ email });
        await newSubscriber.save();
        res.status(200).json({ success: true, message: "You have been subscribed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to subscribe" });
    }
};

const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = await Subscribers.findOne({ email });
        if (!subscriber) {
            return res.status(400).json({ success: false, message: "You are not subscribed" });
        }
        await subscriber.remove();
        res.status(200).json({ success: true, message: "You have been unsubscribed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to unsubscribe" });
    }
};

module.exports = {
    subscribe,
    unsubscribe
};