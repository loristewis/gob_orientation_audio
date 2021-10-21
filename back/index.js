const express = require('express')
const app = express()
const port = 3000
const http = require('http').createServer(app)
let { Server } = require("socket.io")
// Import our main class
const music = require("./src/music");

const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>')
})

io.on('connection', (socket) => {
  console.log(`user: ${socket.id}`)
  socket.on('movement', (msg) => {
    console.log('moves: ' + msg)
  })
})

// Listen for new websocket connections
music(io);

// Start the server
http.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

console.log(http.address())
