// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function () {

    var userRole = "";

    var obj = {
        modalContent: {
            body: {
                name: '<div class="form-row form-group"><div class="input-group-prepend"><span class="btn btn-info"><i class="fas fa-language"></i></span></div><div class="col"><div class="input-group"><input type="text" class="form-control" name="name" placeholder="Name"></div></div></div>',
                email: '<div class="form-row form-group"><div class="input-group-prepend"><span class="btn btn-warning"><i class="fas fa-envelope"></i></span></div><div class="col"><div class="input-group"><input type="email" class="form-control" name="email" placeholder="Email"></div></div></div>',
                phone: '<div class="form-row form-group"><div class="input-group-prepend"><span class="btn btn-info"><i class="fas fa-phone"></i></span></div><div class="col"><div class="input-group"><input type="text" class="form-control" name="phone" placeholder="Phone"></div></div></div>',
                company: '<div class="form-row form-group"><div class="input-group-prepend"><span class="btn btn-dark"><i class="fas fa-building"></i></span></div><div class="col"><div class="input-group"><input type="text" class="form-control" name="company" placeholder="Company Name"></div></div></div>',
                progress: '<div class="progress mx-4 mb-2"><div class="progress-bar bg-warning w-100 progress-bar-striped progress-bar-animated"></div></div><span class="text-dark progress-state"></span>',
                description: '<div class="form-row form-group"><div class="input-group-prepend"><span class="btn btn-secondary"><i class="fas fa-info"></i></span></div><div class="col"><div class="input-group"><textarea class="form-control mh-2" name="description" placeholder="Message Description" rows="2"></textarea></div></div></div>',
            },
            footer: {
                dismiss: '<button type="submit" class="btn btn-sm btn-secondary dismiss-modal"><i class="fas fa-times"></i> Dismiss</button>',
                apply: '<button type="submit" class="btn btn-sm btn-info cmd" data-cmd="apply" data-rdy="true"><i class="fab fa-telegram-plane"></i> Send</button>',
                cancel: '<button class="btn btn-sm btn-secondary dismiss-modal"><i class="fas fa-times"></i> Cancel</button>',
            },
            validate: function (data) {
                var error = "";
                for (var key in data) {
                    val = String(data[key]);
                    switch (key) {
                        case "name":
                            if (val.length < 3 || !isNaN(val)) {
                                error += "invalid " + key + "<br>";
                            }
                            break;
                        case "email":
                            if (val.split("@").length < 2) {
                                error += "invalid " + key + "<br>";
                            }
                            break;

                        case "phone":
                            if (val.length < 7 || isNaN(val)) {
                                error += "invalid " + key + "<br>";
                            }
                            break;
                        case "company":
                            if (val.length < 3 || !isNaN(val)) {
                                error += "invalid " + key + "<br>";
                            }
                            break;
                        case "description":
                            if (val.length < 5 || !isNaN(val)) {
                                error += "invalid " + key + "<br>";
                            }
                            break;
                    }
                }
                return error;
            }
        },
        contact: {
            keys: {
                modal: ["name", "phone", "email", "company", "description"],
                lock: {
                    modal: [],
                },
            },
            html: {
                header: '<button class="btn btn-outline-light"><i class="fas fa-comments"></i> Contact</button>',
                body: {
                    modal: ["name", "phone", "email", "company", "description"],
                },
                footer: {
                    modal: ["cancel", "apply"],
                },
            },

            request: {
                type: {
                    modal: "",
                    apply: "POST",
                },
                route: function (cmd) {
                    //apply
                    if (cmd === "new") return "/contact/";
                    //modal
                    return "/contact/";
                },
            },
        },
    };


    function handle_click(event) {
        event.preventDefault();

        //setting up values for processing
        var cmd = $(this).data("cmd");
        var data_type = $(this).data("type");
        if (!data_type) {
            data_type = $(this).closest("table").data("type");
        }

        console.log('data_type: ', data_type);
        console.log('cmd: ', cmd);

        //preparing the request options
        var request = {
            route: obj[data_type].request.route(cmd),
            type: obj[data_type].request.type[cmd],
            data: {},
        };

        var error = "";

        //getting data from modal fields
        if (request.type === "GET" || request.type === "") {

            //render modal
            if (obj[data_type].html.header) {
                showModal(cmd, data_type);
                updateDashboard();
            }
        } else {

            //gather values from modal
            for (var id in obj[data_type].keys.modal) {
                let key = obj[data_type].keys.modal[id];
                if ($("input[name=" + key + "], select[name=" + key + "], textarea[name=" + key + "]").length > 0) {
                    request.data[key] = $("input[name=" + key + "], select[name=" + key + "], textarea[name=" + key + "]").val();
                }
            }

            //validating values in modal's method
            error = obj.modalContent.validate(request.data);
            $(".progress-state").html(error);
        }

        if (error.length === 0 && request.type.length > 0) {

            $(".progress-bar").removeClass("bg-dark-blue bg-danger bg-warning bg-success").addClass("progress-bar-animated w-100");
            if (request.type === "GET") {
                $(".progress-state").text("Getting information...");
            } else {
                $(".progress-state").text("Processing...");
            }

            //consoling the request
            console.log("request: ", JSON.stringify(request, null, 5));

            //sending request
            $.ajax(request.route, {
                type: request.type,
                data: request.data
            }).then(function (response) {

                setTimeout(function () {

                    $(".progress-bar").addClass("bg-success");
                    $(".progress-state").text("Successfully Processed!");
                    $(".modal-footer").html(obj.modalContent.body.dismiss);
                    setInterval(function () {
                        location.reload();
                    }, 750);

                }, 750);

                updateDashboard();
            }).catch(function (error) {
                console.log(JSON.stringify(error, null, 5));

                setTimeout(function () {
                    $(".progress-bar").addClass("bg-danger");
                    if (request.type === "GET") {
                        $(".progress-state").text("Retrieving Failure!");
                    } else {
                        $(".progress-state").text("Sending Failure!");
                    }
                }, 750);
            });
        }

    }


    function showModal(cmd, data_type) {

        var header = obj[data_type].html.header;

        var body = "";
        for (var id in obj[data_type].html.body[cmd]) {
            let key = obj[data_type].html.body[cmd][id];
            body += obj.modalContent.body[key];
        }
        body += obj.modalContent.body.progress;
        body += `<p class="lead text-uppercase bg-warning font-weight-bold border p-2 mt-3"><i class="fas fa-info-circle"></i> Attention: This is a demo! Please use your E-Mail</p>`;

        var footer = "";
        for (var id in obj[data_type].html.footer[cmd]) {
            let key = obj[data_type].html.footer[cmd][id];
            footer += obj.modalContent.footer[key];
        }

        //filling the modal & showing it
        $(".modal-header").html(header);
        $(".modal-body .container").html(body);
        $(".modal-footer").html(footer);
        $(".modal").modal('show');
        $(".modal-body .container .form-control").first().focus();

        //lock the modal fields if the modal is in view or delete modes
        for (var id in obj[data_type].keys.lock[cmd]) {
            let key = obj[data_type].keys.lock[cmd][id];
            $("input[name=" + key + "], select[name=" + key + "], textarea[name=" + key + "], button[name=" + key + "]").prop('disabled', true);
        }



        //assign to the modal the request parameters
        $(".modal-footer .cmd").attr({
            "data-type": data_type,
        });
    }

    function hideModal() {
        $(".modal-header").empty();
        $(".modal-body .container").empty();
        $(".modal-footer").empty();
        $(".modal").modal('hide');
    }

    function updateDashboard() {
        //setting up the width of the modal's fields
        $("span.btn, i.btn").addClass("d-flex");
        $("span.btn i, a.btn i").addClass("m-auto");
        $("textarea").css("min-height", "3em");
        $(".modal-footer span.btn i").removeClass("m-auto").addClass("my-auto mr-1");
    }

    function navbar_resize() {
        if ($(window).width() > 770) {// larger than small screen
            $(".auto-height, .update-height").attr("style", "max-height:" + $(window).height() + "px; min-height: 33em");
            $(".auto-height").addClass("scroll")
        } else {
            $(".auto-height").attr("style", "height: auto");
            $(".auto-height").removeClass("scroll")
            $(".update-height").attr("style", "max-height:" + ($(window).height() - $(".auto-height").height() - 16.5) + "px;");
        }
    }

    $(document).on("click", ".cmd", handle_click);
    $(document).on("click", '.modal:not(.show), .dismiss-modal', hideModal);
    $(document).keyup(function (event) {
        if (event.key === "Escape") {
            hideModal();
        }
    });
    $(document).on("click", ".input-group-prepend .btn", function () {
        $(this).closest(".form-row").find(".form-control").first().focus();
    });
    $(window).resize(navbar_resize);

    navbar_resize();
    updateDashboard();

});
