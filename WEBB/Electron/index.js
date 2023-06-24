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

let tray = null

const createWindow = () => {
    const win = new electron.BrowserWindow({
        width: 1600,
        height: 1800,
        icon: j(__dirname, "e_assets/jere_icon.png")
    })
    win.removeMenu()
    win.webContents.openDevTools()
    win.loadFile(j(__dirname, 'e_assets/index.html'))
    win.flashFrame(true)
    win.once('focus', () => win.flashFrame(false))

    tray = new electron.Tray(j(__dirname, "e_assets/jere_icon.png"))
    tray.setToolTip("Le game of the jere")
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