const webSocket = new WebSocket("ws://127.0.0.1:3000")

webSocket.onmessage = (event) => {
    console.log(event, 'ennt msgs')
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {

        case "offer":
            console.log(offer,"offer recieved")
            peerConn.setRemoteDescription(data.offer)
             //storing the media configuration of remote client
            createAndSendAnswer()
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
            //storing the port information of remote client
    }
}

function createAndSendAnswer () {
    
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        //storing the port information locally
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

function sendData(data) {
    //sending the data object along with the username recieved
    data.username = username
    webSocket.send(JSON.stringify(data))
    // webSocket.send transmits data to the server.
}


let localStream
let peerConn
let username

function joinCall() {

    username = document.getElementById("username-input").value

    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.getUserMedia({
        /*this block saves the information about audio and video 
        configuration in stream ,either this api returns stream or
         err.*/
        video: {
            //media attribute, they should be given as detailed as possible.
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream
        /*configuration of the stun server, websockets need some kind 
        of server in between for the intraction of client A to client B.*/
        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        //constructor to configure new connection.
        peerConn.addStream(localStream)
        console.log(peerConn, 'show mw')

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            
            sendData({
                type: "send_candidate",
                candidate: e.candidate
            })
        })

        sendData({
            type: "join_call"
        })

    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
//function of this module to mute the audio during call
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
    /*getaudiotrack returns the array of audiotracks,
    if there is no audiotrack then array would be empty.
    //audiotracks are those tracks whose kind property is audio*/
}

let isVideo = true
//function of this module to mute the video during call
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}
 /*getvideotrack returns the array of videotracks,
    if there is no videotrack then array would be empty.
    //audiotracks are those tracks whose kind property is video*/

function sendMsg(){
    console.log('hello man')
}


/*
interface = []

user 1 --  join call

interface.push(user1)

user 2 --- join call

interface.push(user2)



*/