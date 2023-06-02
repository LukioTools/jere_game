const socket_client = require("socket.io-client")
const soc = socket_client.io("ws://localhost:25565")

const jin_data = {
    host: "HEll",
    password: "2131",
    username: "root",
    color: "#FF0000"
}

soc.emit("join", JSON.stringify(jin_data))

soc.on("update", (coords) => {
    console.log(coords)
})

soc.on("turn", () => {
    soc.emit("move", )
})