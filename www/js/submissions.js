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

    // Clear the existing submissions
    $("#submissions").html("")

    // Put up a message if there are no submssions
    if (data.length == 0) {
        $("#submissions").html("<div class=\"text-center mt-4\"><h5>No submissions to show</h5></div>")
    }

    // We need some mappings for CSS classes for different types of QC status
    let css_qc_classes = {
        "Complete": "bg-success text-light p-1 m-0 rounded",
        "Passed QC": "bg-success text-light p-1 m-0 rounded",
        "Awaiting QC": "bg-warning text-light p-1 m-0 rounded",
        "Awaiting Samples": "bg-warning text-light p-1 m-0 rounded"
    }

    for (let s in data) {
        let thisSub = data[s]

        let sub_html = `
        <div class="card mb-2 mt-2 mx-5">
        <div class="card-body">
            <h4 class="card-title">${thisSub.name} <span class="float-end ${css_qc_classes[thisSub.status]}">${thisSub.status}</span></h4>
            <h6 class="card-title ms-2">Details <a href="#" class="showsubmissiondetails">Show></a></h6>
            <ul class="submissiondetails">
                <li><strong>Submitted by:</strong> ${thisSub.owner}</li>
                <li><strong>Submission date:</strong> ${thisSub.date_submitted}</li>
                <li><strong>Submission type:</strong> ${thisSub.library_prep_type}</li>
                <li><strong>Shared with:</strong> ${thisSub.shared_accounts}</li>
            </ul>
            <h6 class="card-title ms-2">BioSamples <span class="badge bg-secondary">5</span> <a href="#" class="showbiosamples">Show></a></h6>
            <div class="biosamples">
        `
        for (let i in thisSub.samples) {
            sub_html += `
            <div class="biosample ms-5">
            <h6 class="text-light bg-secondary p-2 pb-3 mb-0 mt-1 rounded">BioSample ${i+1}: <strong>${thisSub.samples[i].name}</strong><span class="float-end ${css_qc_classes[thisSub.samples[i].status]}">${thisSub.samples[i].status}</span></h6>
            `
            for (let j in thisSub.samples[i].libraries) {
                sub_html += `<h6 class="p-2">Library ${j+1}: ${thisSub.samples[i].libraries[j].type} (${thisSub.samples[i].libraries[j].barcode})<span class="float-end ${css_qc_classes[thisSub.samples[i].libraries[j].status]}">${thisSub.samples[i].libraries[j].status}</span></h6>
                            </div>
                `
            }
        }
        
        sub_html += `
            </div>
            <div class="submissionbuttons float-end">
            <button type="button" class="btn btn-sm btn-primary">Share</button>
            <button type="button" class="btn btn-sm btn-primary">Edit</button>                  
            <button type="button" class="btn btn-sm btn-primary">Results</button>
            </div>
        </div>
        </div>
        `

        $("#submissions").append(sub_html)

    }
    
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
                $("#newsubmissiondiv").modal("hide")
                populate_submissions(undefined)
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