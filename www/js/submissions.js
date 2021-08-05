$( document ).ready(function() {
    $("#navnewsubmission").click(show_new_submission)
    $("#samplesheetdownload").click(download_sample_sheet)
    $("#samplesheetupload").click(upload_sample_sheet)
});

function download_sample_sheet() {
    // Find the library type they're using
    let sample_sheet_type = $("#sample_sheet_type").val()

    // Download that sheet - we have to do this by setting
    // the window location to the appropriate GET URL on 
    // the back end and then letting the browser do its thing
    top.location.href=backend+"?action=samplesheet&type="+sample_sheet_type
}

function populate_submissions (data) {
    // This gets a list of submissions for the current user
    // and fills out the submissions div.  It will replace
    // whatever is in the div already

    // The function can either be called with an undefined
    // value which will kick off an ajax request to get the
    // list of accessible submissions for the current user,
    // or it can be called by the ajax callback, in which case
    // data will be the json list of submissions.

    if (typeof(data) === 'undefined') {
        // We need to query for the submission data
        $.ajax(
            {
                url: backend,
                data: {
                    action: "list_submissions",
                    session: session_id
                },
                success: function(data) {
                    populate_submissions(data)
                },
                error: function(message) {
                    console.log("Failed to list submissions")
                }
            }
        )
        return
    }

    // We're putting out the new submissions
    console.log("Adding "+data.length+"submissions to page")

    //TODO: Add submissions

    // We need to enable events on the newly added submissions
    set_up_submissions()
}

function upload_sample_sheet() {
    // This takes in a filled submission and sends it on to the 
    // backend to create the submission, samples, libraries etc.

    // Get the file from the upload field
    samplesheet_file = $("#samplesheetfile")[0].files[0]

    if (!samplesheet_file) {
        $("#samplesheeterror").html("No sample sheet file selected")
        $("#samplesheeterror").show()
        return
    }

    $("#samplesheeterror").hide()

    let data = new FormData()
    data.append("action","new_submission")
    data.append("session", session_id)
    data.append("file", samplesheet_file)

    $.ajax(
        {
            url: backend,
            method: "POST",
            processData: false,
            contentType: false, 
            data: data,
            success: function(new_id) {
                console.log("Inserted new submission "+new_id)
                // TODO: Update the list of submissions
                $("#newsubmissiondiv").modal("hide")
            },
            error: function(message) {
                $("#samplesheeterror").html(message)
                $("#samplesheeterror").show()
            }
        }
    )
}


function set_up_submissions() {

    // This toggles the submission details in the list of submissions
    $(".showsubmissiondetails").click(function(e) {
        e.preventDefault()
        $(this).parent().nextAll(".submissiondetails").toggle()
    }) 


    // This toggles the biosample details in the list of submissions
    $(".showbiosamples").click(function(e) {
        e.preventDefault()
        $(this).parent().nextAll(".biosamples").toggle()
    })     
}

function show_new_submission() {
    // Populate the sample types and show the dialog
    $.ajax(
        {
            url: backend,
            data: {
                action: "prep_types",
            },
            success: function(prep_types) {
                console.log("Found types "+prep_types)
                $("#sample_sheet_type").html("")
                for (let i in prep_types) {
                    $("#sample_sheet_type").append(`<option>${prep_types[i]}</option>`)
                }
                $("#newsubmissiondiv").modal("show")
            },
            error: function(message) {
                console.log("Failed to list prep types"+ message)
            }
        }
    )
}