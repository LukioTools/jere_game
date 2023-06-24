let soc;
let parsed = {}
let coords
let turn = false
let server_url = "https://localhost:8080"

function waitForLoad() {
    return new Promise((res, rej) => {
    if (document.readyState === 'ready' || document.readyState === 'complete') {
        res()
    } 
    else {
        document.onreadystatechange = () => {
            if (document.readyState == "complete") {res();}
        }
    }})
}
waitForLoad()
.then(() => {
    //parse url and put the shit in the boxes
    let params = window.location.search.substring(1).split("&")
    params.forEach(el => {
        let ee = el.split("=")
        parsed[ee[0]] = ee[1]
    })
    if(parsed.hostname != undefined){document.getElementById("hostname").value = parsed.hostname}
    if(parsed.password != undefined){document.getElementById("password").value = parsed.password}
    if(parsed.username != undefined){document.getElementById("username").value = parsed.username}
    if(parsed.color != undefined){document.getElementById("color").value = "#"+parsed.color}
    if(parsed.ip != undefined){document.getElementById("ip").value = parsed.ip}
    if(parsed.autojoin==1 | parsed.autojoin=="1"){
        console.log("joining")
        join()
    }        
})
function join(){
    if(document.getElementById("ip").value != undefined)
    {server_url = document.getElementById("ip").value}
    soc = io(server_url)
    
    soc.on('connect_error', function(err) {
        // handle server error here
        console.log('Error connecting to server', err);
        console.log(`%c${server_url} was not hosting a server...`, "background-color: red; color: azure;")
        soc.destroy()
        return -1
    });
    const jin_data = {
        hostname: document.getElementById("hostname").value,
        password: document.getElementById("password").value,
        username: document.getElementById("username").value,
        color: document.getElementById("color").value
    }
    console.log(jin_data)
    soc.emit("join", JSON.stringify(jin_data))
    soc.once("success", (val) => {
        coords = JSON.parse(val)
        console.log(coords)
        generateGameBoard(coords.x, coords.y)
        $(".join_inputs").addClass("dn");
        $(".lobby").removeClass("dn");
        if(parsed.autojoin == 1 | parsed.autojoin == "1"){
            $(".start_btn").removeClass("dn");
        }
    })
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
    soc.once("start", () => {
        console.log("Starting...")
        $(".lobby").addClass("dn")
        showGameBoard()
    })

    
    soc.on("thisturn", () => {
        turn = true
    })
    soc.on("turn", (name_color_str) => {
        //console.log(name_color_str)
    })
    soc.on("place", (coord_color) => {
        //console.log(coord_color)
        let cc = JSON.parse(coord_color) //hope that they are int :)
        //console.log(cc)
        placeOnBoard(parseInt(cc.x), parseInt(cc.y), cc.color)
    })
    soc.on("disconnect", (err) => {
        console.log("socet was disconnecteds: ")
        console.log(`%c ${err}`, "background-color: red; color: azure;")
        soc.destroy()
    })
}
function start(){
    soc.emit("start", "true")
}
function select(element){
    if(turn){
        let jeql = $(element)
        if(jeql.attr("selected")){
            return -1
        }
        let x = parseInt(jeql.attr("x"))
        let y = parseInt(jeql.attr("y"))
        //console.log("Sending", JSON.stringify({x:x, y: y}))
        soc.emit("selected", JSON.stringify({x:x, y: y}))
        turn = false
    }
    else{
        console.log("wait 4 your turn")
    }
}