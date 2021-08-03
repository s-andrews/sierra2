# This document contains functions for parsing
# different submission templates and creating
# the required documents in the collection

import openpyxl
import configuration
from pathlib import Path

def pase_submission(file, email, submission):
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

    # We want to read the library prep type from the sheet
    library_prep_type = sample_sheet["C2"].value

    # We need to know that this is a valid prep type, so we check
    # the configuration
    if not library_prep_type in configuration.library_prep_type_names():
        raise ValueError("Didn't understand library type "+library_prep_type)


    if library_prep_type == "Pre-mixed library":
        parse_pre_mixed(sample_sheet,email,submission)

    else:
        raise Exception("No parser for "+library_prep_type)


def parse_pre_mixed(sheet, email, submission):
    """ Parses a submission of pre-mixed libraries """
    pass