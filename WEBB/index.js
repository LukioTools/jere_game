const log = console.log

let players = []

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
    console.log("die")
}

function start(){
    let x_el = document.getElementById("x")
    let y_el = document.getElementById("y")

    console.log(x_el.value)
    console.log(y_el.value)

    if(x_el.value <= 0){
        warnWrongRange(x_el)
        return -1
    }
    if(y_el.value <= 0){
        warnWrongRange(y_el)
        return -1
    }
    //bounc che pas
    log("ok")
    $(".start").addClass("dn")
    let maingrid = $(".maingrid");
    maingrid.removeClass("dn")

    //maby a web worker idk idc
    let fr = " 1fr "
    let maxx = parseInt(x_el.value)
    let maxy = parseInt(y_el.value)
    maingrid.css("grid-template-columns", `repeat(${maxx}, 1fr)`);
    maingrid.css("grid-template-rows", `repeat(${maxy}, 1fr)`);
    for (let x = 0; x < maxx; x++) {
        for (let y = 0; y < maxy; y++) {
            const da_thin = `<div class="square" x="${x}" y="${y}" onclick="select(this)"></div>`
            maingrid.append(da_thin);
        }
    }

}

function addPlayer(element){
    let toapp = $(".players");
    let col = document.getElementById("color").value;
    let nm = document.getElementById("name").value;
    if(col == "#000000"){
        //hax
        return -1
    }
    console.log(element);
    let shit = `<div class="player" style="background-color: ${col};">${nm}<div>`;
    players.push({name: nm, color: col, id: players.length})
    toapp.append(shit);
}


function select(element){
    let jqEl = $(element)
    let x = parseInt(jqEl.attr("x")); 
    let y = parseInt(jqEl.attr("y")); 
    console.log(x, y)

    jqEl.addClass("selec")
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