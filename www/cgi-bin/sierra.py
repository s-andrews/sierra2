#!/usr/bin/env python3
import json
from pymongo import MongoClient
import bcrypt
import string
import sys
import random
import sys
import cgi
import configuration
import submission
import cgitb
cgitb.enable()

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
        process_login(form["email"].value, form["password"].value,"")
    elif action == "session_login":
        process_login("", "",form["session_id"].value)
    elif action=="new_account":
        new_account(form["name"].value,form["email"].value,form["password"].value)
    elif action == "prep_types":
        list_prep_types()
    elif action == "samplesheet":
        download_sample_sheet(form["type"].value)
    elif action == "new_submission":
        process_new_submission(form)
    elif action == "list_submissions":
        list_submissions(form["session"].value)


def list_submissions(session):
    # We can find their email from the session
    person = people.find_one({"sessioncode": session})

    if person is None:
        send_error("Couldn't find session token")

    email = person["email"]

    # We also need to know the emails of anyone else who has
    # shared all of their samples with this person

    shared_emails = []

    for p in people.find({"delegates_rw":email}):
        shared_emails.append(p["email"])

    for p in people.find({"delegates_ro":email}):
        shared_emails.append(p["email"])


    submission_data = submission.list_submissions(email,shared_emails,submissions)

    print("Content-type: text/json\n")
    print(json.dumps(submission_data))

def process_new_submission(form):
    # We should be sent their session token
    session = form["session"].value

    # We can find their email from the session
    person = people.find_one({"sessioncode": session})

    if person is None:
        send_error("Couldn't find session token")

    if form["file"].filename is None:
        send_error("No file to parse")
    try:
        new_submission = submission.parse_submission(form["file"].file,person["email"])
        new_id = submissions.insert_one(new_submission).inserted_id
        send_success(new_id)

    except ValueError as v:
        send_error("Failed to parse: "+v)



def download_sample_sheet(type):
    # Check this is a valid type
    if not type in configuration.library_prep_type_names():
        send_error("Couldn't find sample sheet for "+type)

    # Find the correct xlsx file for this type and return it
    path = configuration.get_submission_file_for_type(type)
    with open(path,"rb") as fh:
        print("Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        print(f"Content-Disposition: attachment; filename={path.stem}\n")
        sys.stdout.flush()
        sys.stdout.buffer.write(fh.read())
    
    sys.stdout.flush()
    


def list_prep_types():
    print("Content-type: text/json\n")
    print(json.dumps(configuration.library_prep_type_names()))


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

    # We'll make a rest code which they'll use to verify the account
    reset_code = generate_code(8)

    person = {
        "name": name,
        "email": email,
        "email_valid": True, # Eventually we'll make this false until they validate it
        "admin": False,
        "password": bcrypt.hashpw(password.encode("UTF-8"),bcrypt.gensalt()).decode("UTF-8"),
        "sessioncode": None,
        "reset_code": reset_code,
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



def process_login(email,password,sessioncode):
    # Get the document for this person.  We keep all
    # emails as lowercase internally.
    if email:
        person = people.find_one({"email": email.lower()})

    else:
        person = people.find_one({"sessioncode": sessioncode})

    # Throw an error if we can't find them
    if person is None:
        send_error("Person not found")

    # Check their password
    if email:
        if not bcrypt.checkpw(password.encode("UTF-8"),person["password"].encode("UTF-8")):
            send_error("Wrong password")

        # Generate a session token 
        sessioncode = generate_code(20)

        # Set the session value for this user
        people.update_one({"email":email.lower()},{"$set":{"sessioncode":sessioncode}})

    # Return the new code
    send_success(person["email"]+"\t"+sessioncode)



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