let soc;
let parsed = {}
//contains server inctance data.
let server_data
let turn = false
let server_url = "/"

let playerCountdown;
let count_down = 0
let count_down_srv = 0
let idleTimeout;
let serverDiedTimeout;
let serverDiedInterval;

let serverCountdown_elemet;
let playerCountdown_elemet;


let start_interval;

//in ms
let refresh_rate = 64

function serverDied(){
    clearInterval(serverDiedInterval)
    clearInterval(playerCountdown)
    playerCountdown_elemet.innerHTML = ""
    serverCountdown_elemet.innerHTML = ""
    alert("server Died because you played too long..... git gud")
    soc.destroy(true);
}

function countDown(countdown_from){
    playerCountdown_elemet.innerHTML = (countdown_from - Date.now()) / 1000
}
function countDownServer(){
    serverCountdown_elemet.innerHTML = (server_data.serverCreation + server_data.serverAlive - Date.now()) / 1000
}


function waitForLoad() {
    return new Promise((res, rej) => {
        if (document.readyState === 'ready' || document.readyState === 'complete') {
            res()
        }
        else {
            document.onreadystatechange = () => {
                if (document.readyState == "complete") { res(); }
            }
        }
    })
}
function updateBar(data){
    //reset intervall
    count_down = 0
    clearInterval(playerCountdown)

    //set intervall
    playerCountdown = setInterval(countDown, refresh_rate, server_data.turn + Date.now())
    
    
    //idleTimeout = setTimeout()
    console.log(data)
    let data_parsed = JSON.parse(data)
    console.log(data_parsed)
    $(".turn_manager").css("background-color", data_parsed.color)

    $("#turn_manager").html(`<p class="playername">${data_parsed.username}</p>`);

    let bg = $("body")
    bg.css("background-color", data_parsed.color)
}


//autojoin
waitForLoad()
.then(() => {
    //parse url and put the shit in the boxes
    let params = window.location.search.substring(1).split("&")
    params.forEach(el => {
        let ee = el.split("=")
        parsed[ee[0]] = ee[1]
    })
    if (parsed.hostname != undefined) { document.getElementById("hostname").value = parsed.hostname }
    if (parsed.password != undefined) { document.getElementById("password").value = parsed.password }
    if (parsed.username != undefined) { document.getElementById("username").value = parsed.username }
    if (parsed.color != undefined) { document.getElementById("color").value = "#" + parsed.color }
    if (parsed.autojoin == 1 | parsed.autojoin == "1") {
        console.log("joining")
        join()
    }
})


function join() {
    //set som shit
    playerCountdown_elemet = document.getElementById("countdown")
    serverCountdown_elemet = document.getElementById("serveralive")



    //join the session 
    soc = io(server_url)

    soc.on('connect_error', function(err) {
        // handle server error here
        console.log('Error connecting to server', err);
        console.log(`%c${server_url} was not hosting a server...`, "background-color: red; color: azure;")
        soc.destroy()
        return -1
    });

    //joindata
    const join_data = {
        hostname: document.getElementById("hostname").value,
        password: document.getElementById("password").value,
        username: document.getElementById("username").value,
        color: document.getElementById("color").value
    }
    console.log("join_data", join_data)
    soc.emit("join", JSON.stringify(join_data))




    //on success set the icnoming server parameters
    soc.on("success", (val) => {
        server_data = JSON.parse(val)
        //server_data
        console.log(server_data)
        generateGameBoard(server_data.x, server_data.y)

        //hide joining shits
        $(".join_inputs").addClass("dn");
        //show lobby 
        $(".lobby").removeClass("dn");

        //show start button if youre the host
        if (server_data.host == true) {
            $(".start_btn").removeClass("dn");
        }
        let server_death_ms = server_data.serverCreation + server_data.serverAlive - Date.now()
        serverDiedInterval = setInterval(countDownServer, refresh_rate)
        serverDiedTimeout = setTimeout(serverDied, server_death_ms)
    })

    soc.on("startTime", (time_ns_str) => {
        //the 
        let time_ns = parseInt(time_ns_str)
        let el = document.getElementById("startTime")
        clearInterval(start_interval)
        start_interval = setInterval(() => {
            let time_sec = (time_ns - Date.now()) / 1000
            let minutes = Math.floor(time_sec/60)
            let seconds = time_sec % 60
            el.innerHTML = `Minutes: ${minutes}, Seconds: ${seconds.toFixed(3)}`
        }, refresh_rate)
    })



    //when player leaves or joins
    soc.on("players", (players_string) => {
        //incoming players
        let players_json = JSON.parse(players_string)
        let players_html = "";
        for (let index = 0; index < players_json.length; index++) {
            const element = players_json[index];
            players_html += `<p class="player" style="background-color: ${element.color};">${element.username}</p>`
        }
        let el = document.getElementById("lobby_players")

        el.innerHTML = players_html

        console.log(players_json)
        
    })

    //when starts show board
    soc.on("start", () => {
        console.log("Starting...")
        $(".lobby").addClass("dn")
        showGameBoard()
        $(".turn_manager").removeClass("dn")
    })


    soc.on("thisturn", () => {
        turn = true
    })
    soc.on("turn", updateBar)
    soc.on("place", (coord_color) => {
        //console.log(coord_color)
        let cc = JSON.parse(coord_color) //hope that they are int :)
        //console.log(cc)
        placeOnBoard(parseInt(cc.x), parseInt(cc.y), cc.color)
    })
}
function start() {
    soc.emit("start", "true")
}
function select(element) {
    if (turn) {
        let jeql = $(element)
        if (jeql.attr("selected")) {
            return -1
        }
        let x = parseInt(jeql.attr("x"))
        let y = parseInt(jeql.attr("y"))
        //console.log("Sending", JSON.stringify({x:x, y: y}))
        soc.emit("selected", JSON.stringify({ x: x, y: y }))
        turn = false
    }
    else {
        console.log("wait 4 your turn")
    }
}