# This document contains functions for parsing
# different submission templates and creating
# the required documents in the collection

import openpyxl
import configuration
from datetime import datetime

# This is here because openpyxl spits out warnings from our drop down
# lists in the submission template.  We might need to work around these
# as they could be removed in future, but for the moment it does read 
# them and we can ignore this.  This is a global suppression which isn't
# great, but it's working for now...
import warnings
warnings.filterwarnings("ignore")

def list_submissions(email,shared_emails,submission_collection):
    # This gets the full set of submissions accessible to a single user
    # This will encompass both their own submissions, but also any other
    # submissions to which they have access, either via a user-level share
    # or a specific sharing of an individual submission

    # We want a full list of potential owners so we'll add the main email
    # to the shared list too
    shared_emails.append(email)

    found_submissions = []

    # Since someone could theoretically have access to the same submission in 2
    # ways we want to check we don't add something twice
    already_listed_oids = set()

    # Start with the submissions they own or from any user which shares with them
    for s in submission_collection.find({"owner":{"$in":shared_emails}}):
        # Fix the object id to be text so we can serialise it
        s = sanitise_submission(s)
        if s["_id"] in already_listed_oids:
            continue

        already_listed_oids.add(s["_id"])
        found_submissions.append(s)


    # Now the ones specifically shared with them
    for s in submission_collection.find({"shared_accounts":email}):
        # Fix the object id to be text so we can serialise it
        s = sanitise_submission(s)
        if s["_id"] in already_listed_oids:
            continue

        already_listed_oids.add(s["_id"])
        found_submissions.append(s)



    return found_submissions
    
def sanitise_submission(s):
    # Fixes a BSON submission so that it can be JSON encoded

    # Change the object ID to be a string
    s["_id"] = str(s["_id"])

    # Change the date to be a string
    s["date_submitted"] = str(s["date_submitted"].date())

    return s



def parse_submission(file, email):
    """
    file: stream of the xlsx sample sheet
    email: the email of the users account
    submission: the collection into which the submissions will be added
    """

    # There are a few different submission templates for different
    # library prep types.  We'll get a generic document from the
    # submitted file and then dispatch to the appropriate parser for
    # the library prep type we're dealing with

    sample_sheet = openpyxl.load_workbook(file).active

    # We want to read the library prep type from the sheet.  We need 
    # to pass all excel strings through estrip to remove whitespace 
    # from the ends and fix the encoding of spaces.
    library_prep_type = estrip(sample_sheet["B3"].value)

    # We need to know that this is a valid prep type, so we check
    # the configuration
    valid_types = configuration.library_prep_type_names()

    if not library_prep_type in valid_types:
        raise ValueError("Didn't understand library type '"+library_prep_type)

    if library_prep_type == "Pre-mixed library":
        return(parse_pre_mixed(sample_sheet,email))

    else:
        raise Exception("No parser for "+library_prep_type)


def parse_pre_mixed(sheet, email):
    """ Parses a submission of pre-mixed libraries """
    
    name = estrip(sheet["B7"].value)

    run_type = estrip(sheet["B4"].value)

    if not run_type in configuration.run_type_names():
        raise ValueError("Didn't understand run type "+run_type)

    library_type = estrip(sheet["B5"].value)

    if not library_type in configuration.library_type_names():
        raise ValueError("Didn't understand sample type "+library_type)

    # We can make the base structure into which we're going to add
    # the appropriate details

    submission = create_base_submission(email,name,"Pre-mixed library")

    # Now we can go through adding the samples and libraries to 
    # the structure.  We start on row 9 and keep going until we
    # hit a row with no sample name in column B

    for row in range(9,sheet.max_row+1):
        sample_name = sheet[f"B{row}"].value
        if not sample_name:
            break
        sample_name = estrip(sample_name)
        barcode5 = estrip(sheet[f"C{row}"].value)
        barcode3 = estrip(sheet[f"D{row}"].value)
        barcodes = ":".join([barcode5,barcode3])

        # TODO: Allow barcode aliases?
        # TODO: Should we validate the barcodes


        sample = {
            "name": sample_name,
            "status": "Awaiting QC",
            "annotation": {},
            "libraries": [
                {
                    "type": library_type,
                    "barcode": barcodes,
                    "status": "Awaiting QC",
                    "run_type": run_type,
                }
            ]
        }

        submission["samples"].append(sample)

    if not submission["samples"]:
        raise ValueError("No samples found")

    return submission


def create_base_submission (email, name, library_prep_type):
    return {
        "name": name,
        "date_submitted": datetime.now(),
        "owner": email,
        "status": "Awaiting Samples",
        "complete": False,
        "library_prep_type": library_prep_type,
        "sharing_ids": [],
        "shared_accounts": [],
        "samples": []
    }



def estrip(text):
    """Strips whitespace from the ends of an excel
    string.  Also changes nbsp (ascii 160) into normal
    space (ascii 32) because excel changes them"""

    text = str(text)
    return text.strip().replace(chr(160)," ")
