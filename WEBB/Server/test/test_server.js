const https = require("http")
const socketio = require("socket.io")
const express = require("express")
const server = express()

const PORT = 443

let server_socket = new socketio.Server(
    https
    .createServer(
        {
            key: fs.readFileSync("private/key.pem"),
            cert: fs.readFileSync("private/cert.pem"),
        },
        server
    )
    .listen(PORT, () => {
        console.log("serever is runing at port", PORT);
    })
)

server_socket.on("connection", newJoin)



function newJoin(socket){
    console.log("incoming")
    console.log(socket)


    socket.once("join", (json) => {
        console.log("newJoin:")
    })

    socket.once("disconnect", () => {
        socket.disconnect()
    })
}