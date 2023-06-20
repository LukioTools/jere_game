
/**
 * @type  {socket.Server}
 */
let server_socket;


//TODO send data when ending game
//TODO multiple destroy notices and timeouts should be closded before ending the games

/**
 * @type {[newGame]}
 */
let games = {}

const start_ns = 120_000;
const turn_ns = 1*10*1000;

const clean_inter_ns = 1*1000;
const game_max_alive = 240_000;

const PORT = 22255;
const verbose = false;

const clear_uimput_regexp = /[^0-9a-zA-Z]/g
const color_uimput_regexp_test = /^#(?:[0-9a-fA-F]{3}){1,2}$/


const express = require("express")
const server = express()
const path = require("path")
const j = path.join
const socket = require("socket.io")



function log(val){
    if(verbose){
        log(val);
    }
}

function startGame(game){
    if(game.joinable == true){
        game.joinable = false
        for (let index = 0; index < game.connecions.length; index++) {
            const socket = game.connecions[index];
            socket.emit("start", "the game begisns")
        }
        game.start()
    }
    return 0
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
        this.ended = false
        this.creationTime = Date.now()
        this.timeout = undefined;
        this.startTimeout = undefined;

        this.diagonal = true;

        if(req.body == undefined){
            throw new Error("No Body")
        }
        if(req.body.hostname == undefined){
            throw new Error("No Hostname")
        }
        if(req.body.password == undefined){
            throw new Error("No Password")
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
        //dont renew timeout
        //the timeout renews
        //clearTimeout(this.startTimeout)
        //this.startTimeout = setTimeout(startGame, start_ns, this);
        this.broadCast("startTime", (this.creationTime + start_ns))
    }

    appendConnection(incoming_socket){
        //append connection
        this.connecions.push(incoming_socket)

        //send the data
        let success_data = JSON.stringify({
            x:this.x,
            y:this.y,
            turn: turn_ns,
            serverCreation: this.creationTime,
            serverAlive: game_max_alive,
            host: incoming_socket.socket_info.host,
            diagonal: this.diagonal
        })
        incoming_socket.emit("success", success_data)

        this.broadCastPlayers()
    }

    broadCastPlayers(){
        //broadcast players
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
            //console.log(this.password)
            //console.log(incoming_socket.socket_info.password)
            if(incoming_socket.socket_info.password == this.password){
                return true
            }
        }
        //console.log("pwd failed")
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
        if(this.connectionCheck(socket) == false){
            this.disconnectSocket(socket)
            return false
        }
        this.setHost(socket)
        this.appendConnection(socket)
        this.renewTimeout()
        return true
    }

    disconnectSocket(socket){
        //log(this.connecions)
        //log(socket)
        const index = this.connecions.indexOf(socket);
        //log("disconnected", socket.socket_info)
        if (index > -1) { 
            this.connecions.splice(index, 1); // 1 is for only 1
        }
        else{
            log("no splice")
        }
        socket.disconnect(true)

        if(this.connecions.length == 0){
            this.ended = true;
            this.end("no more players")
        }
        else{
            if(socket.socket_info.host){
                this.connecions[0].socket_info.host = true;
            }
            this.broadCastPlayers()
        }
    }


    async start(){
        while(true){
            //gameloop
            if(this.ended){return 0;}
            if(this.connecions.length == 0){
                this.end("no more players")
                return 0;
            }
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
            this.timeout = setTimeout(() => {

                log("timeout")
                //log(this.connecions)
                socket.emit("timeout", "Your Turn had timed out..")
                this.disconnectSocket(socket)

                res({x: null, y: null})

            }, turn_ns)
            socket.once("selected", (coord_str) => {
                clearTimeout(this.timeout);
                let unsanitized = JSON.parse(coord_str)
                let out = {}
                out.x = unsanitized.x;
                out.y = unsanitized.y;
                res(out)
            })
        })
    }

    end(reason="true"){
        clearTimeout(this.timeout)
        clearTimeout(this.startTimeout)

        log("end", reason)
        //log(this.connecions.length)
        //disconnect the mf
        if(this.connecions.length == 0){
            this.broadCast("end", reason)
            //disconnect sockets
            for (let index = 0; index < this.connecions.length; index++) {
                const socket = this.connecions[index];
                socket.disconnect(true);
            }
        }

        log("delete", this.hostname)
        //delete the game
        delete games[this.hostname]
    }
}

function setAndClean(socket, inc_data){
    //some kind of sanitization
    if(inc_data.hostname == undefined || inc_data.hostname == ""){
        return "hostname was not defined"
    }
    if(inc_data.username == undefined || inc_data.username == ""){
        return "username was not defined"
    }
    if(inc_data.password == undefined){
        return "password was not defined"
    }
    if(inc_data.color == undefined || inc_data.color == ""){
        return "color was not defined"
    }

    socket.socket_info = {}
    socket.socket_info.hostname = inc_data.hostname.replace(clear_uimput_regexp, "");
    if(!color_uimput_regexp_test.test(inc_data.color)){
        throw new Error("color was not a hex color value")
    }
    socket.socket_info.color = inc_data.color;
    socket.socket_info.username = inc_data.username.replace(clear_uimput_regexp, "");
    socket.socket_info.password = inc_data.password.replace(clear_uimput_regexp, "");
    //console.log(socket.socket_info)
    return null
}

