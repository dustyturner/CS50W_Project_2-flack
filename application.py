import os
import requests
from time import strftime, localtime

from flask import Flask, jsonify, render_template, redirect, request, session, url_for
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room
from functools import wraps

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


channels = {'general': []}
users = {'shitface': 'general', 'fuckbeast': 'general'}

@app.route("/login", methods=("GET","POST"))
def login():

    if request.method == "POST":
        username = request.form.get("username")
        if not username:
            return render_template('login.html', error = "enter username")
        else:
            session.clear()
            session['user'] = username
            users[username] = 'general'
            return redirect("/")
    else:
        return render_template("login.html")
        

@app.route("/")
def index():

    if session.get("user") is None:
        return redirect("/login")
    return render_template("index.html", channels=channels)


@app.route("/get_messages")
def get_messages():

    channel = users[session.get("user")]
    messages = channels[channel] 
    return jsonify(messages)


@socketio.on("join channel")
def join_channel(name):

    if name is not 0:
        users[session.get('user')] = name
        
    join_room(session.get('user'))
    current_channel = users[session.get('user')]


@socketio.on("create channel")
def create_channel(name):
    
    if name not in channels:
        channels[name] = []
        emit("new channel", name, broadcast=True)
    users[session.get('user')] = name


@socketio.on("send message")
def new_messsage(data):
    
    message = Message(data)
    current_channel = users[session.get('user')]
    channels[current_channel].append(message.__dict__) 

    for user in users:
        if users[user] == current_channel:
            emit("new message", message.__dict__, room=user, broadcast=True)