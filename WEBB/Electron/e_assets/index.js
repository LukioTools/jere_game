const log = console.log

let players = []

let player_turn = 0
let maxx;
let maxy;
let diagonal = true
let horizontal = true
let vertical = true

function waitForLoad() {
    return new Promise((res, rej) => {
        if (document.readyState === 'ready' || document.readyState === 'complete') {
            res()
        } else {
            document.onreadystatechange = function () {
                if (document.readyState == "complete") {
                    res();
                }
            }
        }
    })
}

function warnWrongRange(element){
    //console.log("die")
}

function start(){
    let x_el = document.getElementById("x")
    let y_el = document.getElementById("y")

    //console.log(x_el.value)
    //console.log(y_el.value)

    if(x_el.value <= 0){
        warnWrongRange(x_el)
        return -1
    }
    if(y_el.value <= 0){
        warnWrongRange(y_el)
        return -1
    }

    maxx = parseInt(x_el.value)
    maxy = parseInt(y_el.value)

    //bounc che pas
    //log("ok")
    let maingrid = $(".maingrid");
    
    for (let x = 0; x < maxx; x++) {
        for (let y = 0; y < maxy; y++) {
            const da_thin = `<div class="square notselected" x="${x}" y="${y}"  onmousedown="select(this)"></div>`
            maingrid.append(da_thin);
        }
    }

    //maby a web worker idk idc
    maingrid.css("grid-template-columns", `repeat(${maxx}, 1fr)`);
    maingrid.css("grid-template-rows", `repeat(${maxy}, 1fr)`);
    maingrid.css("aspect-ratio", `${maxx}/${maxy}`);


    $(".start").addClass("dn")
    $(".turn_manager").removeClass("dn")
    $(".game").removeClass("dn")
    maingrid.removeClass("dn")
    updateBar()


}

function addPlayer(element){
    let toapp = $(".players");
    let col = document.getElementById("color").value;
    let nm = document.getElementById("name").value;
    if(col == "#000000"){
        //hax
        return -1
    }
    //console.log(element);
    let shit = `<div class="player" style="background-color: ${col};">${nm}<div>`;
    players.push({name: nm, color: col, id: players.length})
    toapp.append(shit);
}

function boundsCheck(pos){
    if(pos >= maxx | pos >= maxy){
        //console.log(`Bounds: above ${pos}`)
        return true
    }
    if(pos < 0){
        //console.log(`Bounds: negative ${pos}`)
        return true
    }
    return false
}
/**
 * 
 * @param {x} x
 * @param {y} y
 * @param {2 | 0} px
 * @param {2 | 0} py
 * @returns {true | false}
 */
function checkSide(x, y, px, py){
    let tx = x+px
    let ty = y+py

    let bx = x+(px/2)
    let by = y+(py/2)
    if(boundsCheck(tx)){
        return -1
    }
    if(boundsCheck(ty)){
        return -1
    }
    let mg_child = document.getElementById("mg").children
    //console.log(mg_child)
    let cur = $(mg_child.item(maxx*x + y))
    let check = mg_child.item(maxx*tx +ty)
    let between = $(mg_child.item(maxx*bx + by))
    if(cur.attr("color") == $(check).attr("color")){
        console.log(between.attr("selected"))
        if(between.attr("captured") == undefined && between.attr("selected") != undefined && cur.attr("color") != between.attr("color")){
            between.attr("color", cur.attr("color"))
            between.css("background-color", cur.attr("color"))
            between.attr("captured", true)
            between.addClass("captured")
            between.attr("selected", true)
            between.removeClass("notselected");
            console.info(`Captured witht color : ${cur.attr("color")}`)
            checkAll(bx, by)
            return true
        }
    }
    return false

}

function checkDiagonal(x, y){
    if(diagonal == true){
        checkSide(x, y, 2, 2)
        checkSide(x, y, -2, -2)
        checkSide(x, y, -2, 2)
        checkSide(x, y, 2, -2)
    }
    else return false
}


function checkAdjacent(x, y){
    if(horizontal){
        checkSide(x, y, 2, 0)
        checkSide(x, y, -2, 0)
    }
    if(vertical){
        checkSide(x, y, 0, 2)
        checkSide(x, y, 0, -2)
    }
}

function checkAll(x, y){
    let a = checkAdjacent(x, y)
    let b = checkDiagonal(x, y)
    return [a, b]
}

function select(element){
    let jqEl = $(element)
    let x = parseInt(jqEl.attr("x")); 
    let y = parseInt(jqEl.attr("y")); 
    //console.log(x, y)

    if(jqEl.hasClass("selected")){
        return -1
    }
    jqEl.addClass("selected")

    //capture
    jqEl.attr("color", players[player_turn].color);
    jqEl.removeClass("notselected");
    jqEl.attr("selected", true);
    jqEl.css("background-color", players[player_turn].color)
    checkAll(x, y)


    //iterate
    updatePlayer()
    checkEnd()
}

function end(){
    console.log("end")
}

function checkEnd(){
    let e = $(".notselected")
    if(e.length == 0){
        end()
    }
}

function updateBar(){
    let player_bar = $(".turn_manager")
    player_bar.html(`<p class="playername">${players[player_turn].name}</p>`);
    player_bar.css("background-color", players[player_turn].color)

    let bg = $("body")
    bg.css("background-color", players[player_turn].color)
}

function updatePlayer(){
    player_turn += 1;
    if(player_turn >= players.length){
        player_turn = 0
    }
    updateBar()

}


waitForLoad()
.then(() => {
    let x_el = document.getElementById("x")
    let y_el = document.getElementById("y")
    x_el.addEventListener("input", (listm)  => {
        if(x_el.value <= 0){
            warnWrongRange(x_el)
            //
        }
    })
    y_el.addEventListener("input", (listm)  => {
        if(x_el.value <= 0){
            //
            warnWrongRange(y_el)
        }
    })
})