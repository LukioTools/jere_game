
/**
 * @type  {socket.Server}
 */
let server_socket;


const express = require("express")
const server = express()
const https = require("https")
const fs = require("fs")
const path = require("path")
const j = path.join


const socket = require("socket.io")

const bParse = require("body-parser")
const base_socket = "/socket/"

/**
 * @type {[newGame]}
 */
let games = {}


class newGame{
    /**
     * 
     * @param {*} req 
     * @param {socket.Server} socket 
     */
    constructor(req, socket){
        /**
         * @type {[socket.Socket]}
         */
        this.connecions = []
        this.joinable = true
        this.status = 0
        if(req.body == undefined){
            this.status = "No Body"
            return 0
        }
        if(req.body.hostname == undefined){
            this.status = "No Hostname"
            return 0
        }
        if(req.body.hostname == undefined){
            this.status = "No Password"
            return 0
        }
        if(req.body.x == undefined){
            throw new Error("no x")
        }
        if(req.body.y== undefined){
            throw new Error("no y")
        }

        this.hostname = req.body.hostname
        this.password = req.body.password

        this.x = parseInt(req.body.x)
        this.y = parseInt(req.body.y)

        if(this.x < 1){
            throw new Error("wrong x")
        }
        if(this.y < 1){
            throw new Error("wrong y")
        }

        console.log("Listeing..", j(base_socket, this.hostname))
        this.socket_namespace = socket.of(j(base_socket, this.hostname))
    }

    broadCast(event, message){
        for (let index = 0; index < this.connecions.length; index++) {
            const socket = this.connecions[index];
            socket.emit(event, message)
        }
    }
    /**
     * 
     * @param {socket.Socket} incoming_socket 
     */
    acceptConnection(incoming_socket){
        if(this.joinable){
            //console.log(incoming_socket.socket_info)
            if(incoming_socket.socket_info.password == this.password){
                if(this.connecions.length == 0){
                    incoming_socket.socket_info.host = true
                    incoming_socket.once("start", () => {
                        this.joinable = false
                        for (let index = 0; index < this.connecions.length; index++) {
                            const socket = this.connecions[index];
                            socket.emit("start", "the game begisns")
                        }
                        console.log("startGame")
                        this.start()
                    }) 
                }
                this.connecions.push(incoming_socket)
                incoming_socket.emit("success", JSON.stringify({
                    x:this.x,
                    y:this.y
                }))
                let json_ls = [];
                for (let index = 0; index < this.connecions.length; index++) {
                    const element = this.connecions[index];
                    json_ls.push(element.socket_info)
                }
                let js_str = JSON.stringify(json_ls)
                this.broadCast("players", js_str)
            }
            else{
                console.log("destroying socket")
                incoming_socket.disconnect()
            }
        }        
    }
    disconnectSocket(socket){
        
        const index = this.connecions.indexOf(socket);
        console.log("disconnected", socket.socket_info)
        if (index > -1) { 
            this.connecions.splice(index, 1); // 1 is for only 1
        }
        else{
            console.log("no splice")
        }
        socket.disconnect()
        console.log(this.connecions.length)
        if(this.connecions.length == 0){
            this.end()
        }
    }
    async start(){
        while(true){
            for (let index = 0; index < this.connecions.length; index++) {
                /**
                 * @type {socket.Socket}
                 */
                const element = this.connecions[index];
                this.broadCast("turn", JSON.stringify({
                    username: element.socket_info.username, 
                    color: element.socket_info.color
                }))
                console.log("waitting", element.socket_info.username)
                element.emit("thisturn", true)
                let coord = await this.waitSelection(element)
                coord.color = element.socket_info.color
                coord.username = element.socket_info.username
                this.broadCast("place", JSON.stringify(coord))
            }
        }
    }

    /**
     * 
     * @param {socket.RemoteSocket} socket 
     */
    async waitSelection(socket){
        return new Promise((res, rej) => {
            socket.once("selected", (coord_str) => {
                res(JSON.parse(coord_str))
            })
        })
    }

    end(){
        console.log("end")
        games[this.hostname] = undefined
    }
}


/*
const thread = require("worker_threads")
//accept socets
const socket_worker = new thread.Worker(j(__dirname, "socket_worker.js"))
*/



function newJoin(socket){

    socket.once("join", (json) => {
        console.log("newJoin:")
        socket.socket_info = JSON.parse(json)
        let da_agme = games[socket.socket_info.hostname]
        if(da_agme == undefined){
            console.log("no correct host found")
            socket.disconnect()
            return 0
        }
        da_agme.acceptConnection(socket)
    })

    socket.once("disconnect", () => {
        if(socket.socket_info == undefined){
            socket.disconnect()
        }
        else{
            let da_agme = games[socket.socket_info.hostname]
            if(da_agme != undefined){
                da_agme.disconnectSocket(socket)
            }
        }
    })
}


let connecions = []

const PORT = 8080
server.use(express.urlencoded({extended: true}))
server.use(express.json({extended: true}))
server.use((req, res, next) => {
    //console.log(req.body)
    //console.log(req.query)
    next()
})

startHttpsServer(https, server, PORT)

server_socket.on("connection", newJoin)


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
server.get("*", (req, res, next) => {
    res.redirect("/online/join")
})

server.post("/online/host", (req, res, next) => {
    console.log(req.body)
    //create a new game
    if( req.body.hostname == undefined){throw "game not defined"}
    if(games[req.body.hostname] != undefined){/*game exists*/ throw "game exists"}

    games[req.body.hostname] = new newGame(req, server_socket)
    res.send(JSON.stringify({path: j("/socket/join/", req.body.hostname)}))
})


server.post("*", (req, res, next) => {
    res.send("We dont do that here")
})
