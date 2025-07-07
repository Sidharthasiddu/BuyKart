const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb://localhost:27017/BuyKart");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
    .catch(() => {
        console.log("Database cannot be Connected");
    })

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
// const leadSchema = new mongoose.Schema({
//     userId: String, // Unique identifier for the user
//     email: String, // Optional: Capture email if user submits a form
//     activities: [{
//         eventType: String, // e.g., 'click', 'form_submit', 'search', 'product_view'
//         data: mongoose.Schema.Types.Mixed, // Additional data
//         timestamp: { type: Date, default: Date.now },
//     }],
//     score: Number, // AI-generated lead score
//     status: { type: String, default: 'New' }, // New, Contacted, Qualified, Closed
// });

// collection part
const collection = new mongoose.model("users", Loginschema);
module.exports = collection;


