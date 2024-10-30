Parse.Cloud.define("checkUserCredentials", async (request) => {
    const { username, password } = request.params;

    try {
        // Log in the user using the provided credentials
        const user = await Parse.User.logIn(username, password);

        // Fetch the user's game data (assuming there's a GameSession table related to the user)
        const GameSession = Parse.Object.extend("GameSession");
        const query = new Parse.Query(GameSession);
        query.equalTo("userId", user); // Assuming 'user' is a pointer to the User in the GameSession table

        const gameSessions = await query.find();

        // Format the game data as needed
        const formattedGameSessions = gameSessions.map((session) => {
            return {
                sessionId: session.id,
                gameCatalogId: session.get("gameCatalogueId"), // Assuming gameCatalogId is a field in GameSession
                balanceOnEnter: session.get("balanceOnEnter"),
                balanceOnExit: session.get("balanceOnExit"),
                totalPlayed: session.get("totalPlayed"),
                totalWin: session.get("totalWin"),
            };
        });

        // Return user and their game data
        return {
            status: "success",
            userData: {
                id: user.id,
                username: user.get("username"),
                email: user.get("email"),
                balance: user.get("balance"),
                createdAt: user.get("createdAt"),
                updatedAt: user.get("updatedAt"),
            },
            gameData: formattedGameSessions,
        };
    } catch (error) {
        // Handle different error types
        if (error instanceof Parse.Error) {
            // Return the error if it's a Parse-specific error
            return {
                status: "error",
                code: error.code,
                message: error.message,
            };
        } else {
            // Handle any unexpected errors
            return {
                status: "error",
                code: 500,
                message: "An unexpected error occurred.",
            };
        }
    }
});

Parse.Cloud.define("createGameRtpData", async (request) => {
    try {
        const { gameName, rtp, scatter, wild } = request.params;

        // Validate if both parameters are provided
        if (!gameName || typeof gameName !== "string" || gameName.trim() === "") {
            throw new Parse.Error(
                Parse.Error.VALIDATION_ERROR,
                "'gameName' is required and must be a non-empty string."
            );
        }

        if (rtp === undefined || typeof rtp !== "number" || rtp <= 0 || rtp > 100) {
            throw new Parse.Error(
                Parse.Error.VALIDATION_ERROR,
                "'rtp' is required and must be a number between 0 and 100."
            );
        }

        // Create a new instance of the 'GameRtp' class
        const GameRtp = Parse.Object.extend("GameRtp");
        const gameRtp = new GameRtp();

        // Set the fields for the new object
        gameRtp.set("gameName", gameName);
        gameRtp.set("rtp", rtp);
        gameRtp.set("scatter", scatter);
        gameRtp.set("wild", wild);

        // Save the new object to the database
        await gameRtp.save();

        // Return success response with the created object's data
        return {
            status: "success",
            message: "GameRtp record created successfully.",
            data: {
                id: gameRtp.id,
                gameName: gameRtp.get("gameName"),
                rtp: gameRtp.get("rtp"),
                scatter: gameRtp.get("scatter"),
                wild: gameRtp.get("wild"),
            },
        };
    } catch (error) {
        // Handle different error types
        if (error instanceof Parse.Error) {
            return {
                status: "error",
                code: error.code,
                message: error.message,
            };
        } else {
            return {
                status: "error",
                code: 500,
                message: "An unexpected error occurred.",
            };
        }
    }
});

Parse.Cloud.define("fetchGameRtpData", async (request) => {
    try {
        const { gameName, rtp } = request.params;

        // Check if both parameters are provided
        if (!gameName || !rtp) {
            throw new Parse.Error(
                Parse.Error.VALIDATION_ERROR,
                "Please provide both 'gamename' and 'rtp'."
            );
        }

        // Create a query on the 'GameRtp' class
        const gamertp = Parse.Object.extend("GameRtp");
        const query = new Parse.Query(gamertp);
        query.equalTo("gameName", gameName);
        query.equalTo("rtp", rtp);

        // Execute the query to find matching records
        const results = await query.find();

        // If no results found, return a message
        if (results.length === 0) {
            return {
                status: "error",
                message: `No records found for gameName '${gameName}' with rtp '${rtp}'.`,
            };
        }

        // Prepare the data to be returned
        const data = results.map((result) => {
            return {
                id: result.id,
                gameName: result.get("gameName"),
                rtp: result.get("rtp"),
                scatter: result.get("scatter"),
                wild: result.get("wild"),
            };
        });

        // Return user and their game data
        return {
            status: "success",
            gameRtpData: data,
        };
    } catch (error) {
        // Handle different error types
        if (error instanceof Parse.Error) {
            // Return the error if it's a Parse-specific error
            return {
                status: "error",
                code: error.code,
                message: error.message,
            };
        } else {
            // Handle any unexpected errors
            return {
                status: "error",
                code: 500,
                message: "An unexpected error occurred.",
            };
        }
    }
});

Parse.Cloud.beforeSave("Test", () => {
    throw new Parse.Error(9001, "Saving test objects is not available.");
});