/**
 * 
 * @param {socket.Socket} socket 
 */
function newConnection(socket){
    let socket_join_timeout = setTimeout(() => {
        //console.log("wait join timeout")
        socket.disconnect(true)
    }, 6000)
    socket.once("join", (json) => {
        clearTimeout(socket_join_timeout)

        let err = setAndClean(socket, JSON.parse(json))
        if(err){
            socket.emit("join_error", err)
            //console.log(err)
            socket.disconnect(true)
            return
        }

        let da_agme = games[socket.socket_info.hostname]
        if(da_agme == undefined){
            //console.log("no correct host found", socket.socket_info.hostname)
            socket.emit("nohost", "true")
            socket.disconnect(true)
            return 0
        }
        da_agme.acceptConnectionV2(socket)
    })

    socket.once("disconnect", () => {
        clearTimeout(socket_join_timeout)
        if(socket.socket_info == undefined){
            socket.disconnect(true)
        }
        else{
            let da_agme = games[socket.socket_info.hostname]
            if(da_agme != undefined){
                da_agme.disconnectSocket(socket)
            }
        }
    })
}



server.use(express.urlencoded({extended: true}))
server.use(express.json({extended: true}))



let nginx_bool = false
for (let index = 0; index < process.argv.length; index++) {
    const element = process.argv[index];
    if(element == "--nginx" || element == "-n"){
        nginx_bool = true
    };
}

//do with nginx
if(nginx_bool == false){
    log("Running on standalone mode")

    server.get("/socket.io/socket.io.js", (_req, res, _next) => {
        res.sendFile(j(__dirname, "node_modules/socket.io-client/dist/socket.io.js"))
    })

    server.get("/assets/*", (req, res, _next) => {
        res.sendFile(j(__dirname, req.path))
    })

    server.get("/online/join", (_req, res, _next) => {
        res.sendFile(j(__dirname, "/assets/join.html"))

    })

    server.get("/offline/*", (_req, res, _next) => {
        //create a new game
        res.sendFile(j(__dirname, "/assets/index.html"))
    })
    server.get("/favicon.ico", (_req, res, _next) => {
        res.sendStatus(404);
    })

}


server.get("/online/host", (_req, res, _next) => {
    //create a new game
    res.sendFile(j(__dirname, "/assets/host.html"))
})

server.get("/online/matchmaking", (_req, res, _next) => { 
    const mm = []
    for (let key in games) {
        const game = games[key]
        if(game.ended == false && game.joinable == true){
            mm.push({
                hostname: game.hostname,
                players: game.connecions.length,
                password: game.password != "",
                size: {
                    x: game.x,
                    y: game.y
                }
            })
        }
    }       
        
    res.send(JSON.stringify(mm))
})

server.get("/ads.txt", (_req, res, _next) => {
    res.sendFile(j(__dirname, "ads.txt"))
})

server.get("ads.txt", (_req, res, _next) => {
    res.sendFile(j(__dirname, "ads.txt"))
})

server.get("*", (req, res, _next) => {
    //log(req.path);
    res.redirect("/online/join")
})

server.post("/online/host", (req, res, _next) => {
    log()
    if(req.body.hostname == undefined){
        res.send("Game Not Defined");
        throw "game not defined"
    }
    if(games[req.body.hostname] != undefined){
        res.send("Game Exists");
        throw "game exists"
    }

    let createdGame = new newGame(req)
    games[createdGame.hostname] = createdGame

    res.send(JSON.stringify("Created Da boi"))
})

server.post("/unity/VersinControl", (req, res, _next) => {
    if(req.body.key == "superSecretKeyThatShouldNotBeInPublicRepository"){
        fs.writeFile('./assets/unityVersionControl.txt', req.body.version, err => {
            if (err) {
              console.error(err)
              return
            }
            //file written successfully
          })
    }
    res.send("done")
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

server_socket.on("connection", newConnection)


setInterval(() => {
    //log("cleaning")
    for (let key in games) {
        let game = games[key]
        log(Date.now() - game.creationTime, game_max_alive, key, game.ended)
        if(Date.now() - game.creationTime > game_max_alive){
            log("ending");
            log(game.hostname);
            game.end("Reached Timeout");
            delete games[key];
        }
        else if(game.ended){
            log("ending");
            log(game.hostname);
            game.end("Game Ended");
            delete games[key];
        }
    }
    
}, clean_inter_ns)
