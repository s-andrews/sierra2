$( document ).ready(function() {
    $("#logindiv").modal("show")
    set_up_submissions()
});


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