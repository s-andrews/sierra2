# This script deals with the configuration of sierra
from pathlib import Path
import json


def read_configuration():
    config_file = Path(__file__).parent.parent.parent / "configuration/configuration.json"

    with open(config_file) as cf:
        return json.load(cf)


def library_prep_type_names():
    names = []
    for x in read_configuration()["library_preps"]:
        names.append(x["name"])
    return names

def get_submission_file_for_type(type):
    for c in read_configuration()["library_preps"]:
        if c["name"] == type:
            return Path(__file__).parent.parent.parent / "configuration/submission_templates/"/c["template"]