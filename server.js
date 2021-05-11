const Socket = require("websocket").server
const http = require("http")

const server = http.createServer((req, res) => {})

server.listen(3000, () => {
    console.log("Listening on port 3000...")
})

const webSocket = new Socket({ httpServer: server })

let users = []
//listens to the request.
webSocket.on('request', (req) => {
    //console.log(req,"request*******")
 //<<<<<=====================THIS FILE SENDS DATA TO THE SERVER ALONG WITH "TYPE",
 //TO TELL THE WHAT ACTUALLY NEEDS TO DO WITH SERVER=========================>>>>   

    const connection = req.accept()
   // console.log( connection,"****req.accept()****") 
    connection.on('message', (message) => {
        const data = JSON.parse(message.utf8Data)

        const user = findUser(data.username)

        switch(data.type) {
            case "store_user":
                //storing the store_user event.            
                if (user != null) {
                    return
                }
                const newUser = {
                     conn: connection,
                     username: data.username
                }
                users.push(newUser)
                console.log(newUser.username)
                /* storing the user if this user is not already present
                 in the user object returned from the finduser function
                */
                break
            case "store_offer":
                if (user == null)
                    return
                user.offer = data.offer
                //storing the information about ports
                break
            
            case "store_candidate":
                if (user == null) {
                    return
                }
                if (user.candidates == null)
                    user.candidates = []
                //always store new candidate to the user object.
                user.candidates.push(data.candidate)
                break
            case "send_answer":
                if (user == null) {
                    return
                }
                sendData({
                    type: "answer",
                    answer: data.answer
                }, user.conn)
                /*
                 */
                break
            case "send_candidate":
                if (user == null) {
                    return
                }

                sendData({
                    type: "candidate",
                    candidate: data.candidate
                }, user.conn)
                break
            case "join_call":
                if (user == null) {
                    return
                }

                sendData({
                    type: "offer",
                    offer: user.offer
                }, connection)
                
                user.candidates.forEach(candidate => {
                    sendData({
                        type: "candidate",
                        candidate: candidate
                    }, connection)
                })

                break
        }
    })

    connection.on('close', (reason, description) => {
        //closing the connection and deleting the user from array.
        users.forEach(user => {
            if (user.conn == connection) {
                users.splice(users.indexOf(user), 1)
                return
            }
        })
    })
})

function sendData(data, conn) {
    conn.send(JSON.stringify(data))
}

function findUser(username) {
    for (let i = 0;i < users.length;i++) {
        if (users[i].username == username)
            return users[i]
    }
}