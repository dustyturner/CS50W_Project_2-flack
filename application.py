import os
import requests
from time import strftime, localtime

from flask import Flask, jsonify, render_template, redirect, request, session
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

class Message:

    def __init__(self, message):

        self.user = session['user']
        self.time = strftime("%H:%M", localtime())
        self.message = message


messages = {'general': []}
channels = ['general']
current_channel = {'shitface': 'general', 'fuckbeast': 'general'}

@app.route("/login", methods=("GET","POST"))
def login():

    if request.method == "POST":
        username = request.form.get("username")
        if not username:
            return render_template('login.html', error = "enter username")
        else:
            session.clear()
            session['user'] = username
            return redirect("/")
    else:
        return render_template("login.html")
        

@app.route("/")
def index():

    if session.get("user") is None:
        return redirect("/login")

    return render_template("index.html", channels=messages)


@app.route("/get_messages")
def get_messages():

    if session.get("user") not in current_channel:
        current_channel[session.get("user")] = 'general'
        emit('new user', session.get("user"), broadcast=True)
    channel = current_channel[session.get("user")]
    channel_messages = messages[channel] 
    return jsonify(channel_messages)


@app.route("/get_channels")
def get_channels():

    return jsonify(channels)


@app.route("/get_users")
def get_chats():

    data = []
    for user in current_channel:
        data.append(user)
    data.remove(session.get('user'))
    return jsonify(data)


@socketio.on("create channel")
def create_channel(name):
    
    if name not in messages:
        messages[name] = []
        channels.append(name)
        emit("new channel", name, broadcast=True)
    current_channel[session.get('user')] = name


@socketio.on("join channel")
def join_channel(name):

    if session.get('user') not in current_channel:
        current_channel[session.get('user')] = 'general'
        emit("new user", session.get('user'), broadcast=True)

    if name is not 0:
        current_channel[session.get('user')] = name
    join_room(session.get('user'))


@socketio.on("join chat")
def join_chat(username):
    
    names = [session.get('user'), username]
    names.sort()
    chat_name = '-'.join(names)
    if chat_name not in messages:
        messages[chat_name] = []
    current_channel[session.get('user')] = chat_name


@socketio.on("send message")
def new_messsage(data):
    
    message = Message(data)
    messages[current_channel[session.get('user')]].append(message.__dict__) 
    for user in current_channel:
        if current_channel[user] == current_channel[session.get('user')]:
            emit("new message", message.__dict__, room=user, broadcast=True)