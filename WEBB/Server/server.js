
/**
 * @type  {socket.Server}
 */
let server_socket;

const verbose = false;

const clear_uimput_regexp = /[^0-9A-Z]/gi
const color_uimput_regexp_test = /^#(?:[0-9a-fA-F]{3}){1,2}$/

const express = require("express")
const server = express()
const https = require("https")
const fs = require("fs")
const path = require("path")
const j = path.join
const socket = require("socket.io")


const PORT = 5555

/**
 * @type {[newGame]}
 */
let games = {}


function log(val){
    if(verbose){
        console.log(val);
    }
}

class newGame{
    /**
     * 
     * @param {*} req 
     */
    constructor(req){
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
        if(req.body.password == undefined){
            this.status = "No Password"
            return 0
        }
        if(req.body.x == undefined){
            throw new Error("no x")
        }
        if(req.body.y== undefined){
            throw new Error("no y")
        }
        this.hostname = req.body.hostname.replace(clear_uimput_regexp, "")
        this.password = req.body.password.replace(clear_uimput_regexp, "")

        this.x = parseInt(req.body.x)
        this.y = parseInt(req.body.y)

        if(this.x < 1 || this.x > 1024){
            throw new Error("wrong x")
        }
        if(this.y < 1 || this.y > 1024){
            throw new Error("wrong y")
        }

        //log("Listeing..", j(base_socket, this.hostname))
        //this.socket_namespace = socket.of(j(base_socket, this.hostname))
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
            //log(incoming_socket.socket_info)
            if(incoming_socket.socket_info.password == this.password){
                incoming_socket.socket_info.host = false
                if(this.connecions.length == 0){
                    incoming_socket.socket_info.host = true
                    incoming_socket.once("start", () => {
                        this.joinable = false
                        for (let index = 0; index < this.connecions.length; index++) {
                            const socket = this.connecions[index];
                            socket.emit("start", "the game begisns")
                        }
                        //log("startGame")
                        this.start()
                    }) 
                }
                this.connecions.push(incoming_socket)
                let shit = JSON.stringify({
                    x:this.x,
                    y:this.y
                })
                //log(shit)
                incoming_socket.emit("success", shit)
                let json_ls = [];
                for (let index = 0; index < this.connecions.length; index++) {
                    const element = this.connecions[index];
                    json_ls.push(element.socket_info)
                }
                let js_str = JSON.stringify(json_ls)
                this.broadCast("players", js_str)
            }
            else{
                log("destroying socket")
                incoming_socket.disconnect()
            }
        }        
    }
    disconnectSocket(socket){
        
        const index = this.connecions.indexOf(socket);
        //log("disconnected", socket.socket_info)
        if (index > -1) { 
            this.connecions.splice(index, 1); // 1 is for only 1
        }
        else{
            log("no splice")
        }

        if(socket.socket_info.host){
            this.connecions[0].socket_info.host = true;
        }

        socket.disconnect()
        log(this.connecions.length)
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
                //log("waitting", element.socket_info.username)
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
        return new Promise((res, _rej) => {
            socket.once("selected", (coord_str) => {
                res(JSON.parse(coord_str))
            })
        })
    }

    end(){
        log("end")
        games[this.hostname] = undefined
    }
}


/*
const thread = require("worker_threads")
//accept socets
const socket_worker = new thread.Worker(j(__dirname, "socket_worker.js"))
*/


/**
 * 
 * @param {socket.Socket} socket 
 */
function newJoin(socket){
    socket.once("join", (json) => {
        //log("newJoin:")
        let inc_data = JSON.parse(json)


        socket.socket_info = {}
        socket.socket_info.hostname = inc_data.hostname.replace(clear_uimput_regexp, "");
        if(!color_uimput_regexp_test.test(inc_data.color)){
            throw new Error("color was not a hex color value")
        }
        socket.socket_info.color = inc_data.color;
        socket.socket_info.username = inc_data.username.replace(clear_uimput_regexp, "");
        socket.socket_info.password = inc_data.password.replace(clear_uimput_regexp, "");


        let da_agme = games[socket.socket_info.hostname]
        if(da_agme == undefined){
            log("no correct host found")
            socket.emit("nohost", "true")
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


//let connecions = []

server.use(express.urlencoded({extended: true}))
server.use(express.json({extended: true}))
server.use((_req, _res, next) => {
    //log(req.body)
    //log(req.query)
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
            log("serever is runing at port", PORT);
        })
    )
}

server.get("/socket.io/socket.io.js", (_req, res, _next) => {
    res.sendFile(j(__dirname, "node_modules/socket.io-client/dist/socket.io.js"))
})
server.get("/assets/*", (req, res, _next) => {
    res.sendFile(j(__dirname, req.path))
})
server.get("/online/join", (_req, res, _next) => {
    res.sendFile(j(__dirname, "/assets/join.html"))

})
server.get("/online/host", (_req, res, _next) => {
    //create a new game
    res.sendFile(j(__dirname, "/assets/host.html"))
})
server.get("/offline/*", (_req, res, _next) => {
    //create a new game
    res.sendFile(j(__dirname, "/assets/index.html"))
})
server.get("/favicon.ico", (_req, res, _next) => {
    res.sendStatus(404);
})

server.get("*", (req, res, _next) => {
    //log(req.path);
    res.redirect("/online/join")
})

server.post("/online/host", (req, res) => {
    //log(req.body)
    //create a new game
    if( req.body.hostname == undefined){throw "game not defined"}
    if(games[req.body.hostname] != undefined){/*game exists*/ throw "game exists"}

    let createdGame = new newGame(req)
    games[createdGame.hostname] = createdGame

    res.send(JSON.stringify("Created Da boi"))
})


server.post("*", (_req, res, _next) => {
    res.send("We dont do that here")
})
