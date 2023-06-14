
/**
 * @type  {socket.Server}
 */
let server_socket;

/**
 * @type {[newGame]}
 */
let games = {}

const start_minutes = 1000*30//2*60*1000;
const turn_minutes = 1000*10//1*60*1000;



const PORT = 5555
const verbose = true;

const clear_uimput_regexp = /[^0-9A-Z]/gi
const color_uimput_regexp_test = /^#(?:[0-9a-fA-F]{3}){1,2}$/


const express = require("express")
const server = express()
const path = require("path")
const j = path.join
const socket = require("socket.io")

/**
 * 
 * @param {newGame} da_agme 
 */
function startTimeout(da_agme){
    return setTimeout(startGame, start_minutes, da_agme);
}


function log(val){
    if(verbose){
        console.log(val);
    }
}

function startGame(game){
    if(game.joinable == false){
        //the game is already started
    }
    else{
        game.joinable = false
        for (let index = 0; index < game.connecions.length; index++) {
            const socket = game.connecions[index];
            socket.emit("start", "the game begisns")
        }
        game.start()
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
        this.startTimeout = undefined;
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


    renewTimeout(){
        //the timeout renews
        clearTimeout(this.startTimeout)
        this.startTimeout = setTimeout(startGame, start_minutes, this);
        this.broadCast("startTime", start_minutes)
    }

    appendConnection(incoming_socket){
        this.connecions.push(incoming_socket)
        let shit = JSON.stringify({
            x:this.x,
            y:this.y,
            turn: turn_minutes
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

    setHost(incoming_socket){
        incoming_socket.socket_info.host = false
        if(this.connecions.length == 0){
            incoming_socket.socket_info.host = true
            incoming_socket.once("start", () => {startGame(this)})  
            return true
        }
        return false
    }

    connectionCheck(incoming_socket){
        if(this.joinable){
            if(incoming_socket.socket_info.password == this.password){
                return true
            }
        }
        return false

    }

    broadCast(event, message){
        for (let index = 0; index < this.connecions.length; index++) {
            const socket = this.connecions[index];
            socket.emit(event, message)
        }
    }
    /**
     * @param {socket.Socket} incoming_socket 
     */
    acceptConnectionV2(socket){
        if(this.connectionCheck == false){
            this.disconnectSocket(socket)
            return false
        }
        this.setHost(socket)
        this.appendConnection(socket)
        this.renewTimeout()
        return true
    }

    disconnectSocket(socket){
        log(this.connecions)
        log(socket)
        const index = this.connecions.indexOf(socket);
        //log("disconnected", socket.socket_info)
        if (index > -1) { 
            this.connecions.splice(index, 1); // 1 is for only 1
        }
        else{
            log("no splice")
        }
        log(this.connecions.length)
        if(this.connecions.length == 0){
            this.end()
        }
        //the game not end
        else if(socket.socket_info.host){
            this.connecions[0].socket_info.host = true;
        }

        socket.disconnect()
        
    }

    disconnectSocketList(socket, connecions){
        log(connecions)
        log(socket)
        const index = connecions.indexOf(socket);
        //log("disconnected", socket.socket_info)
        if (index > -1) { 
            connecions.splice(index, 1); // 1 is for only 1
        }
        else{
            log("no splice")
        }
        log(connecions.length)
        if(connecions.length == 0){
            this.end()
        }
        //the game not end
        else if(socket.socket_info.host){
            connecions[0].socket_info.host = true;
        }

        socket.disconnect()
        
    }


    async start(){
        while(true){
            //gameloop
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
                coord.color = element.socket_info.color; coord.username = element.socket_info.username;

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
            let timeout = setTimeout(() => {

                log(this.connecions)
                socket.emit("timeout", "Your Turn had timed out..")
                this.disconnectSocket(socket)

                res({x: null, y: null})

            }, turn_minutes)
            socket.once("selected", (coord_str) => {
                res(JSON.parse(coord_str))
                clearTimeout(timeout);
            })
        })
    }

    end(){
        log("end")
        delete games[this.hostname]
    }
}

function setAndClean(socket, inc_data){
    //some kind of sanitization
    socket.socket_info = {}
    socket.socket_info.hostname = inc_data.hostname.replace(clear_uimput_regexp, "");
    if(!color_uimput_regexp_test.test(inc_data.color)){
        throw new Error("color was not a hex color value")
    }
    socket.socket_info.color = inc_data.color;
    socket.socket_info.username = inc_data.username.replace(clear_uimput_regexp, "");
    socket.socket_info.password = inc_data.password.replace(clear_uimput_regexp, "");
}

/**
 * 
 * @param {socket.Socket} socket 
 */
function newJoin(socket){
    socket.once("join", (json) => {
        //log("newJoin:")
        setAndClean(socket, JSON.parse(json))

        let da_agme = games[socket.socket_info.hostname]
        if(da_agme == undefined){
            log("no correct host found")
            socket.emit("nohost", "true")
            socket.disconnect()
            return 0
        }
        da_agme.acceptConnectionV2(socket)
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

server.get("/socket.io/socket.io.js", (_req, res, _next) => {
    res.sendFile(j(__dirname, "node_modules/socket.io-client/dist/socket.io.js"))
})

//do with nginx
/*
server.get("/assets/*", (req, res, _next) => {
    res.sendFile(j(__dirname, req.path))
})
*/

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

server.post("/online/host", (req, res, _next) => {
    //log(req.body)
    //create a new game
    if(req.body.hostname == undefined){throw "game not defined"}
    if(games[req.body.hostname] != undefined){throw "game exists"}

    let createdGame = new newGame(req)
    games[createdGame.hostname] = createdGame
    //timeout that bitch

    res.send(JSON.stringify("Created Da boi"))
})


server.post("*", (_req, res, _next) => {
    res.send("We dont do that here")
})

server_socket = new socket.Server(
    //listen call returns the server instance
    server.listen(PORT, () => {
        log(`Running on port ${PORT}`)
    })
)

server_socket.on("connection", newJoin)
