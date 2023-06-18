
let maxx;
let maxy;

let diagonal = true
let horizontal = true
let vertical = true

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

function generateGameBoard(x, y){
    maxx = x
    maxy = y
    let maingrid = $(".maingrid");
    
    for (let x = 0; x < maxx; x++) {
        for (let y = 0; y < maxy; y++) {
            const da_thin = `<div class="square notselected" x="${x}" y="${y}"  onmousedown="select(this)"></div>`
            maingrid.append(da_thin);
        }
    }
    maingrid.css("grid-template-columns", `repeat(${maxx}, 1fr)`);
    maingrid.css("grid-template-rows", `repeat(${maxy}, 1fr)`);
    maingrid.css("aspect-ratio", `${maxx}/${maxy}`);
}

function showGameBoard(){
    //maby a web worker idk idc
    let maingrid = $(".maingrid");

    maingrid.removeClass("dn");
}

function getByCord(x, y) {
    return document.querySelector(`[x="${x}"][y="${y}"]`)
}

function put(x, y){

}

function capture(){

}
/**
 * 
 * @param {{string: Number}} scoreMap 
 */
function endscreen(scoreMap){
    
    let orderedKeys = Object.keys(scoreMap).sort((a, b) => {scoreMap[b] - scoreMap[a]})
    console.log("keys in order", orderedKeys)
    let out = ""
    for (let index = 0; index < orderedKeys.length; index++) {
        const color_name = orderedKeys[index];
        out += `<div style="background-color: ${color_name};">${color_name}: ${scoreMap[color_name]}</div>`
    }
    document.getElementById("scoreboard").innerHTML = out
    //just notes
    let winner = {
        color: orderedKeys[0],
        score: scoreMap[orderedKeys[0]],
    }
    $(".body").css("")
    document.getElementById("winner").innerText = `Winner: ${winner.color} with a score of ${winner.score}`
    $(".turn_manager").addClass("dn")
    $("#endscreen").removeClass("dn")
}



function endGame(){
    let scoreColor = {};

    let maingrid = $(".maingrid");
    let children = maingrid.children();

    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        console.log("element.attributes.color.value", element.attributes.color.value)
        if(scoreColor[element.attributes.color.value] == undefined){
            scoreColor[element.attributes.color.value] = 0;
        }
        scoreColor[element.attributes.color.value]++;
    }
    console.log(scoreColor)
    maingrid.addClass("dn")
    endscreen(scoreColor)
}

function checkEnd(){
    return document.getElementsByClassName("notselected").length == 0;
}


function placeOnBoard(x, y, color){
    let origin_element = getByCord(x, y)
    let jq_origin_element = $(origin_element)

    if(jq_origin_element.hasClass("selected")){
        console.log("element was already placed")
        return -1
    }
    jq_origin_element.addClass("selected")
    jq_origin_element.removeClass("notselected");
    jq_origin_element.attr("selected", true);
    jq_origin_element.attr("color", color);
    jq_origin_element.css("background-color", color)

    checkAll(x, y)
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

    console.log({
        x:x, y:y, px:px, py:py
    })
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

    let cur = $(getByCord(x, y))
    let check = $(getByCord(tx, ty))
    let between = $(getByCord(bx, by))

    console.log(cur); console.log(check); console.log(between)

    if(cur.attr("color") == check.attr("color")){
        console.log("\nwent pass fst")
        console.log(between.attr("selected"))
        console
        console.log((between.attr("captured") == undefined && between.attr("selected") != undefined && cur.attr("color") != between.attr("color")))
        if(between.attr("captured") == undefined && between.attr("selected") != undefined && cur.attr("color") != between.attr("color")){
            console.log("\nwent pass nd")
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
    console.log("checkall", x, y)
    checkAdjacent(x, y)
    checkDiagonal(x, y)
    return true
}

