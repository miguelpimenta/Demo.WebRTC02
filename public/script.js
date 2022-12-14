const socket = io("/");

/*
const myPeer = new Peer(undefined, {
  host: "localhost",
  port: "9000",
  path: '/peer'
});
*/
/*
const myPeer = new Peer(undefined, {
    host: "demo-peerjs-server.herokuapp.com",
    port: "80",
    path: "/peer",
});*/

const myPeer = new Peer();

const videoGrid = document.getElementById("video-grid");

const peers = {};

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {

        document.querySelector("#local-video").srcObject = stream;
        document.querySelector("#local-video").play();
        document.querySelector("#local-video").muted = true;
        //addVideoStream(myVideo, stream);

        myPeer.on("call", (call) => {
            call.answer(stream);

            const video = document.createElement("video");

            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            console.log("User Connected: " + userId);
            connectToNewUser(userId, stream);
        });
    });

socket.on("user-disconnected", (userId) => {
    console.log("User Disconnected: " + userId);
    if (peers[userId]) {
        peers[userId].close();
    }
});

myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });

    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });

    videoGrid.append(video);
    console.log("Append video");
}