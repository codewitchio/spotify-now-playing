$(function () {
    // Local socket connection
    var socket = io();
    socket.on('test', (msg) => {
        console.log('recieved test event')
    })
});