const thread = require("worker_threads")

console.log("Worker_Socket:", thread.workerData.socket)

thread.parentPort.postMessage("kys")