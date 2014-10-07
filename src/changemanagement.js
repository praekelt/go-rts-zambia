go.cm = function() {

    var vumigo = require('vumigo_v02');
    var ChoiceState = vumigo.states.ChoiceState;
    var FreeText = vumigo.states.FreeText;
    var EndState = vumigo.states.EndState;
    var Choice = vumigo.states.Choice;


    var cm = {
        // Registration of Change Management States

        manage_change_emis_error: function(name, $) {
            return new ChoiceState(name, {
                question: $("Your cell phone number is unrecognised. Please associate your new " +
                            "number with your old EMIS first before requesting to change school."),

                choices: [
                    new Choice('initial_state', $("Main menu.")),
                    new Choice('end_state', $("Exit."))],

                next: function(choice) {
                    return choice.value;
                }
            });
        },



        manage_change_msisdn_emis: function(name, $, array_emis, opts, im) {
            return new FreeText(name, {
                question: $("Please enter the school's EMIS number that you are currently " +
                            "registered with. This should have 4-6 digits e.g 4351."),

                next: function(content) {
                    if (go.utils.check_valid_emis(content, array_emis)) {
                        var emis = parseInt(content, 10);
                        return go.utils
                            .cms_get("data/headteacher/?emis__emis=" + emis, im)
                            .then(function(result) {
                                var parsed_result = JSON.parse(result.body);
                                var headteacher_id = parsed_result.id;
                                var data = {
                                    msisdn: im.user.addr
                                };
                                return go.utils
                                    .cms_put("data/headteacher/" + headteacher_id + "/", data, im)
                                    .then(function() {
                                        return 'manage_change_msisdn_emis_validates';
                                    });
                            });
                    } else if (opts.retry === false) {
                        return "manage_change_msisdn_emis_retry_exit";
                    } else if (opts.retry === true) {
                        return "reg_exit_emis";
                    }
                }
            });
        },

        manage_change_msisdn_emis_validates: function(name, $) {
            return new EndState(name, {
                text:
                    $("Thank you! Your cell phone number is now the official number " +
                    "that your school will use to communicate with the Gateway."),

                next: "initial_state"
            });
        },

        manage_change_msisdn_emis_retry_exit: function(name, $) {
            return new ChoiceState(name, {
                question: $("There is a problem with the EMIS number you have entered."),

                choices: [
                    new Choice('retry', $("Try again")),
                    new Choice('exit', $("Exit"))
                ],

                next: function(content) {
                    if (content.value === 'retry') {
                        return {
                            name: "manage_change_msisdn_emis",
                            creator_opts: {
                                retry: true
                            }
                        };
                    } else {
                        return "reg_exit_emis";
                    }
                }
            });
        },



        manage_change_emis: function(name, $, array_emis, opts, contact, im) {
            return new FreeText(name, {
                question: $("Please enter your school's EMIS number. This should have 4-6 " +
                            "digits e.g 4351."),

                next: function(content) {
                    if (go.utils.check_valid_emis(content, array_emis)) {
                        contact.extra.registration_origin = name;
                        return im.contacts
                            .save(contact)
                            .then(function() {
                                return "manage_change_emis_validates";
                            });
                    } else if (opts.retry === false) {
                        return "manage_change_emis_retry_exit";
                    } else if (opts.retry === true) {
                        return "reg_exit_emis";
                    }
                }
            });
        },

        manage_change_emis_validates: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Thanks for claiming this EMIS. Redial this number if you ever " +
                    "change cellphone number to reclaim the EMIS and continue to receive " +
                    "SMS updates."),

                choices: [
                    new Choice('continue', $("Continue"))
                ],

                next: "reg_school_boys"
            });
        },

        manage_change_emis_retry_exit: function(name, $) {
            return new ChoiceState(name, {
                question: $("There is a problem with the EMIS number you have entered."),

                choices: [
                    new Choice('retry', $("Try again")),
                    new Choice('exit', $("Exit"))
                ],

                next: function(content) {
                    if (content.value === 'retry') {
                        return {
                            name: "manage_change_emis",
                            creator_opts: {
                                retry: true
                            }
                        };
                    } else {
                        return "reg_exit_emis";
                    }
                }
            });
        },



        manage_update_school_data: function(name, $, contact, im) {
            return new ChoiceState(name, {
                question:
                    $("You'll now be asked to re-enter key school details to ensure the " +
                    "records are accurate. Enter 1 to continue."),

                choices: [
                    new Choice('continue', $("Continue"))
                ],

                next: function() {
                    contact.extra.registration_origin = name;
                    return im.contacts
                        .save(contact)
                        .then(function() {
                            return "reg_school_boys";
                        });
                }
            });
        },

        "commas": "commas"
    };

    return cm;

}();
