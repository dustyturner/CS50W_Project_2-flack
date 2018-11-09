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

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

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
@login_required
def index():

    print("user: " + session['user'] + "is using channel: " + session['channel'])
    return render_template("index.html", channels=channels)

@app.route("/channel/<string:name>")
@login_required
def channel(name):

    session['channel'] = name
    print("user: " + session['user'] + "is using channel: " + session['channel'])
    return render_template("channel.html", name=name)

@app.route("/create_channel", methods=["POST"])
def create_channel():
    
    name = request.form.get("name")
    if name in channels:
        error = "Channel already exists"
        print(error)
    
    else:
        channels[name] = [] 
        session['channel'] = name
        print("user: " + session['user'] + "is using channel: " + session['channel'])
        print("why the fuck")
        print(channels)
        return redirect(url_for('channel', name=name))
    return redirect("/")

@app.route("/get_messages")
def get_messages():
    messages = channels[session['channel']]
    return jsonify(messages)

@socketio.on("connected")
def connected():

    print("user: " + session['user'] + " using channel: " + session['channel'] + " connected")
    join_room(session['channel'])
    emit("new user", session['user'], room=session['channel'], broadcast=True)      

@socketio.on("send message")
def new_messsage(message):
    
    print(message)
    if not message:
        error = "Enter a message"
        print(error)

    else:
        now = datetime.datetime.now()
        time = str(now.hour) + ":" + str(now.minute)

        new_message = {}
        new_message['user'] = session['user']
        new_message['time'] = time
        new_message['message'] = message

        print(time)
        print(new_message)
        channels[session['channel']].append([session['user'], time, message]) 
        print(channels)
        emit("new message", new_message, room=session['channel'], broadcast=True)
        
