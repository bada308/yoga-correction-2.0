import { io, Socket } from "socket.io-client";

const pc_config = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};

export let newSocket = io.connect("http://localhost:8080");
export let newPC = new RTCPeerConnection(pc_config);
