const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));

// Define route to serve indexx.html as the default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "indexx.html"));
});
app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    // Check if the username already exists in the database
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different username.');
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }
    res.redirect("/login");

});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.alert("User name not found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.send("Incorrect password");
        }

        // If login successful, redirect the user to the indexx.html page
        res.redirect("/"); // Assuming indexx.html is served as the default route
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login. Please try again later.");
    }
});

app.post('/send-followup', async (req, res) => {
    const { category, user } = req.body;

    // Create a transporter with your email provider
    let transporter = nodemailer.createTransport({
        service: "gmail",  // Change this if using another provider
        auth: {
            user: "ankepallimaheshreddy@gmail.com",  // Replace with your email
            pass: "cikr woyv jfud vecw"    // Use an App Password for security
        }
    });

    let mailOptions = {
        from: "ankepallimaheshreddy@gmail.com",
        to: "mohamedijasscientist@gmail.com",
        subject: `Interested in more ${category}?`,
        html: `
        <h2>Hi there! Since you viewed multiple ${category}, we thought you might be interested in similar products. Check them out on our website!</h2>
        <p>Here are some related images:</p>
        <img src="https://static.zara.net/assets/public/cf20/bc01/60e949ecbc3f/2d96e7855c27/01958671600-e1/01958671600-e1.jpg?ts=1738254126518&w=744&f=auto" alt="Sample Image" width="300"/>
        <img src="https://static.zara.net/assets/public/6331/7d00/a1f648d2ad0f/232233d99eac/00895603712-e1/00895603712-e1.jpg?ts=1738327830236" alt="Sample Image" width="300"/>
        <img src="https://images.meesho.com/images/products/270792027/fzdcq_512.webp" alt="Sample Image" width="300"/>
        <p>Click <a href="zara.com" target="_blank">here</a> to visit our website!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user} for ${category}`);
        res.json({ message: "Follow-up email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

// // Track user activity
// const trackActivity = (eventType, data) => {
//     const activity = {
//         eventType, // e.g., 'click', 'form_submit', 'search', 'product_view'
//         data, // Additional data like product ID, search query, etc.
//         timestamp: new Date().toISOString(),
//     };

//     // Send data to backend
//     fetch('http://localhost:5000/api/track', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(activity),
//     });
// };

// // Track clicks
// document.addEventListener('click', (e) => {
//     const target = e.target;
//     if (target.tagName === 'BUTTON' || target.tagName === 'A') {
//         trackActivity('click', { element: target.innerText, href: target.href });
//     }
// });

// // Track form submissions
// document.addEventListener('submit', (e) => {
//     const formData = new FormData(e.target);
//     const formValues = Object.fromEntries(formData.entries());
//     trackActivity('form_submit', formValues);
// });

// // Track searches
// const searchInput = document.querySelector('input[type="search"]');
// if (searchInput) {
//     searchInput.addEventListener('input', (e) => {
//         trackActivity('search', { query: e.target.value });
//     });
// }

// // Track product views
// const productLinks = document.querySelectorAll('a.product-link');
// productLinks.forEach((link) => {
//     link.addEventListener('click', () => {
//         trackActivity('product_view', { productId: link.dataset.productId });
//     });
// });
// // Track User Activity
// app.post('/api/track', async (req, res) => {
//     const { eventType, data, userId } = req.body;

//     // Find or create a lead based on user ID (you can use cookies or sessions for user identification)
//     let lead = await Lead.findOne({ userId });
//     if (!lead) {
//         lead = new Lead({ userId, activities: [] });
//     }

//     // Add activity to lead
//     lead.activities.push({ eventType, data, timestamp: new Date() });

//     // Analyze activity with Gemini API
//     const analysis = await analyzeActivityWithGemini(lead.activities);
//     lead.score = analysis.score; // Update lead score based on activity analysis
//     lead.status = analysis.recommendedStatus; // Update lead status

//     await lead.save();
//     res.status(200).json({ message: 'Activity tracked successfully' });
// });

// // Analyze Activity with Gemini
// async function analyzeActivityWithGemini(activities) {
//     const activitySummary = activities
//         .map((act) => `${act.eventType}: ${JSON.stringify(act.data)}`)
//         .join('\n');

//     const response = await axios.post(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AIzaSyAKmreVSc66LW5E7DnbHaO6awx1UdsVV30}`,
//         {
//             contents: [{
//                 parts: [{
//                     text: `Analyze this user activity and provide a lead score (1-100) and recommended status (New, Contacted, Qualified, Closed):\n${activitySummary}`
//                 }]
//             }]
//         }
//     );

//     // Parse Gemini response (hypothetical response structure)
//     const { score, recommendedStatus } = response.data;
//     return { score, recommendedStatus };
// }


// Define Port for Application
const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

