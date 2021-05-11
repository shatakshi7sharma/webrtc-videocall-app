const webSocket = new WebSocket("ws://127.0.0.1:3000")

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

//webrtc cannot setup a connection without some sort of signling server in the middle
function handleSignallingData(data) {
    switch (data.type) {
        /*answer is created on the other end (client B), 
        in response to the offer,this contains same no. of arguments as of
        answer,answer stores the media configuration about reciever 
        and sends it to the local client
        */
       case "answer":
            peerConn.setRemoteDescription(data.answer)
            //storing the media configuration information about remote client locally
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
            //saving information about ports locally.
    }
}

let username
function sendUsername() {
    
    username = document.getElementById("username-input").value
    sendData({
        type: "store_user"
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn

function startCall() {
    document.getElementById("video-call-div")
    .style.display = "inline"
     //console.log(navigator,"navigator")
    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        //console.log(stream ,"stream")
        localStream = stream
        document.getElementById("local-video").srcObject = localStream
        
        let configuration = {
            iceServers: [
                {
                    "urls":
                    ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        //console.log(peerConn,"peerConn")
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
           // console.log(e,"event")
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            //console.log(e,"event")
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}




function createAndSendOffer() {

    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

      peerConn.setLocalDescription(offer)
      /* setLocalDescription sets the description/information about local
       client ,(media config information)

      */
    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
//this function mutes the audio during call
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
    /*getaudiotrack returns the array of audiotracks,
    if there is no audiotrack then array would be empty.
    //audiotracks are those tracks whose kind property is audio*/
}

//this function mutes the video during call
let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}
  /*getvideotrack returns the array of videotracks,
    if there is no videotrack then array would be empty.
    //audiotracks are those tracks whose kind property is video*/


