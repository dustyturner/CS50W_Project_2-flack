document.addEventListener('DOMContentLoaded', () => {

    //Load messages for current session channel
    // Initialize new request
    const request = new XMLHttpRequest(); 
    request.open('GET', '/get_messages');
    // Callback function for when request completes
    request.onload = () => {

        // Extract JSON data from request
        const data = JSON.parse(request.responseText);
        console.log(data)

        for (message in data) { 
            console.log(data[message][2]);
            const p = document.createElement('p');
            p.innerHTML = "<b>" + data[message][0] +  "</b> " + " " + data[message][1] + " - " + data[message][2]
            document.querySelector('#messages').append(p);
        }
    }
    // Send request
    request.send();
    

    /*document.querySelectorAll('.get_messages').forEach(button => {
        button.onclick = () => {

            // Initialize new request
            const request = new XMLHttpRequest();
            const name = button.dataset.name;
            request.open('GET', '/get_messages/' + name);

            // Callback function for when request completes
            request.onload = () => {

                // Extract JSON data from request
                const data = JSON.parse(request.responseText);
                console.log(data)

                for (message in data) { 
                    console.log(data[message][2]);
                    const p = document.createElement('p');
                    p.innerHTML = "<b>" + data[message][0] +  "</b> " + " " + data[message][1] + " - " + data[message][2]
                    document.querySelector('#messages').append(p);
                }
            }

            // Send request
            request.send();
            return false;
        };
    });*/
    
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