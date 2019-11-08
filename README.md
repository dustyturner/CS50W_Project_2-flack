<h1> Project 2 - Flack </h1>

Flack is a basic chat application similar in nature to Slack or WhatsApp. Users select a username and then chat to eachother, in group channels or chatting privately one-on-one.

The application follows the basic flask application file structure - the application is run from the `application.py` python file on the server, the `templates/` folder contains the HTML templates for the application, and `static/` contains the CSS and client-side Javascript files.

<h3> application.py </h3>

The server-side script for the application. This directly stores all the data for the application and handles all of the requests from the client. 

Of particular note is the use of the flask package `flask_socketio` which allows 'asynchronous' communication between the server and client - in other words, the server can communicate with the client and visa versa whilst the user is interacting with a page, not just when submitting HTML requests and loading the subsequent responses. SocketIO does this by continuously 'listening' for specific events on both the client and server side:

This can be seen in the functions preceeded by `@socketio.on("...)` - this tells Flask to continuously listen out for 'emit' events from the client, rather than just waiting for traditional HTML requests. The functions that listen for these events then `emit` responses that send information back to the client, which is 'listening' and 'emiting' in much the same way. 

The script also makes use of the `flask_socketio` `join_room` function which directs the `emit` messages to particular users. Perhaps counter-intuitively, this application gives each user a unique room: this was done to more easily facilitate the private chat feature (but this logic can probably be improved upon in future). 

The other app routes are basic HTML requests that return the data stored on the server in json format.

<h3> login.html / login.css </h3>

Pretty self-explanatory template / stylesheet for the login screen. The login screen asks only for a username and submits this (via `POST`) to he `login` route in application.py. No authentication is done by the application other than to ensure a username has been returned (if not an error is displayed on the login screen)

<h3> index.html / index.css / index.js </h3>

These three files make up the main page of the site, including all of the client-side script that allows the user to communicate with the server whilst interacting with the page. The following are some key features that warrant highlighting:

* <h4> SocketIO </h4> A SocketIO connection is formed at the beginning of <code>index.js</code> by calling <code>io.connect(....)</code>. The conncection is stored in an object called <code>socket</code>, which is used to listen for the <code>emit</code> messages coming from the server via the <code>socket.on(...)</code> and emit its own messages via the <code>socket.emit(....)</code> methods. 

* <h4> AJAX requests </h4> The front-end also makes use of a more basic form of asynchronous request known as an 'AJAX' request. Put simply, this is a standard HTTP request like those made by a browser when requesting a webpage, but made instead by the Javascript running in the client's browser whilst in use. In <code>index.js</code> such requests can be seen in the use of <code>XMLHttpRequest()</code> objects - following a pattern of <code>.open(...)</code>, <code>.onload(...)</code>, <code>.load()</code> method calls. These are used to communicate with the traditional flask routes in <code>application.py</code> and load all the data for each channel when a user enters or when a new message is sent.

* <h4> Handlebars </h4> Handlebars templates can be seen in <code>index.html</code> inside the tags beginning <code><script id="message" type="text/template"> {% raw -%} </code>. These are used in <code>index.js</code> to produce HTML objects that can be filled with information where there are tags like <code>{{ name }}</code>, and then reproduced quickly and easily. This makes producing multiple messages with the same format much easier than only using the Jinja templating available in Flask.
  
* <h4> Responsive Navbar </h4> <code>index.css</code> includes a <code>.active</code> sub-class property for all of the HTML elements that form the navbar, that reduces <code>margin-left: -250px;</code>. This couples with a short section of javascript at the end of <code>index.html</code> that toggles the sub-class on/off when the <code>#sidebarcollapse</code> button is clicked.

<h3> run_app.sh</h3>

This is a simple shell script that runs the terminal commands required to run the flask application in one go, rather than having to type them individually each time the server is started. 

<h2> Personal Touch </h2>

As briefly mentioned above, the application includes the ability to privately message any of the current users. Each of the users appears along with the available channels under the heading DMs; users may select another user in the same way as a channel and send messages that will only be received by that user. 
