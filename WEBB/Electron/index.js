console.log("Starting Electron...")
const electron = require('electron')
const socket = require("socket.io")


const app = electron.app
const path = require('path')
const j = path.join

app.commandLine.appendSwitch('ignore-certificate-errors')

const createWindow = () => {
    const win = new electron.BrowserWindow({
        width: 800,
        height: 800,
        icon: j(__dirname, "favico.ico")
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