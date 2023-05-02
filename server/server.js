import express from "express";
import { Server } from "socket.io";
import http from "http"; // node.js에 이미 설치되어 있기 때문에 따로 설치할 필요 없음
import cors from "cors";

const corsConfig = {
  origin: "http://localhost:3000",
  credential: true,
};

const app = express();

/*
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));
*/
app.use(cors(corsConfig));

// http 서버 생성
const httpServer = http.createServer(app);
// io 서버 생성
const wsServer = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
    console.log("welcome event");
  });

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
    console.log("offer event");
  });

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
    console.log("answer event");
  });

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
    console.log("ice event");
  });
});

const handleListen = () => console.log(`Listening on http://localhost:8080`);
httpServer.listen(8080, handleListen);
