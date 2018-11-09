document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    socket.on('connect', () => {

        console.log('connected');
        socket.emit('connected');
        
        document.querySelector('#send_message').onsubmit = () => {
            const message = document.querySelector('#message').value;
            socket.emit('send message', message);
            return false;
        };
    });

    socket.on('new user', user => {
        console.log(user);
        const h2 = document.createElement('h2');
        h2.innerHTML = user + " joined the chat";

        document.querySelector('#messages').append(h2);
    });

    socket.on('new message', message => {
        console.log(message);
        const p = document.createElement('p');
        p.innerHTML = "<b>" + message.user +  "</b> " + " " + message.time + " - " + message.message;
        document.querySelector('#messages').append(p);
    });
});