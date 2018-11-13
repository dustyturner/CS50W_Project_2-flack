document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    socket.on('connect', () => {

        socket.emit('join channel', name=0);

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
                    p.innerHTML = "<b>" + data[message].user +  "</b> " + " " + data[message].time + " - " + data[message].message
                    document.querySelector('#messages').prepend(p);
                }
            }
            // Send request
            request.send();
        }

        load_messages()
        
        function load_channels() {

            //clear current channels
            document.querySelector('#channels').innerHTML = ""

            // Initialize new request
            const request = new XMLHttpRequest(); 
            request.open('GET', '/get_channels');
            // Callback function for when request completes
            request.onload = () => {

                // Extract JSON data from request
                const data = JSON.parse(request.responseText);

                for (channel in data) { 
                    const button = document.createElement('button');
                    button.innerHTML = data[channel];
                    button.onclick = () => {
                        socket.emit('join channel', data[channel]);
                        load_messages()
                    };
                    document.querySelector('#channels').append(button);
                }
            }
            // Send request
            request.send();
        }
        load_channels()

        function load_users() {

            //clear current users
            document.querySelector('#users').innerHTML = ""

            // Initialize new request
            const request = new XMLHttpRequest(); 
            request.open('GET', '/get_users');
            // Callback function for when request completes
            request.onload = () => {

                // Extract JSON data from request
                const data = JSON.parse(request.responseText);

                for (user in data) { 
                    const button = document.createElement('button');
                    button.innerHTML = data[user];
                    button.onclick = () => {
                        socket.emit('join chat', data[user]);
                        load_messages()
                    };
                    document.querySelector('#users').append(button);
                }
            }
            // Send request
            request.send();
        }
        load_users()

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
            if (document.querySelector('#channel_name').value.length > 0)
                document.querySelector('#submit_channel').disabled = false;
            else
                document.querySelector('#submit_channel').disabled = true;
        };

        document.querySelector('#create_channel').onsubmit = () => {
            const name = document.querySelector('#channel_name').value;
            socket.emit('create channel', name)
            document.querySelector('#channel_name').value = '';
            document.querySelector('#submit_channel').disabled = true;
            load_messages()
            return false;
        };

        socket.on('new channel', name => {
            load_channels()
        });

        socket.on('new user', name => {
            load_users()
        });

        socket.on('new message', message => {
            console.log(message);
            const p = document.createElement('p');
            p.innerHTML = "<b>" + message.user +  "</b> " + " " + message.time + " - " + message.message;
            document.querySelector('#messages').prepend(p);
        });
    });
});