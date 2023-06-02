const express = require("express")
const server = express()
const https = require("https")
const fs = require("fs")
const path = require("path")
const j = path.join

const socket = require("socket.io")

const bParse = require("body-parser")


/*
const thread = require("worker_threads")
//accept socets
const socket_worker = new thread.Worker(j(__dirname, "socket_worker.js"))
*/

function newSocketHandle(socket){
    console.log(socket)

    socket.on("join", (json) => {
        socket.socket_info = JSON.parse(json)
        console.log(socket.socket_info)
        connecions.push(socket)
    })

    socket.on("disconnect", () => {
        const index = connecions.indexOf(socket);
        // only splice array when item is found
        console.log("disconnected", socket.socket_info)
        if (index > -1) { 
            connecions.splice(index, 1); // 1 is for only 1
        }
        socket.disconnect()
    })
}

let connecions = []

const PORT = 8080
server.use(bParse.urlencoded({extended: true}))
server.use((req, res, next) => {
    //console.log(req.body)
    //console.log(req.query)
    next()
})


let server_socket;

startHttpsServer(https, server, PORT)

server_socket.of("/socket").on("connection", newSocketHandle)

function startHttpsServer(https, app, PORT){
    //create and listen to https server
    server_socket = new socket.Server(
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
        })
    )
}

server.get("/socket.io/socket.io.js", (req, res, next) => {
    res.sendFile(j(__dirname, "node_modules/socket.io-client/dist/socket.io.js"))
})

server.get("/assets/*", (req, res, next) => {
    res.sendFile(j(__dirname, req.path))
})


server.get("/online/join", (req, res, next) => {
    res.sendFile(j(__dirname, "join.html"))

})

server.get("/online/host", (req, res, next) => {
    //create a new game
    res.sendFile(j(__dirname, "host.html"))
})


server.post("/online/host", (req, res, next) => {
    //create a new game

})

server.get("*", (req, res, next) => {
    res.redirect("/online/join")
})


server.post("*", (req, res, next) => {
    res.send("We dont do that here")
})


function getChar() {
    return new Promise((res, rej) => {
        let buffer = Buffer.alloc(1)
        fs.read(0, buffer, 0, 1, undefined, (err, bytesRead, buffer2) => {
            res(buffer2.toString('utf8'))
        })
    })
}

function getCharBlock(){
    let buffer = Buffer.alloc(1)
    fs.readSync(0, buffer, 0, 1)
    return buffer.toString('utf8')
}

/*
while (true){
    console.log("press s")
    let char = getCharBlock()
    if(char == "s"){
        connecions.forEach((el) => {console.log(el.socket_info)})
    }
}
*/