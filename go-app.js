// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.rht = {
    // Registration of Head Teacher States

    state_rht_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_rht_exit';
                } else {
                    return 'state_rht_exit';
                }
            }
        });
    },

    state_rht_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_rht_start'
        });
    }

};

var vumigo = require('vumigo_v02');
var FreeText = vumigo.states.FreeText;
var EndState = vumigo.states.EndState;
var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
var Choice = vumigo.states.Choice;


go.rdo = {
    // Registration of District Official States

    reg_district_official: function(name, districts) {
        var choices = [];

        for (var i=0; i<districts.inspect().value.length; i++) {
            var district = districts.inspect().value[i];
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

    reg_district_official_dob: function(name, im, contact) {
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

            next: function() {
                return go.utils
                    .cms_district_admin_registration(im, contact)
                    .then(function() {
                        return "reg_district_official_thanks";
                    });
            }
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

var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.cm = {
    // Registration of Head Teacher States

    state_cm_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_cm_exit';
                } else {
                    return 'state_cm_exit';
                }
            }
        });
    },

    state_cm_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_cm_start'
        });
    }

};

var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.lp = {
    // LearnerPerformance States

    state_lp_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_lp_next';
                } else {
                    return 'state_lp_exit';
                }
            }
        });
    },

    state_lp_next: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('to_tp', 'Switch to TeacherPerformance'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'to_tp') {
                    return 'state_tp_start'; // Switch to TP
                } else {
                    return 'state_lp_exit';
                }
            }
        });
    },

    state_lp_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_lp_start'
        });
    }

};

var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.tp = {
    // TeacherPerformance States

    state_tp_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_tp_next';
                } else {
                    return 'state_tp_exit';
                }
            }
        });
    },

    state_tp_next: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('again', 'Back to beginning'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'again') {
                    return 'state_tp_start';
                } else {
                    return 'state_tp_exit';
                }
            }
        });
    },

    state_tp_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_tp_start'
        });
    }

};

var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.sp = {
    // LearnerPerformance States

    state_sp_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_sp_next';
                } else {
                    return 'state_sp_exit';
                }
            }
        });
    },

    state_sp_next: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('to_tp', 'Switch to TeacherPerformance'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'to_tp') {
                    return 'state_tp_start'; // Switch to TP
                } else {
                    return 'state_sp_exit';
                }
            }
        });
    },

    state_sp_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_sp_start'
        });
    }

};

var vumigo = require('vumigo_v02');
var moment = require('moment');
var ChoiceState = vumigo.states.ChoiceState;
var Choice = vumigo.states.Choice;
var JsonApi = vumigo.http.api.JsonApi;


go.utils = {

    // CMS INTERACTIONS
    // ----------------

    cms_district_load: function (im) {
        return go.utils
            .cms_get("district/", im)
            .then(function(result) {
                parsed_result = JSON.parse(result.body);
                var districts = (parsed_result.objects);
                districts.sort(
                    function(a, b) {
                        return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));
                    }
                );
                return districts;
            });
    },

    cms_district_admin_registration: function(im, contact) {
        var district_official_data = go.utils.registration_official_admin_collect(im);
        return go.utils
            .cms_post("district_admin/", district_official_data, im)
            .then(function(result) {
                parsed_result = JSON.parse(result.body);
                contact.extra.rts_id = parsed_result.id.toString();
                contact.extra.rts_district_official_id_number = parsed_result.id_number;
                contact.extra.rts_official_district_id = parsed_result.district.id.toString();
                contact.name = district_official_data.first_name;
                contact.surname = district_official_data.last_name;
                return im.contacts.save(contact);
            });

    },


    // SHARED HELPERS
    // --------------

    cms_get: function(path, im) {
        var json_api = new JsonApi(im);
        var url = im.config.cms_api_root + path;
        return json_api.get(url);
    },

    cms_post: function(path, data, im) {
        var json_api = new JsonApi(im);
        var url = im.config.cms_api_root + path;
        return json_api.post(
            url, 
            {
                data: data, 
                headers:{
                    'Content-Type': ['application/json']
                }
            }
        );
    },

    array_parse_ints: function(target){
        // returns false if fails to parse
        for (var i = 0; i < target.length; i++) {
            target[i] = parseInt(target[i],10);
            if (isNaN(target[i])) return false;
        }
        return target;
    },

    check_and_parse_date: function(date_string){
        // an opinionated data parser - expects "DDMMYYYY"
        // returns false if fails to parse
        if (date_string.length != 8) return false;
        var da = [date_string.slice(0,2)];
        da.push(date_string.slice(2,4));
        da.push(date_string.slice(4));
        da = go.utils.array_parse_ints(da);
        if (da && da[0]<=31 && da[1] <= 12){
            da[1] = da[1]-1; // JS dates are 0-bound
            return new Date(da[2], da[1], da[0]);
        } else {
            return false;
        }
    },

    registration_official_admin_collect: function(im) {
        var dob = go.utils.check_and_parse_date(im.user.answers.reg_district_official_dob);

        var district_admin_data = {
            "first_name": im.user.answers.reg_district_official_first_name,
            "last_name": im.user.answers.reg_district_official_surname,
            "date_of_birth": moment(dob).format('YYYY-MM-DD'),
            "district": "/api/v1/district/" + im.user.answers.reg_district_official +"/",
            "id_number": im.user.answers.reg_district_official_id_number
        };
        return district_admin_data;
    }

};



