// tip: code fold level 3

go.rdo = function() {
    var vumigo = require('vumigo_v02');
    var FreeText = vumigo.states.FreeText;
    var EndState = vumigo.states.EndState;
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
    var Choice = vumigo.states.Choice;


    var rdo = {
        // Registration of District Official States

        reg_district_official: function(name, $, im) {
            var choices = [];

            return go.utils
                .cms_get("district/", {}, im)
                .then(function(result) {
                    var districts = result.data.objects;
                    districts.sort(
                        function(a, b) {
                            return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));
                        }
                    );
                    for (var i=0; i<districts.length; i++) {
                        var district = districts[i];
                        choices[i] = new Choice(district.id, district.name);
                    }

                    return new PaginatedChoiceState(name, {
                        question: $("Please enter your district name."),

                        choices: choices,

                        options_per_page: 8,

                        next: 'reg_district_official_first_name'
                    });

                });
        },

        reg_district_official_first_name: function(name, $) {
            return new FreeText(name, {
                question: $("Please enter your FIRST name."),

                next: "reg_district_official_surname"
            });
        },

        reg_district_official_surname: function(name, $) {
            return new FreeText(name, {
                question: $("Please enter your SURNAME."),

                next: "reg_district_official_id_number"
            });
        },

        reg_district_official_id_number: function(name, $) {
            return new FreeText(name, {
                question: $("Please enter your ID number."),

                next: "reg_district_official_dob"
            });
        },

        reg_district_official_dob: function(name, $, im, contact) {
            var error = $("Please enter your date of birth formatted DDMMYYYY");

            var question =
                    $("Please enter your date of birth. Start with the day," +
                    " followed by the month and year, e.g. 27111980.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    content = content.trim();
                    if (go.utils.check_and_parse_date(content) === false) {
                        return error;
                    }
                },

                next: function() {
                    var district_official_data = go.utils.registration_official_admin_collect(im);
                    return go.utils
                        .cms_post("district_admin/", district_official_data, im)
                        .then(function(result) {
                            contact.extra.rts_id = result.data.id.toString();
                            contact.extra.rts_district_official_id_number = result.data.id_number;
                            contact.extra.rts_official_district_id = result.data.district.id.toString();
                            contact.name = district_official_data.first_name;
                            contact.surname = district_official_data.last_name;
                            return im.contacts
                                .save(contact)
                                .then(function() {
                                    return "reg_district_official_thanks";
                                });
                        });
                }
            });
        },

        reg_district_official_thanks: function(name, $) {
            return new EndState(name, {
                text:
                    $("Congratulations! You are now registered as a user of the" +
                    " Gateway! Please dial in again when you are ready to start" +
                    " reporting on teacher and learner performance."),

                next:
                    "initial_state"

            });
        }

    };

    return rdo;

}();
