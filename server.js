const app = require('express')();
const { log } = require('console');
const cors = require('cors')
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: { origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], allowedHeaders: "*", credentials: true }
});
const port = process.env.PORT || 3001;

app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('call', (arg) => {
        socket.broadcast.emit('call', arg)
        console.log(arg)
    })
});

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});