const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const Groq = require("groq-sdk");

const PORT = 3000;


// =========================
// GROQ
// =========================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


// =========================
// USERS FILE
// =========================

const usersFile =
    path.join(__dirname, "users.json");


if (!fs.existsSync(usersFile)) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify([], null, 2)
    );

}


// =========================
// USER FUNCTIONS
// =========================

function getUsers() {

    try {

        return JSON.parse(
            fs.readFileSync(
                usersFile,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "Users file error:",
            error
        );

        return [];

    }

}


function saveUsers(users) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(
            users,
            null,
            2
        )
    );

}


// =========================
// PASSWORD HASH
// =========================

function hashPassword(password) {

    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

}


// =========================
// READ REQUEST BODY
// =========================

function getRequestBody(req) {

    return new Promise(
        (resolve, reject) => {

            let body = "";

            req.on(
                "data",
                chunk => {
                    body += chunk;
                }
            );

            req.on(
                "end",
                () => {

                    try {

                        resolve(
                            JSON.parse(body)
                        );

                    } catch (error) {

                        reject(
                            new Error(
                                "Invalid JSON"
                            )
                        );

                    }

                }
            );

            req.on(
                "error",
                reject
            );

        }
    );

}


// =========================
// SERVER
// =========================

const server =
    http.createServer(
        async (req, res) => {


            // =========================
            // SIGN UP
            // =========================

            if (
                req.url === "/api/signup" &&
                req.method === "POST"
            ) {

                try {

                    const {
                        name,
                        email,
                        password
                    } =
                        await getRequestBody(req);


                    if (
                        !name ||
                        !email ||
                        !password
                    ) {

                        res.writeHead(
                            400,
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        );

                        res.end(
                            JSON.stringify({
                                error:
                                    "Name, email and password are required."
                            })
                        );

                        return;

                    }


                    const users =
                        getUsers();


                    const normalizedEmail =
                        email
                            .trim()
                            .toLowerCase();


                    // Check existing account
                    const existingUser =
                        users.find(
                            user =>
                                user.email ===
                                normalizedEmail
                        );


                    if (existingUser) {

                        res.writeHead(
                            409,
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        );

                        res.end(
                            JSON.stringify({
                                error:
                                    "An account with this email already exists."
                            })
                        );

                        return;

                    }


                    // Create user
                    const newUser = {

                        id:
                            crypto.randomUUID(),

                        name:
                            name.trim(),

                        email:
                            normalizedEmail,

                        password:
                            hashPassword(
                                password
                            )

                    };


                    users.push(
                        newUser
                    );


                    saveUsers(
                        users
                    );


                    // Never send password to browser
                    const safeUser = {

                        id:
                            newUser.id,

                        name:
                            newUser.name,

                        email:
                            newUser.email

                    };


                    res.writeHead(
                        201,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );


                    res.end(
                        JSON.stringify({

                            message:
                                "Account created successfully.",

                            user:
                                safeUser

                        })
                    );


                    console.log(
                        "New account:",
                        normalizedEmail
                    );


                    return;


                } catch (error) {

                    console.error(
                        "Signup Error:",
                        error
                    );


                    res.writeHead(
                        500,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );


                    res.end(
                        JSON.stringify({
                            error:
                                error.message
                        })
                    );


                    return;

                }

            }


            // =========================
            // LOGIN
            // =========================

            if (
                req.url === "/api/login" &&
                req.method === "POST"
            ) {

                try {

                    const {
                        email,
                        password
                    } =
                        await getRequestBody(req);


                    if (
                        !email ||
                        !password
                    ) {

                        res.writeHead(
                            400,
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        );

                        res.end(
                            JSON.stringify({
                                error:
                                    "Email and password are required."
                            })
                        );

                        return;

                    }


                    const users =
                        getUsers();


                    const normalizedEmail =
                        email
                            .trim()
                            .toLowerCase();


                    const user =
                        users.find(
                            user =>
                                user.email ===
                                normalizedEmail
                        );


                    if (!user) {

                        res.writeHead(
                            401,
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        );

                        res.end(
                            JSON.stringify({
                                error:
                                    "Invalid email or password."
                            })
                        );

                        return;

                    }


                    const passwordHash =
                        hashPassword(
                            password
                        );


                    if (
                        passwordHash !==
                        user.password
                    ) {

                        res.writeHead(
                            401,
                            {
                                "Content-Type":
                                    "application/json"
                            }
                        );

                        res.end(
                            JSON.stringify({
                                error:
                                    "Invalid email or password."
                            })
                        );

                        return;

                    }


                    // Never send password
                    const safeUser = {

                        id:
                            user.id,

                        name:
                            user.name,

                        email:
                            user.email

                    };


                    res.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );


                    res.end(
                        JSON.stringify({

                            message:
                                "Login successful.",

                            user:
                                safeUser

                        })
                    );


                    console.log(
                        "Login:",
                        normalizedEmail
                    );


                    return;


                } catch (error) {

                    console.error(
                        "Login Error:",
                        error
                    );


                    res.writeHead(
                        500,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );


                    res.end(
                        JSON.stringify({
                            error:
                                error.message
                        })
                    );


                    return;

                }

            }


            // =========================
            // GROQ CHAT API
            // =========================

            if (
                req.url === "/api/chat" &&
                req.method === "POST"
            ) {

                try {

                    const {
                        message
                    } =
                        await getRequestBody(req);


                    if (!message) {

                        throw new Error(
                            "Message is required."
                        );

                    }


                    if (
                        !process.env.GROQ_API_KEY
                    ) {

                        throw new Error(
                            "GROQ_API_KEY is not set."
                        );

                    }


                    const completion =
                        await groq.chat.completions.create({

                            model:
                                "openai/gpt-oss-20b",

                            messages: [

                                {
                                    role:
                                        "system",

                                    content:
                                        "You are DulaaX GPT, a helpful AI assistant. Answer clearly and naturally."
                                },

                                {
                                    role:
                                        "user",

                                    content:
                                        message
                                }

                            ]

                        });


                    const reply =
                        completion
                            .choices[0]
                            .message
                            .content;


                    res.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );


                    res.end(
                        JSON.stringify({
                            reply:
                                reply
                        })
                    );


                } catch (error) {

                    console.error(
                        "Groq Error:",
                        error
                    );


                    res.writeHead(
                        500,
                        {
                            "Content-Type":
                                "application/json"
                        }
                    );


                    res.end(
                        JSON.stringify({
                            error:
                                error.message
                        })
                    );

                }


                return;

            }


            // =========================
            // WEBSITE FILES
            // =========================

            let filePath;


            if (req.url === "/") {

                filePath =
                    path.join(
                        __dirname,
                        "index.html"
                    );

            } else {

                filePath =
                    path.join(
                        __dirname,
                        req.url
                    );

            }


            const ext =
                path.extname(
                    filePath
                );


            const contentTypes = {

                ".html":
                    "text/html",

                ".css":
                    "text/css",

                ".js":
                    "text/javascript",

                ".png":
                    "image/png",

                ".jpg":
                    "image/jpeg",

                ".jpeg":
                    "image/jpeg",

                ".json":
                    "application/json"

            };


            const contentType =
                contentTypes[ext] ||
                "text/plain";


            fs.readFile(
                filePath,
                (err, data) => {

                    if (err) {

                        res.writeHead(
                            404
                        );

                        res.end(
                            "File not found"
                        );

                        return;

                    }


                    res.writeHead(
                        200,
                        {
                            "Content-Type":
                                contentType
                        }
                    );


                    res.end(
                        data
                    );

                }
            );

        }
    );


// =========================
// START SERVER
// =========================

server.listen(
    PORT,
    () => {

        console.log(
            `DulaaX GPT running at http://localhost:${PORT}`
        );

    }
);
