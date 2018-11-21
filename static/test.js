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
                    const li = document.createElement('li');
                    li.className = "list-group-item list-group-item-action flex-column align-items-start";
                    const div = document.createElement('div');
                    div.className = "d-flex w-100 justify-content-between";
                    const h5 = document.createElement('h5');
                    h5.className = "mb-1 font-weight-bold";
                    h5.innerHTML = data[message].user;
                    div.append(h5);
                    const small = document.createElement('small');
                    small.innerHTML = data[message].time;
                    div.append(small);
                    const pa = document.createElement('p');
                    pa.className = "mb-1";
                    pa.innerHTML = data[message].message;
                    li.append(div)
                    li.append(pa)
                    document.querySelector('#messages').prepend(li);
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

                for (item in data) { 
                    const channel = data[item]
                    const button = document.createElement('button');
                    button.className = "btn btn-outline-secondary"
                    button.innerHTML = channel;
                    button.onclick = () => {
                        socket.emit('join channel', channel);
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

                for (item in data) { 
                    const user = data[item]
                    const button = document.createElement('button');
                    button.className = "btn btn-outline-secondary"
                    button.innerHTML = user;
                    button.onclick = () => {
                        console.log(user)
                        socket.emit('join chat', user);
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