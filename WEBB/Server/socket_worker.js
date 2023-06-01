const SOCKET_PORT = 25565
const socket = require("socket.io")
const thread = require("worker_threads")
const socket_server = new socket.Server(SOCKET_PORT) 

socket_server.on("connection", (socket) => {
    //host a new instance
    let worker = new thread.Worker("./host_session.js", {
        workerData: {
            socket: socket
        }
    })

    worker.on('message', (msg) => {
        console.log('Parent Message:', msg);
    });
})