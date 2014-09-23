var vumigo = require('vumigo_v02');
var FreeText = vumigo.states.FreeText;
var EndState = vumigo.states.EndState;
var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
var Choice = vumigo.states.Choice;


go.rdo = {
    // Registration of District Official States

    reg_district_official: function(name, im) {
        var choices = [];
        var districts = im.config.districts;

        for (var i=0; i<districts.length; i++) {
            var district = districts[i];
            choices[i] = new Choice(district.id, district.name);
        }

        return new PaginatedChoiceState(name, {
            question: "Please enter your district name.",

            choices: choices,

            options_per_page: 8,

            next: 'reg_district_official_first_name'
        });
        
    },

    reg_district_official_first_name: function(name) {
        return new FreeText(name, {
            question: "Please enter your FIRST name.",

            next: "reg_district_official_surname"
        });
    },

    reg_district_official_surname: function(name) {
        return new FreeText(name, {
            question: "Please enter your SURNAME.",

            next: "reg_district_official_id_number"
        });
    },

    reg_district_official_id_number: function(name) {
        return new FreeText(name, {
            question: "Please enter your ID number.",

            next: "reg_district_official_dob"
        });
    },

    reg_district_official_dob: function(name) {
        var error = "Please enter your date of birth formatted DDMMYYYY";

        var question = 
                "Please enter your date of birth. Start with the day," +
                " followed by the month and year, e.g. 27111980.";

        return new FreeText(name, {
            question: question,

            check: function(content) {
                if (go.utils.check_and_parse_date(content) === false) {
                    return error;    
                }
            },

            next: "reg_district_official_thanks"
        });
    },

    reg_district_official_thanks: function(name) {
        return new EndState(name, {
            text:
                "Congratulations! You are now registered as a user of the" +
                " Gateway! Please dial in again when you are ready to start" +
                " reporting on teacher and learner performance.",

            next:
                "initial_state"

        });
    }

};




// pasted states


    // self.add_state(new FreeText(
    //     "reg_district_official_dob",
    //     "reg_thanks_district_admin",
    //     "Please enter your date of birth. Start with the day,"+
    //     " followed by the month and year, e.g. 27111980.",
    //     function(content) {
    //         // check that the value provided is date format we expect
    //         return self.check_and_parse_date(content);
    //     },
    //     "Please enter your date of birth formatted DDMMYYYY"
    // ));

    // self.add_state(new EndState(
    //         "reg_thanks_district_admin",
    //         "Congratulations! You are now registered as a user of the" +
    //         " Gateway! Please dial in again when you are ready to start" +
    //         " reporting on teacher and learner performance.",
    //         "initial_state",
    //         {
    //             on_enter: function(){
    //                 return self.cms_district_admin_registration(im);
    //             }
    //         }
    //     )
    // );