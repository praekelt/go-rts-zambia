var vumigo = require('vumigo_v02');
var moment = require('moment');
// var _ = require('lodash');
var ChoiceState = vumigo.states.ChoiceState;
var Choice = vumigo.states.Choice;
var JsonApi = vumigo.http.api.JsonApi;


go.utils = {

    // CMS INTERACTIONS
    // ----------------

    cms_district_load: function(im) {
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

    cms_emis_load: function(im) {
        return go.utils
            .cms_get("hierarchy/", im)
            .then(function(result) {
                parsed_result = JSON.parse(result.body);
                var array_emis = [];
                for (var i=0; i<parsed_result.objects.length; i++) {
                    array_emis.push(parsed_result.objects[i].emis);
                }
                return array_emis;
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

    check_valid_number: function(input) {
        // an attempt to solve the insanity of JavaScript numbers
        var numbers_only = new RegExp('^\\d+$');
        if (input !== '' && numbers_only.test(input) && !Number.isNaN(Number(input))){
            return true;
        } else {
            return false;
        }
    },

    check_valid_emis: function(user_emis, array_emis) {
        // returns false if fails to find
        var numbers_only = new RegExp('^\\d+$');
        if (numbers_only.test(user_emis)) {
            return array_emis.inspect().value.indexOf(parseInt(user_emis, 10)) != -1;
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
            self.array_emis = go.utils.cms_emis_load(self.im);
            
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
                    if (choice.value != 'reg_emis') {
                        return choice.value;
                    } else {
                        return {
                            name: 'reg_emis',
                            creator_opts: {
                                retry: false
                            }
                        };
                    }
                }
                });
        });



        // REGISTER HEAD TEACHER STATES
        // ----------------------------

        self.states.add('reg_emis', function(name, opts) {
            return go.rht.reg_emis(name, self.array_emis, opts);
        });

        self.states.add('reg_emis_validates', function(name) {
            return go.rht.reg_emis_validates(name);
        });

        self.states.add('reg_emis_retry_exit', function(name) {
            return go.rht.reg_emis_retry_exit(name);
        });

        self.states.add('reg_exit_emis', function(name) {
            return go.rht.reg_exit_emis(name);
        });

        self.states.add('reg_school_name', function(name) {
            return go.rht.reg_school_name(name);
        });

        self.states.add('reg_first_name', function(name) {
            return go.rht.reg_first_name(name);
        });

        self.states.add('reg_surname', function(name) {
            return go.rht.reg_surname(name);
        });

        self.states.add('reg_date_of_birth', function(name) {
            return go.rht.reg_date_of_birth(name);
        });

        self.states.add('reg_gender', function(name) {
            return go.rht.reg_gender(name);
        });

        self.states.add('reg_school_boys', function(name) {
            return go.rht.reg_school_boys(name);
        });

        self.states.add('reg_school_girls', function(name) {
            return go.rht.reg_school_girls(name);
        });

        self.states.add('reg_school_classrooms', function(name) {
            return go.rht.reg_school_classrooms(name);
        });

        self.states.add('reg_school_teachers', function(name) {
            return go.rht.reg_school_teachers(name);
        });

        self.states.add('reg_school_teachers_g1', function(name) {
            return go.rht.reg_school_teachers_g1(name);
        });

        self.states.add('reg_school_teachers_g2', function(name) {
            return go.rht.reg_school_teachers_g2(name);
        });

        self.states.add('reg_school_students_g2_boys', function(name) {
            return go.rht.reg_school_students_g2_boys(name);
        });

        self.states.add('reg_school_students_g2_girls', function(name) {
            return go.rht.reg_school_students_g2_girls(name);
        });

        self.states.add('reg_zonal_head', function(name) {
            return go.rht.reg_zonal_head(name);
        });

        self.states.add('reg_thanks_zonal_head', function(name) {
            return go.rht.reg_thanks_zonal_head(name);
        });

        self.states.add('reg_zonal_head_name', function(name) {
            return go.rht.reg_zonal_head_name(name);
        });

        self.states.add('reg_thanks_head_teacher', function(name) {
            return go.rht.reg_thanks_head_teacher(name);
        });        



        // REGISTER DISTRICT OFFICIAL STATES
        // ---------------------------------

        self.states.add('reg_district_official', function(name) {
            return go.rdo.reg_district_official(name, self.im, self.districts);
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
