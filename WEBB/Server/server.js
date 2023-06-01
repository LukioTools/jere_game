const express = require("express")
const server = express()
const https = require("https")
const fs = require("fs")
const path = require("path")
const j = path.join

const thread = require("worker_threads")

//accept socets

const socket_worker = new thread.Worker(j(__dirname, "socket_worker.js"))

const PORT = 8080


server.use((req, res, next) => {
    console.log(req.query)
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


server.post("*", (req, res, next) => {
    res.send("We dont do that here")
})