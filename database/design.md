Sierra Database Design
======================


DBMS
====

We're going to use a mongodb NoSQL database for the new version
of sierra.  With the structure of the data, the limited amount
of querying we're going to do, and the relatively low number of
documents we're likely to accumulate (maybe a few thousand tops)
we should be able to accommodate everything into this format and
it will make the back end operations easier to manage.


Design Principles
=================

The main reason for the new change is that we need to add more 
flexible options for submitting biological samples rather than
pre-prepared libraries, and we will be sending some of our sequencing
out to external sequencing providers rather than managing everything
in house.  Incorporating these into the existing system would be
cumbersome so redesigning makes sense.  At the same time we also 
expect to see larger numbers of samples per submission, mixed data
submissions (one sample making multiple libraries) and other oddities
which we should support.  We therefore want to keep the structure of
the back end fairly neutral and move more logic to the front end to
make changes easier.

We are also going to move to using submission sheets rather than
having the submission form online to make it easier for people to
submit multiple samples.  We will have more limited editing capabilities
within the web interface than before (at least for users).


Submission Process
==================

There is a separate document which shows the relationships between the
different components of the database, but in essence we want to split
the storage of the data into three main documents.

Submmission
-----------

The main document will be a submission.  This will contain the submitting
users' details, the date, a name and the type of submission.  The type will
either be a library preparation protocol, or it will flag the submission as
a pre-mixed library.

Also in the submission we will have a list of the biological samples they're 
going to provide.  Each will have a user submitted name, and will be given
a sub-ID by the system.  From these we will then create a library which will
be populated by the facility, and which will have details of the barcoding
used.

This document will track the progress of the submission and will also be the
access point for the data which is ultimately produced.  This document will be
the only item users interact with.


Mixed Library
-------------

The next document will be a mixed library.  This will be used to record the
mixing of libraries destined for the same type of sequencing into a mixed 
collection which will be sequenced together.  Some QC will be attached to
this document.  It's only going to be visible to admin users.


Sequencing Batch
----------------

The final document is the sequencing run.  This describes a batch of mixed 
lanes which will generate data together, either via being run on an internal
sequencer, or by being sent out as a batch to an external provider.  It will
contain the details of the positions of the lanes on a flowcell or the external
IDs assigned to mixed libraries.  This will only be seen by admins, but will
be used to link data to submissions for the user to see.


Other collections
=================

Outisde of the main data flow there are other things we are going to want to
record.

People
------

We'll need a collection for users to hold their personal details and passwords.
We'll also use this to record delegated authority (who their boss is), and 
trusted friends (people who can see thier data).  We're also going to allow
sharing on a submission level too this time.

Configuration
-------------

I'm not sure yet whether I want this in the database, but somewhere we're going
to need to store some configuration to describe the types of library prep, the
types of library, the genomes we have, the sequencers or external providers and
stuff like that.


Notes, Attachments, Data
------------------------

There are various places where we will need to attach text notes, documents or 
even key/value data to different objects.  I haven't decided yet how to handle
this but it probably makes sense to have these in a separate collection.  Maybe
we'll have a document per submission so we don't have to put lots of stuff into
the main submission document.  It also means I can ignore this side of things 
initially.






