go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;

    var GoApp = App.extend(function(self) {
        App.call(self, 'initial_state');

        self.init = function() {
            self.env = self.im.config.env;
            self.districts = go.utils.cms_district_load(self.im);
            
            return self.im.contacts
                .for_user()
                .then(function(user_contact) {
                   self.contact = user_contact;
                });
        };


        // INITIAL STATE
        // -------------

        self.states.add('initial_state', function(name) {
            return new ChoiceState(name, {
                question: 'Welcome to the Zambia School Gateway! Options:',

                choices: [
                    new Choice("reg_emis", "Register as Head Teacher"),
                    new Choice("reg_district_official", "Register as District Official"),
                    new Choice("manage_change_emis_error", "Change my school"),
                    new Choice("manage_change_msisdn_emis", "Change my primary cell number")
                ],

                next: function(choice) {
                    return choice.value;
                }
                });
        });



        // REGISTER HEAD TEACHER STATES
        // ----------------------------

        self.states.add('state_rht_start', function(name) {
            return go.rht.state_rht_start(name);
        });

        self.states.add('state_rht_exit', function(name) {
            return go.rht.state_rht_exit(name);
        });



        // REGISTER DISTRICT OFFICIAL STATES
        // ---------------------------------

        self.states.add('reg_district_official', function(name) {
            return go.rdo.reg_district_official(name, self.districts);
        });

        self.states.add('reg_district_official_first_name', function(name) {
            return go.rdo.reg_district_official_first_name(name);
        });

        self.states.add('reg_district_official_surname', function(name) {
            return go.rdo.reg_district_official_surname(name);
        });

        self.states.add('reg_district_official_id_number', function(name) {
            return go.rdo.reg_district_official_id_number(name);
        });

        self.states.add('reg_district_official_dob', function(name) {
            return go.rdo.reg_district_official_dob(name, self.im, self.contact);
        });

        self.states.add('reg_district_official_thanks', function(name) {
            return go.rdo.reg_district_official_thanks(name);
        });


        // CHANGE MANAGEMENT STATES
        // ------------------------

        self.states.add('state_cm_start', function(name) {
            return go.cm.state_cm_start(name);
        });

        self.states.add('state_cm_exit', function(name) {
            return go.cm.state_cm_exit(name);
        });



        // LEARNER PERFORMANCE STATES
        // --------------------------

        self.states.add('state_lp_start', function(name) {
            return go.lp.state_lp_start(name);
        });

        self.states.add('state_lp_next', function(name) {
            return go.lp.state_lp_next(name);
        });

        self.states.add('state_lp_exit', function(name) {
            return go.lp.state_lp_exit(name);
        });



        // TEACHER PERFORMANCE STATES
        // --------------------------

        self.states.add('state_tp_start', function(name) {
            return go.tp.state_tp_start(name);
        });

        self.states.add('state_tp_next', function(name) {
            return go.tp.state_tp_next(name);
        });

        self.states.add('state_tp_exit', function(name) {
            return go.tp.state_tp_exit(name);
        });



        // SCHOOL PERFORMANCE STATES
        // --------------------------

        self.states.add('state_sp_start', function(name) {
            return go.sp.state_sp_start(name);
        });

        self.states.add('state_sp_next', function(name) {
            return go.sp.state_sp_next(name);
        });

        self.states.add('state_sp_exit', function(name) {
            return go.sp.state_sp_exit(name);
        });

    });

    return {
        GoApp: GoApp
    };
}();

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoApp = go.app.GoApp;


    return {
        im: new InteractionMachine(api, new GoApp())
    };
}();
