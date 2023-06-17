let mm_filter
const base = "<tr><th>Hostname</th><th>Players</th><th>Has Password</th></tr>"
let data;


function fetchmm(){
    return new Promise((res, rej) => {
        fetch('/online/matchmaking')
        .then(response => response.json())
        .then(in_data => {
            data = in_data
            res()
        })
    })
    
}


async function matchmaking(refresh = false) {
    let mmel = document.getElementById("matches")
    mmel.innerHTML = "Searching for matches...."
    if(refresh){
        await fetchmm()
    }

    //the base string
    console.log(data)
    if(data.length == 0)
    {
        mmel.innerHTML = "No matches found"
        return
    }
    let out = ""
    for (let index = 0; index < data.length; index++) { const match = data[index];
        match.hostname_cut = match.hostname;
        //checks
        if(document.getElementById("box_password").checked == true && match.password == "true"){
            continue; //ignore password protected
        }
        if(mm_filter && !match.hostname.includes(mm_filter)){
            continue;
        }


        if(match.hostname.length > 6){
            match.hostname_cut = match.hostname.substring(0, 5) + "...";
        }
        
        out += 
        `
        <tr onclick="join(this)"> 
            <td class="table_hostname"  value="${match.hostname}"  >${match.hostname_cut}</td> 
            <td class="table_players" >${match.players}</td> 
            <td class="table_password" >${match.password}</td> 
        </tr>
        `
    }
    console.log(out);
    if(out == ""){
        mmel.innerHTML = "No matches found"
        return
    }
    mmel.innerHTML = base + out;
}

function matchmaking_parse(element){
    let jqel = $(element);
    let obj = {};
    obj.hostname = jqel.children(".table_hostname").attr("value");
    console.log(jqel)
    console.log(jqel.children(".table_hostname"))
    /*
    password: document.getElementById("password").value,
    username: document.getElementById("username").value,
    color: document.getElementById("color").value
    */
    let needPwd = jqel.children(".table_password").html == "true" && document.getElementById("password").value == "";
    let needUsername = document.getElementById("username").value == "";
    let needColor = document.getElementById("color").value == "";


    if(needPwd){
        let val = window.prompt("Password required", "6969");
        console.log(val);
        if(val == null || val.length == 0){
            return -1;
        }
        else{
            obj.username = val
        }
    }else{
        if(jqel.children(".table_password").html == "false"){
            obj.password = ""
        }else{
            obj.password = document.getElementById("password").value;
        }
    }

    if(needUsername){
        let val = window.prompt("Username required", "Noname");
        console.log(val);
        if(val == null || val.length == 0){
            console.log("retard");
            return -1;
        }
        else{
            obj.username = val
        }
    }else{
        obj.username = document.getElementById("username").value;
    }

    if(needColor){
        let val = window.prompt("Color required (hexvalue fe: #0FA69D (0-F))", "#FFAAAA");
        console.log(val);
        if(val == null || val.length == 0 || val.length != 4 && val.length != 7){
            alert("color is a must try again")
            return -1;
        }
        else{
            obj.username = val
        }
    }
    else{
        obj.color = document.getElementById("color").value;
    }

    console.log(obj);
    return obj;

}


const matchmaking_filter = (element) => {
    mm_filter = element.value;
    console.log(mm_filter);
    matchmaking(false);
}