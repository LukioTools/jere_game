const thread = require("worker_threads")
const soc = require("socket.io")
/**
 * @type {soc.Socket}
 */
let socket = thread.workerData.socket
console.log("Worker_Socket:", )

while (true){
    socket.set
}


thread.parentPort.postMessage("kys")