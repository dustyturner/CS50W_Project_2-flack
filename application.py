import os
import requests
import datetime

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

channels = {'general': []}
channel = 'general'

@app.route("/login", methods=("GET","POST"))
def login():

    if request.method == "POST":
        user = request.form.get("user")
        if not user:
            print("no user biatch!!")
            return render_template('login.html', error = "enter username")
        else:
            session.clear()
            session['user'] = user
            session['channel'] = 'general'
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

    global channel
    session['channel'] = channel
    print(f"channel is {session['channel']}")
    print(channels)
    
    messages = channels[session['channel']]
    return jsonify(messages)


@socketio.on("connected")
def connected():

    global channel
    join_room(channel)
    emit("new user", session['user'], room=session['channel'], broadcast=True)      

@socketio.on("join channel")
def join_channel(name):

    global channel
    channel = name
    join_room(name)
    emit("new user", session['user'], room=session['channel'], broadcast=True)      
    print(f"channel changed to {session['channel']}")


@socketio.on("create channel")
def create_channel(name):
    
    if name in channels:
        error = "Channel already exists"
        print(error)
    
    else:
        global channel
        channel = name
        channels[name] = []
        join_room(name)
        emit("new channel", name, broadcast=True)

@socketio.on("send message")
def new_messsage(message):
    
    if not message:
        error = "Enter a message"
        print(error)

    else:
        global channel
        now = datetime.datetime.now()
        time = str(now.hour) + ":" + str(now.minute)
        new_message = {}
        new_message['user'] = session['user']
        new_message['time'] = time
        new_message['message'] = message
        channels[channel].append([session['user'], time, message]) 
        emit("new message", new_message, room=channel, broadcast=True)
        
