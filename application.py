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
current_channel = {}

@app.route("/login", methods=("GET","POST"))
def login():

    session.clear()

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

    return render_template("index.html")


@app.route("/get_messages")
def get_messages():

    data = {'chatting': [], 'messages': []}
    current_user = session.get('user')

    if current_user not in current_channel:
        current_channel[current_user] = 'general'
        emit('new user', current_user, broadcast=True)

    channel = current_channel[current_user]
    data['channel'] = channel

    try:
        channel_messages = messages[channel]
        data['messages'] = messages[channel]
    except:
        channel_messages = 0

    for user in current_channel:
        if current_channel[user] == current_channel[current_user]:
            data['chatting'].append(user)

    print(data)
    return jsonify(data)



@app.route("/get_channels")
def get_channels():

    current_user = session.get('user')
    data = {'users': [], 'channels': [], 'current_channel': '', 'chatting': []}

    try:
        data['current_channel'] = current_channel[current_user].split("-")
        data['current_channel'].remove(current_user)
    except:
        data['current_channel'] = current_channel[current_user]

    for user in current_channel:
        data['users'].append(user)
        if current_channel[user] == current_channel[current_user]:
            data['chatting'].append(user)

    data['channels'] = channels
    print(data)
    return jsonify(data)


@socketio.on("create channel")
def create_channel(name):

    print(f"creating {name}")
    if name not in messages:
        messages[name] = []
        channels.append(name)
        emit("new channel", name, broadcast=True)
    current_channel[session.get('user')] = name
    emit("channel_joined", broadcast=True)


@socketio.on("join channel")
def join_channel(name):

    print(f"joining channel {name}")
    if session.get('user') not in current_channel:
        current_channel[session.get('user')] = 'general'
        emit("new user", session.get('user'), broadcast=True)

    elif name in current_channel:
        names = [session.get('user'), name]
        names.sort()
        chat_name = '-'.join(names)
        if chat_name not in messages:
            messages[chat_name] = []
        current_channel[session.get('user')] = chat_name

    elif name is not 0:
        current_channel[session.get('user')] = name

    join_room(session.get('user'))
    emit("channel_joined", broadcast=True)


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

    if len(messages[current_channel[session.get('user')]]) > 100:
        del messages[current_channel[session.get('user')]][0]

    for user in current_channel:
        if current_channel[user] == current_channel[session.get('user')]:
            emit("new message", message.__dict__, room=user, broadcast=True)
