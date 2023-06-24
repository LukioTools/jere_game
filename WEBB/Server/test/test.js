const thread = require("worker_threads")

let worker = new thread.Worker("./test_child.js", {
    workerData: {
        socket: {sakdj:12312,fsjdhf4:12332}
    }
})

worker.on('message', (msg) => {
    console.log('Parent Message:', msg);
});