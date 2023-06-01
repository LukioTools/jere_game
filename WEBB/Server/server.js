const express = require("express")
const server = express()
const https = require("https")
const fs = require("fs")
const path = require("path")
const j = path.join
const PORT = 8080


server.use((req, res, next) => {
    /*
    console.log(req)
    console.log(res)
    */
    next()
})

startHttpsServer(https, server, PORT)

function startHttpsServer(https, app, PORT){
    //create and listen to https server
    https
    .createServer(
            // Provide the private and public key to the server by reading each
            // file's content with the readFileSync() method.
        {
        key: fs.readFileSync("private/key.pem"),
        cert: fs.readFileSync("private/cert.pem"),
        },
        app
    )
    .listen(PORT, () => {
        console.log("serever is runing at port", PORT);
    });
}

server.get("/assets/*", (req, res, next) => {
    res.sendFile(j(__dirname, req.path))
})


server.get("*", (req, res, next) => {
    res.sendFile(j(__dirname, "assets/index.html"))
})