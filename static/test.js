document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        socket.emit('join channel', name=0);

        /*function load_messages() {

            //clear current messages
            document.querySelector('#messages').innerHTML = ""

            // Initialize new request
            const request = new XMLHttpRequest();
            request.open('GET', '/get_messages');
            // Callback function for when request completes
            request.onload = () => {

                // Extract JSON data from request
                const data = JSON.parse(request.responseText);
                const template = Handlebars.compile(document.querySelector('#message').innerHTML)

                for (message in data) {
                    const p = document.createElement('p');
                    p.innerHTML = "<b>" + data[message].user +  "</b> " + " " + data[message].time + " - " + data[message].message
                    document.querySelector('#messages').prepend(p);
                }
            }
            // Send request
            request.send();
        }
        load_messages() */


        function load_channels() {

            // Initialize new request
            const request = new XMLHttpRequest();
            request.open('GET', '/get_channels');

            // Callback function for when request completes
            request.onload = () => {

                // Extract JSON data from request
                const data = JSON.parse(request.responseText);
                const template = Handlebars.compile(document.querySelector('#channel').innerHTML)

                for (item in data) {
                const channel = template({'name':data[item]})
                    document.querySelector('#channels').innerHTML += channel
                }

                channels = document.querySelectorAll('.channel')
                channels.forEach(channel => {
                    channel.onclick = () => {
                        channels.forEach(channel => {
                            channel.style.backgroundColor = "#ffc27c";
                        })
                        channel.style.backgroundColor = "white";
                        console.log("emmitting " + channel.innerHTML)
                        socket.emit('join channel', channel.innerHTML)
                    }
                })
            }
            // Send request
            request.send();
        };
        load_channels()


        // Button begins disabled by default
        document.querySelector('#channel_submit').disabled = true
        // Enable button only if there is text in the input field
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

    });
});
