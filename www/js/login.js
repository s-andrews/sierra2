$( document ).ready(function() {
    // Show the login page initially
    show_login()

    // Action if they select to create an account
    $("#createaccount").click(show_new_account_form)

    // Action when they submit a new account
    $("#createaccountsubmit").click(create_account)

    // Action when they log in
    $("#login").click(process_login)
});


function show_login() {

    // TODO: Check to see if there's a valid session ID
    // we can use
    $("#logindiv").modal("show")

}

// Dismisses the login modal and shows
// the new account modal instead
function show_new_account_form() {
    $("#logindiv").modal("hide")
    $("#newaccountdiv").modal("show")
}


// Processes a new login
function process_login() {
    email = $("#email").val()
    password = $("#password").val()

    $.ajax(
        {
            url: backend,
            data: {
                action: "login",
                email: email,
                password: password
            },
            success: function(session_string) {
                let sections = session.split("\t")
                var session = sections[0]
                let realname = sections[1] // TODO: Do something with this
                // TODO: Set cookie
                $("#logindiv").modal("hide")
                $("#maindiv").modal("show")

                // TODO: Get their list of submissions
            }
        }
    )
}

// Processes a new account
function create_account() {
    new_name = $("#new_name").val()
    new_email = $("#new_email").val()
    new_password = $("#new_password").val()
    new_password2 = $("#new_password").val()

    // TODO: Check values are present
    // TODO: Check email looks like an email
    // TODO: Check passwords match

    $.ajax(
        {
            url: backend,
            data: {
                action: "new_account",
                name: new_name,
                email: new_email,
                password: new_password
            },
            success: function() {
                // TODO: Show a success message
                $("#newaccountdiv").modal("hide")
                $("#logindiv").modal("show")

            }
        }
    )


}