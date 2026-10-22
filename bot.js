const rdxFca = require("DEVIL-FCA");
const fs = require("fs");
const path = require("path");

// appState.json file ka path check karna
const appStatePath = path.join(__dirname, "appState.json");
const loginData = fs.existsSync(appStatePath) 
    ? JSON.parse(fs.readFileSync(appStatePath, "utf8")) 
    : null;

// Agar appState.json nahi milti toh error de kar process rok dena
if (!loginData) {
    console.error("[DEVIL-FCA] Error: appState.json not found!");
    console.error("Please provide a valid appState.json file.");
    process.exit(1);
}

// Bot ko initialize karna
const api = rdxFca(loginData, {
    'selfListen': true,
    'listenEvents': true,
    'listenTyping': true,
    'autoMarkRead': true
}, (err, apiData) => {
    
    // Agar login mein koi error aaye
    if (err) {
        console.error("Login Error:", err);
        process.exit(1);
    }

    console.log("Bot successfully logged in!");
    console.log("Logged in as User ID:", apiData.getCurrentUserID());
    console.log("Listening for messages...");
    console.log("App State Info:", apiData.getAppState());

    // Messages ko sunna aur unka jawab dena
    apiData.listenMqtt((err, message) => {
        if (err) return console.error("Listening Error:", err);

        // Agar koi message aaye aur usme text ho
        if (message && message.body) {
            console.log("Sender Name/ID " + message.senderID + ": " + message.body);
            
监测// Agar koi "ping" likhe toh bot "pong" reply karega
            if (message.body.toLowerCase() === "ping") {
                apiData.sendMessage("pong", message.threadID);
            }
        }
    });

    // Bot ko online status par set karna
    apiData.setOptions({ 'online': true });
});

// Process exit hone par message show karna
process.on('SIGINT', () => {
    console.log("Bot is shutting down...");
    process.exit(0);
});

module.exports.credits = "DEVIL-FCA";
