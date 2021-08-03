$( document ).ready(function() {
    // Show the login page initially
    show_login()

    // Action if they select to create an account
    $("#createaccount").click(show_new_account_form)

    // Action when they submit a new account
    $("#createaccountsubmit").click(create_account)

    // Action when they log in
    $("#login").click(process_login)

    // Action to log out
    $("#navlogout").click(logout)
});


function show_login() {

    // TODO: Check to see if there's a valid session ID
    // we can use

    var session_id = Cookies.get("sierra_session_id")
    if (session_id) {
        // Validate the ID

        $.ajax(
            {
                url: backend,
                method: "POST",
                data: {
                    action: "session_login",
                    session_id: session_id,
                },
                success: function(session_string) {
                    let sections = session_string.split("\t")
                    if (sections.length < 2) {
                        session_id = ""
                        $("#logindiv").modal("show")
                        return
                    }
                    var realname = sections[0]
                    $("#maincontent").show()
    
                    // TODO: Get their list of submissions
                },
                error: function(message) {
                    console.log("Existing session didn't validate")
                    $("#logindiv").modal("show")
                }
            }
        )
    }
    else {
        $("#logindiv").modal("show")
    }
}

// Dismisses the login modal and shows
// the new account modal instead
function show_new_account_form() {
    $("#logindiv").modal("hide")
    $("#newaccountdiv").modal("show")
}

// Log the user out
function logout() {
    session_id = ""
    Cookies.remove("sierra_session_id")
    $("#submissions").html("")
    $("#maincontent").hide()
    $("#logindiv").modal("show")
}


// Processes a new login
function process_login() {
    email = $("#email").val()
    password = $("#password").val()

    $.ajax(
        {
            url: backend,
            method: "POST",
            data: {
                action: "login",
                email: email,
                password: password
            },
            success: function(session_string) {
                let sections = session_string.split("\t")
                if (sections.length < 2) {
                    $("#loginerror").html("Login Failed")
                    $("#loginerror").show()
                    return
                }
                $("#loginerror").hide()
                session_id = sections[1] // TODO: Do something with this
                let realname = sections[0]

                Cookies.set("sierra_session_id", session_id)
                $("#logindiv").modal("hide")
                $("#maincontent").show()

                // TODO: Get their list of submissions
            },
            error: function(message) {
                $("#loginerror").html("Login Failed")
                $("#loginerror").show()
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

    // Check values are present
    let error_message = ""
    if (!new_name) {
        error_message = "No name supplied"
    }
    else if (!new_email) {
        error_message = "No email supplied"
    }
    else if (!new_password) {
        error_message = "No password supplied"
    }
    else if (new_password != new_password2) {
        error_message = "Passwords do not match"
    }

    // Check password is suitably long
    else if (password.length < 8) {
        error_message = "Password must be at least 8 characters long"
    }

    // Check email looks vaguely like an email
    else if (new_email.indexOf("@") < 1) {
        error_message = "Email didn't look like an email address"
    }

    if (error_message) {
        $("#newaccounterror").html(error_message)
        $("#newaccounterror").show()
        return
    }

    // Clear any previous errors
    $("#newaccounterror").hide()

    $.ajax(
        {
            url: backend,
            method: "POST",
            data: {
                action: "new_account",
                name: new_name,
                email: new_email,
                password: new_password
            },
            success: function() {
                console.log("Account created")
                $("#newaccountdiv").modal("hide")
                $("#logindiv").modal("show")
            },
            error: function(message) {
                $("#newaccounterror").html(message)
                $("#newaccounterror").show()
            }
        }
    )


}