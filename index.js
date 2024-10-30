const express = require("express");
const { ParseServer } = require("parse-server");
const ParseDashboard = require("parse-dashboard");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Add CORS middleware
app.use(cors());

// Parse Server initialization
async function startParseServer() {
    const parseServer = new ParseServer({
        databaseURI: process.env.DB_URL,
        cloud: "./cloud/main.js",
        fileKey: "optionalFileKey",
        // serverURL: "http://localhost:1337/parse",
        serverURL: "http://15.206.84.123:443/parse",
        appId: "myAppId",
        masterKey: "myMasterKey", // Keep this key secret!
        encodeParseObjectInCloudFunction: false,
    });

    // Start Parse Server
    await parseServer.start();

    // Mount Parse Server at '/parse' URL prefix
    app.use("/parse", parseServer.app);

    // Configure Parse Dashboard (optional)
    const dashboard = new ParseDashboard({
        apps: [
            {
                // serverURL: "http://localhost:1337/parse",
                serverURL: "http://15.206.84.123:443/parse",
                appId: "myAppId",
                masterKey: "myMasterKey",
                appName: "MyApp",
            },
        ],
        users: [
            {
                user: "admin",
                pass: "password",
            },
        ],
        // Allow insecure HTTP (for development only)
        allowInsecureHTTP: true,
    });

    // Mount Parse Dashboard at '/dashboard' URL prefix (optional)
    app.use("/dashboard", dashboard);

    // Start the server
    const port = 1337;
    app.listen(port, function () {
        console.log(`parse-server running on port ${port}.`);
    });
}

// Call the async function to start Parse Server
startParseServer().catch((err) =>
    console.error("Error starting Parse Server:", err)
);
