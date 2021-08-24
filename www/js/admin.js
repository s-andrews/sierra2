$( document ).ready(function() {

    $(".showhide").click(showhide)
    $(".btn-details").click(btndetails)
    $(".filter-enable").click(showfilter)


});



function showhide () {
    // Shows or Hides the section clicked on
    $(this).next("div").toggle()
    $(this).next("div").next("div").toggle()
}

function btndetails() {
    $(this).closest("tr").nextAll("tr").first().toggle()
}

function showfilter() {
    // Shows the filter options when a filter button is clicked
    $(this).next("div").toggle()
}