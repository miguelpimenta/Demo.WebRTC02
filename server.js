const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
    res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        console.log(`Connected: Room Id: ${roomId} - User Id: ${userId}`);

        socket.join(roomId);

        socket.broadcast.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            console.log(`Disconnected: Room Id: ${roomId} - User Id: ${userId}`);
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log('Server started at http://localhost:' + PORT);