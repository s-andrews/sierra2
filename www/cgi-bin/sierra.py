#!/usr/bin/env python3
import json
from pymongo import MongoClient
import bcrypt
import string
import sys
import random
import cgi
import cgitb
#cgitb.enable()

def main():

    # Get the collections we're going to need. These are
    # defined as global variables
    create_db_connection()

    # Find the action and dispatch to the correct function
    form = cgi.FieldStorage()

    if not "action" in form:
        raise ValueError("No action")

    action = form["action"].value

    dispatch_action(action,form)


def dispatch_action(action,form):

    if action == "login":
        process_login(form["email"].value, form["password"].value)
    elif action=="new_account":
        new_account(form["name"].value,form["email"].value,form["password"].value)


def send_error(message):
    print("Status: 500 Internal Server Error")
    print("Content-Type: text/plain\n")
    print(message, end="")
    sys.exit(0)

def send_success(message):
    print("Content-Type: text/plain\n")
    print(message, end="")
    sys.exit(0)


def new_account(name,email,password):
    # Creates a new account

    # Make the email lowercase for consistency (emails are case insensitive)
    email = email.lower()

    # Check the email isn't already in use
    existing = people.find_one({"email":email})

    if existing is not None:
        send_error("Account already exists")

    # We can go ahead and make the new account
    person = {
        "name": name,
        "email": "simon.andrews@babraham.ac.uk",
        "email_valid": True, # Eventually we'll make this false until they validate it
        "admin": False,
        "password": bcrypt.hashpw(password.encode("UTF-8"),bcrypt.gensalt()).decode("UTF-8"),
        "sessioncode": None,
        "reset_code": None,
        "delegates_rw": [],
        "delegates_ro" : []
    }

    # We can insert this into the database
    people.insert_one(person)

    # TODO: We send an email to make them confirm the account
    send_success("Created User "+email)

    

def generate_code(length):
    letters = string.ascii_lowercase+string.ascii_uppercase+string.digits
    code = ""
    for _ in range(length):
        code += random.choice(letters)
    
    return code



def process_login(email,password):
    # Get the document for this person.  We keep all
    # emails as lowercase internally.
    person = people.find_one({"email": email.lower()})

    # Throw an error if we can't find them
    if person is None:
        raise ValueError("No user found")

    # Check their password
    if not bcrypt.checkpw(password,person["password"]):
        raise ValueError("Wrong password")

    # Generate a session token 
    sessioncode = generate_code(20)

    # Set the session value for this user
    people.update_one({"email":email},{"$set":{"sessioncode",sessioncode}})

    # Return the new code
    send_success(sessioncode)



def create_db_connection():
    client = MongoClient()
    db = client.sierra_database

    global people 
    people = db.people_collection

    global submissions 
    submissions = db.submissions_collection

    global libraries 
    libraries = db.libraries_collection

    global batches 
    batches = db.batches_collection


if __name__ == "__main__":
    main()