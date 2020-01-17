const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    MenuItem
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
const mainMenuTemplate = [];
function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        minWidth: 1050,
        minHeight: 600,
        resizable: true,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    win.once("ready-to-show", () => {
        win.show();
    });

    win.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    );

    win.on("closed", () => {
        win = null;
    });
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
}

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

ipcMain.on("remove-todo", (e, todo) => {
    console.log(todo);
});

ipcMain.on("add-todo", (e, todo) => {
    let rawData = fs.readFileSync(app.getPath("userData") + "\\config.json");
    let data = JSON.parse(rawData);

    data.non_completed.push({ name: todo });
    let newData = JSON.stringify(data);
    fs.writeFileSync(app.getPath("userData") + "\\config.json", newData);
});

ipcMain.on("get-todos", () => {
    let rawData = fs.readFileSync(app.getPath("userData") + "\\config.json");
    let data = JSON.parse(rawData);
    win.webContents.send("data", data);
});

if (isDev) {
    mainMenuTemplate.push({
        label: "Dev Tools",
        submenu: [
            {
                label: "toggle DevTools",
                accelerator:
                    process.platform == "darwin" ? "Command+I" : "Ctrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            }
        ]
    });
}
