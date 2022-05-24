<script>
import { Peer } from "peerjs";
import { io } from "socket.io-client";

export default {
  name: "App",
  data() {
    return {
      peerHandshaked: false,
      remotePeerId: null,
      socket: null,
      peer_id: null,
      peer: null,
      conn: null,
      users: [{ name: "User", status: "Hello world" }],
      peerList: [],
    };
  },
  methods: {
    answerCall() {
      // this.conn = this.peer.connect(this.remotePeerId);
      // console.log(this.conn);
      // this.conn.on("open", () => {
      //   this.conn.send("call answered");
      // });
      let getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (strem) => {
        let call = this.peer.call(this.remotePeerId, strem);
        call.on(
          "stream",
          (remoteStream) => {
            this.peerHandshaked = true;
            // if (this.peerList.includes(call.peer)) {
            this.addRemoteView(remoteStream);
            this.peerList.push(call.peer);
            // }

            console.log("streemming");
          },
          (err) => {
            console.log("Failed to get local stream", err);
          }
        );
      });
    },
    recieveCall(args) {
      this.remotePeerId = args.peer_id;
      console.log("recieve call ", args);
    },
    startCall() {
      console.log("hello");
      this.socket.emit("call", {
        peer_id: this.peer_id,
      });
    },
    initializePeer() {
      this.peer = new Peer();
      this.peer.on("open", (id) => {
        this.peer_id = id;
        console.log("my id", id);
      });

      this.peer.on("connection", (conn) => {
        conn.on("data", (data) => {
          console.log("recieved", data);
        });
      });

      let getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      this.peer.on("call", function (call) {
        getUserMedia(
          { video: true, audio: true },
          (stream) => {
            call.answer(stream); // Answer the call with an A/V stream.
            call.on("stream", (remoteStream) => {
              this.peerHandshaked = true;
              // if (this.peerList.includes(call.peer)) {
              this.addRemoteView(remoteStream);
              this.peerList.push(call.peer);
              // }

              console.log("reciving call");
            });
          },
          (err) => {
            console.log("Failed to get local stream", err);
          }
        );
      });
    },

    addRemoteView(remoteStream) {
      let video = document.createElement("video");
      video.srcObject = remoteStream;
      video.play();
      document.getElementById("remoteVideo").append(video);
    },

    addOurVideo(stream) {
      let video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      document.getElementById("localVideo").append(video);
    },
  },
  mounted() {
    this.initializePeer();
    this.socket = io("http://localhost:3001");
    this.socket.on("connect", () => {
      console.log("My Socket ID", this.socket.id);
    });
    this.socket.on("call", this.recieveCall);
    console.log(this.$refs.remoteVideo);
  },
};
</script>

<template>
  <div class="d-flex justify-content-center">
    <h3>Your Peer ID : {{ peer_id }}</h3>
  </div>
  <div
    class="d-flex justify-content-center"
    style="height: 80vh"
    v-if="!peerHandshaked"
  >
    <div class="align-self-center" v-if="remotePeerId">
      <h2>Incomming call from peer id : {{ remotePeerId }}</h2>

      <button type="button" @click="answerCall" class="btn btn-primary btn-lg">
        Answer
      </button>
      <button @click="remotePeerId = null" class="btn btn-danger btn-lg">
        Reject
      </button>
    </div>

    <div class="align-self-center" v-else>
      <button
        type="button"
        @click="startCall"
        class="btn btn-primary btn-lg rounded-circle p-5"
      >
        Call
      </button>
    </div>
  </div>

  <div v-show="peerHandshaked">
    <div class="call-view">
      <div id="local-video">
        <h1>Local Video</h1>
        <div id="localVideo"></div>
      </div>
      <div id="remote-video">
        <h4>Remote video</h4>
        <div ref="remoteVideo" id="remoteVideo"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped="true">
.call-view {
  display: relative;

  .local-video {
    position: absolute;
    top: 0;
    height: 250px;
    width: 400px;
    z-index: 999;
    background: gray;
  }

  .remote-video {
    position: absolute;
    background: yellow;
    height: 100vh;
    width: 100%;
    top: 0;
  }
}
</style>
