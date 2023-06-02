const socket = require("socket.io")
const thread = require("worker_threads")
const socket_server = new socket.Server(SOCKET_PORT) 

let connecions = []

socket_server.on("connection", (socket) => {
    //host a new instance

    connecions.push(socket)

})