document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        socket.emit('join channel', name=0);

        function load_messages() {


            // Initialize new request
            const request = new XMLHttpRequest();
            request.open('GET', '/get_messages');
            // Callback function for when request completes
            request.onload = () => {

                //clear current messages
                const message_content = document.querySelector('#messages');
                while (message_content.firstChild) message_content.removeChild(message_content.firstChild)
                document.querySelector('#chatting').innerHTML = "<h6>chatting:</h6>"
                document.querySelector('#title_channel').innerHTML = ""

                // Extract JSON data from request
                const response = request.responseText;

                if (response) {
                    const data = JSON.parse(request.responseText);
                    const message_template = Handlebars.compile(document.querySelector('#message').innerHTML)

                    document.querySelector('#title_channel').innerHTML += '#' + data['channel'] 
                    for (item in data['messages']) {
                        const message = message_template({'user':data['messages'][item].user,
                            'time': data['messages'][item].time,
                            'message': data['messages'][item].message});
                        document.querySelector('#messages').innerHTML += message;
                    }
                    for (item in data['chatting']) {
                        const p = document.createElement('p')
                        p.innerHTML = data['chatting'][item]
                        document.querySelector('#chatting').append(p)
                    }
                    messages = document.querySelectorAll('.message')
                    if (messages.length > 0) {
                        last_message = messages[messages.length - 1]
                        last_message.scrollIntoView({
                            behaviour: "smooth"
                        });
                    }
                }
            }
            // Send request
            request.send();
        }

        socket.on('channel_joined', () => {
            load_messages()
            load_channels()
        });

        // Button begins disabled by default
        document.querySelector('#message_submit').disabled = true
        // Enable button only if there is text in the input field
        document.querySelector('#send_message').onkeyup = () => {
            if (document.querySelector('#message_input').value.length > 0)
                document.querySelector('#message_submit').disabled = false;
            else
                document.querySelector('#message_submit').disabled = true;
        };

        document.querySelector('#send_message').onsubmit = () => {
            const message = document.querySelector('#message_input').value;
            socket.emit('send message', message);
            // Clear input field and disable button again
            document.querySelector('#message_input').value = '';
            document.querySelector('#message_submit').disabled = true;
            return false;
        };

        function load_channels() {

            const template = Handlebars.compile(document.querySelector('#channel').innerHTML)

            // Initialize new request
            const request = new XMLHttpRequest();
            request.open('GET', '/get_channels');

            // Callback function for when request completes
            request.onload = () => {

                document.querySelector('#dms').innerHTML = "";
                document.querySelector('#channels').innerHTML = "";

                // Extract JSON data from request
                const data = JSON.parse(request.responseText);

                channels = data['channels']
                users = data['users']
                current_channel = data['current_channel']

                for (channel in channels) {
                const content = template({'name': channels[channel]})
                    document.querySelector('#channels').innerHTML += content;
                }

                for (user in users) {
                const content = template({'name': users[user]})
                    document.querySelector('#dms').innerHTML += content;
                }

                chats = document.querySelectorAll('.channel')
                chats.forEach(chat => {
                    if (chat.innerHTML == current_channel) {
                        chat.style.backgroundColor = "white";
                    }
                    chat.onclick = () => {
                        chats.forEach(chat => {
                            chat.style.backgroundColor = "#ffc27c";
                        })
                        chat.style.backgroundColor = "white";
                        socket.emit('join channel', chat.innerHTML)
                    }
                })

            }
            request.send();
        };
        load_channels()

        // Add Channel

        document.querySelector('#channel_submit').disabled = true

        document.querySelector('#create_channel').onkeyup = () => {
            if (document.querySelector('#channel_input').value.length > 0)
                document.querySelector('#channel_submit').disabled = false;
            else
                document.querySelector('#channel_submit').disabled = true;
        };

        document.querySelector('#create_channel').onsubmit = () => {
            const name = document.querySelector('#channel_input').value;
            socket.emit('create channel', name)
            document.querySelector('#channel_input').value = '';
            document.querySelector('#channel_submit').disabled = true;
            return false;
        };

        socket.on('new channel', () => {
            load_channels()
        });

        socket.on('new user', () => {
            load_channels()
        });

        socket.on('new message', new_message => {
            load_messages()
        });
    });
});
