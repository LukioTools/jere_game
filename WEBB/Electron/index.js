console.log("Starting Electron...")
const electron = require('electron')
const socket = require("socket.io")

const app = electron.app
const path = require('path')
const j = path.join

const createWindow = () => {
  const win = new electron.BrowserWindow({
    width: 800,
    height: 800,
    icon: j(__dirname, "assets/icon.ico")
  })
  win.removeMenu()
  win.loadFile(j(__dirname, '/assets/index.html'))
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})