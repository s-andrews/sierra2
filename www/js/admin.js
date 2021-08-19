$( document ).ready(function() {

    $(".showhide").click(showhide)
    $(".mixdetails").click(mixdetails)


});



function showhide () {
    // Shows or Hides the section clicked on
    $(this).next("div").toggle()
    $(this).next("div").next("table").toggle()
}

function mixdetails() {
    $(this).closest("tr").nextAll("tr").first().toggle()
}