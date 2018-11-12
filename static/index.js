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
        console.log(data)

        for (message in data) { 
            console.log(data[message])
            const p = document.createElement('p');
            p.innerHTML = "<b>" + data[message].user +  "</b> " + " " + data[message].time + " - " + data[message].message
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

        // Button begins disabled by default
        document.querySelector('#submit_message').disabled = true
        // Enable button only if there is text in the input field
        document.querySelector('#send_message').onkeyup = () => {
            if (document.querySelector('#message').value.length > 0)
                document.querySelector('#submit_message').disabled = false;
            else
                document.querySelector('#submit_message').disabled = true;
        };

        document.querySelector('#send_message').onsubmit = () => {
            const message = document.querySelector('#message').value;
            socket.emit('send message', message);
            // Clear input field and disable button again
            document.querySelector('#message').value = '';
            document.querySelector('#submit_message').disabled = true;
            return false;
        };

        // Button begins disabled by default
        document.querySelector('#submit_channel').disabled = true
        // Enable button only if there is text in the input field
        document.querySelector('#create_channel').onkeyup = () => {
            if (document.querySelector('#name').value.length > 0)
                document.querySelector('#submit_channel').disabled = false;
            else
                document.querySelector('#submit_channel').disabled = true;
        };

        document.querySelector('#create_channel').onsubmit = () => {
            const name = document.querySelector('#name').value;
            socket.emit('create channel', name)
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