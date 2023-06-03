console.log("Starting Electron...")
const electron = require('electron')
const socket = require("socket.io")


const app = electron.app
const path = require('path')
const j = path.join


if (process.platform == 'darwin'){
    const image = electron.nativeImage.createFromPath(j(__dirname, "e_assets/favicon.ico"))
    app.dock.setIcon(image)
}



app.commandLine.appendSwitch('ignore-certificate-errors')

const createWindow = () => {
    const win = new electron.BrowserWindow({
        width: 800,
        height: 600,
        icon: j(__dirname, "e_assets/jere_icon.png")
    })
    win.removeMenu()
    win.webContents.openDevTools()
    win.loadFile(j(__dirname, 'e_assets/index.html'))
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})




app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})