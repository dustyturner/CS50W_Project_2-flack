//Load messages for current session channel
function load_messages() {

    //clear current messages
    document.querySelector('#messages').innerHTML = ""

    // Initialize new request
    const request = new XMLHttpRequest(); 
    request.open('GET', '/get_messages');
    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);

        for (message in data) { 
            const p = document.createElement('p');
            p.innerHTML = "<b>" + data[message][0] +  "</b> " + " " + data[message][1] + " - " + data[message][2]
            document.querySelector('#messages').prepend(p);
        }
    }
    // Send request
    request.send();
}

document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    socket.on('connect', () => {

        socket.emit('join channel', name=0);

        load_messages()
        
        document.querySelectorAll('.channel_select').forEach(button => {
            button.onclick = () => {
                const name = button.dataset.name;
                socket.emit('join channel', name);
                window.location.reload();
            }
        });

        document.querySelector('#send_message').onsubmit = () => {
            const message = document.querySelector('#message').value;
            socket.emit('send message', message);
            return false;
        };

        document.querySelector('#create_channel').onsubmit = () => {
            const name = document.querySelector('#name').value;
            socket.emit('create channel', name)
            socket.emit('join channel', name)
            window.location.reload();
        };
    });

    socket.on('new channel', name => {
        const button = document.createElement('button');
        button.innerHTML = name;
        button.onclick = () => {
            socket.emit('join channel', name);
            load_messages()
        };
        document.querySelector('#channels').append(button);
    });

    socket.on('new message', message => {
        console.log(message);
        const p = document.createElement('p');
        p.innerHTML = "<b>" + message.user +  "</b> " + " " + message.time + " - " + message.message;
        document.querySelector('#messages').prepend(p);
    });
});