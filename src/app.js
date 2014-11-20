var vumigo = require('vumigo_v02');
var moment = require('moment');
var _ = require('lodash');
var Q = require('q');
var MetricsHelper = require('go-jsbox-metrics-helper');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;
var JsonApi = vumigo.http.api.JsonApi;


// tip: code fold level 2, then unfold var GoApp, then fold level 3

go.utils = {

    // CMS INTERACTIONS
    // ----------------

    cms_update_school_and_contact: function(result, im, contact) {
        var headteacher_id;
        var headteacher_is_zonal_head;
        var emis;

        var school_data = go.utils.registration_data_school_collect(im);
        if (result.data.objects) {  // if result comes from GET call
            headteacher_id = result.data.objects[0].id;
            headteacher_is_zonal_head = result.data.objects[0].is_zonal_head;
            emis = result.data.objects[0].emis.emis;
        } else {  // if result comes from POST/PUT call
            headteacher_id = result.data.id;
            headteacher_is_zonal_head = result.data.is_zonal_head;
            emis = result.data.emis.emis;
        }

        school_data.created_by = "/api/v1/data/headteacher/" + headteacher_id + "/";
        school_data.emis = "/api/v1/school/emis/" + emis + "/";
        return go.utils
            .cms_post("data/school/", school_data, im)
            .then(function(result) {
                contact.extra.rts_id = headteacher_id.toString();
                contact.extra.rts_emis = emis.toString();
                contact.extra.is_zonal_head = headteacher_is_zonal_head.toString();
                contact.extra.registration_origin = "";
                if (contact.name === null || _.isUndefined(contact.name)) {
                    // only applicable if name has not been saved before i.e. during registration
                    contact.name = im.user.answers.reg_first_name;
                    contact.surname = im.user.answers.reg_surname;
                }
                return im.contacts.save(contact);
            });
    },

    cms_registration: function(im, contact) {
        var headteacher_data;

        if (contact.extra.registration_origin === "manage_change_emis") {
            // Registered head teacher started process with "Change my school"
            headteacher_data = {
                emis: "/api/v1/school/emis/" + parseInt(im.user.answers.manage_change_emis, 10) + "/"
            };
            return go.utils
                .cms_patch("data/headteacher/" + contact.extra.rts_id + "/", headteacher_data, im)
                .then(function(result) {
                    return go.utils.cms_update_school_and_contact(result, im, contact);
                });

        } else if (contact.extra.registration_origin === "manage_update_school_data") {
            // Registered head teacher started process with "Update my school's registration data"
            return go.utils
                .cms_get("data/headteacher/?emis__emis=" + contact.extra.rts_emis, im)
                .then(function(result) {
                    return go.utils.cms_update_school_and_contact(result, im, contact);
                });

        } else {
            // Unregistered head teacher registers for the first time
            headteacher_data = go.utils.registration_data_headteacher_collect(im);
            return go.utils
                .cms_post("data/headteacher/", headteacher_data, im)
                .then(function(result) {
                    return go.utils.cms_update_school_and_contact(result, im, contact);
                });
        }
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

    cms_patch: function(path, data, im) {
        var json_api = new JsonApi(im);
        var url = im.config.cms_api_root + path;
        return json_api.patch(
            url,
            {
                data: data,
                headers:{
                    'Content-Type': ['application/json']
                }
            }
        );
    },

    cms_put: function(path, data, im) {
        var json_api = new JsonApi(im);
        var url = im.config.cms_api_root + path;
        return json_api.put(
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

    check_valid_emis: function(user_emis, im) {
        // returns false if fails to find
         return go.utils
            .cms_get("hierarchy/", im)
            .then(function(result) {
                var numbers_only = new RegExp('^\\d+$');
                if (numbers_only.test(user_emis)) {
                    var array_of_emis = [];
                    for (var i=0; i<result.data.objects.length; i++) {
                        array_of_emis.push(result.data.objects[i].emis);
                    }
                    return array_of_emis.indexOf(parseInt(user_emis, 10)) !== -1;
                } else {
                    return false;
                }
            });
    },

    update_calculated_totals: function(opts, content) {
        // calculate new totals to be passed through to next state as creator_opts
        opts.current_sum = opts.current_sum + parseInt(content, 10);

        if (opts.sum_as_string === "") {
            opts.sum_as_string = content;
        } else {
            opts.sum_as_string = opts.sum_as_string + "+" + content;
        }

        return opts;
    },

    registration_official_admin_collect: function(im) {
        var dob = go.utils.check_and_parse_date(im.user.answers.reg_district_official_dob);

        var district_admin_data = {
            "first_name": im.user.answers.reg_district_official_first_name,
            "last_name": im.user.answers.reg_district_official_surname,
            "date_of_birth": moment(dob).format('YYYY-MM-DD'),
            "district": "/api/v1/district/" + im.user.answers.reg_district_official + "/",
            "id_number": im.user.answers.reg_district_official_id_number
        };
        return district_admin_data;
    },

    registration_data_headteacher_collect: function(im) {
        var dob = go.utils.check_and_parse_date(im.user.answers.reg_date_of_birth);

        var headteacher_data = {
            "first_name": im.user.answers.reg_first_name,
            "last_name": im.user.answers.reg_surname,
            "msisdn": im.user.addr,
            "date_of_birth": moment(dob).format('YYYY-MM-DD'),
            "gender": im.user.answers.reg_gender,
            "emis": "/api/v1/school/emis/" + parseInt(im.user.answers.reg_emis, 10) + "/"
        };

        if (im.user.answers.reg_zonal_head === "reg_zonal_head_name") {
            headteacher_data.zonal_head_name = im.user.answers.reg_zonal_head_name;
            headteacher_data.is_zonal_head = false;
        } else {
            headteacher_data.zonal_head_name = "self";
            headteacher_data.is_zonal_head = true;
        }

        return headteacher_data;
    },

    registration_data_school_collect: function(im) {
        var school_data = {
            "name": im.user.answers.reg_school_name,
            "classrooms": parseInt(im.user.answers.reg_school_classrooms,10),
            "teachers": parseInt(im.user.answers.reg_school_teachers,10),
            "teachers_g1": parseInt(im.user.answers.reg_school_teachers_g1,10),
            "teachers_g2": parseInt(im.user.answers.reg_school_teachers_g2,10),
            "boys_g2": parseInt(im.user.answers.reg_school_students_g2_boys,10),
            "girls_g2": parseInt(im.user.answers.reg_school_students_g2_girls,10),
            "boys": parseInt(im.user.answers.reg_school_boys,10),
            "girls": parseInt(im.user.answers.reg_school_girls,10)
        };

        return school_data;
    },

    performance_data_learner_collect: function(emis, im) {
        var data_boys = {
            "gender": "boys",
            "total_number_pupils": im.user.answers.perf_learner_boys_total,
            "phonetic_awareness": im.user.answers.perf_learner_boys_phonics,
            "vocabulary": im.user.answers.perf_learner_boys_vocab,
            "reading_comprehension": im.user.answers.perf_learner_boys_comprehension,
            "writing_diction": im.user.answers.perf_learner_boys_writing,
            "outstanding_results": im.user.answers.perf_learner_boys_outstanding,
            "desirable_results": im.user.answers.perf_learner_boys_desirable,
            "minimum_results": im.user.answers.perf_learner_boys_minimum,
            "below_minimum_results": im.user.answers.perf_learner_boys_below_minimum,
            "emis": "/api/v1/school/emis/" + emis + "/"
        };

        var data_girls = {
            "gender": "girls",
            "total_number_pupils": im.user.answers.perf_learner_girls_total,
            "phonetic_awareness": im.user.answers.perf_learner_girls_phonics,
            "vocabulary": im.user.answers.perf_learner_girls_vocab,
            "reading_comprehension": im.user.answers.perf_learner_girls_comprehension,
            "writing_diction": im.user.answers.perf_learner_girls_writing,
            "outstanding_results": im.user.answers.perf_learner_girls_outstanding,
            "desirable_results": im.user.answers.perf_learner_girls_desirable,
            "minimum_results": im.user.answers.perf_learner_girls_minimum,
            "below_minimum_results": im.user.answers.perf_learner_girls_below_minimum,
            "emis": "/api/v1/school/emis/" + emis + "/"
        };

        return {boys: data_boys, girls: data_girls};
    },

    performance_data_teacher_collect: function(emis, im) {
        var data = {
            "ts_number": im.user.answers.perf_teacher_ts_number,
            "gender": im.user.answers.perf_teacher_gender,
            "age": im.user.answers.perf_teacher_age,
            "years_experience": im.user.answers.perf_teacher_years_experience,
            "g2_pupils_present": im.user.answers.perf_teacher_g2_pupils_present,
            "g2_pupils_registered": im.user.answers.perf_teacher_g2_pupils_registered,
            "classroom_environment_score": im.user.answers.perf_teacher_classroom_environment_score,
            "t_l_materials": im.user.answers.perf_teacher_t_l_materials,
            "pupils_materials_score": im.user.answers.perf_teacher_pupils_materials_score,
            "pupils_books_number": im.user.answers.perf_teacher_pupils_books_number,
            "reading_lesson": im.user.answers.perf_teacher_reading_lesson,
            "pupil_engagement_score": im.user.answers.perf_teacher_pupil_engagement_score,
            "attitudes_and_beliefs": im.user.answers.perf_teacher_attitudes_and_beliefs,
            "training_subtotal": im.user.answers.perf_teacher_training_subtotal,
            "academic_level": "/api/v1/data/achievement/" +
                                im.user.answers.perf_teacher_academic_level + "/",
            "reading_assessment": im.user.answers.perf_teacher_reading_assessment,
            "reading_total": im.user.answers.perf_teacher_reading_total,
            "emis": "/api/v1/school/emis/" + emis + "/"
        };

        return data;
    },

    school_monitoring_data_collect: function(emis, im) {
        var fields = ["see_lpip", "teaching", "learner_assessment", "learning_materials",
                        "learner_attendance", "reading_time", "struggling_learners",
                        "g2_observation_results", "ht_feedback", "submitted_classroom",
                        "gala_sheets", "summary_worksheet", "feedback_literacy",
                        "submitted_gala", "talking_wall"];
        var data = {};

        for (var field in fields) {
            var field_name = fields[field];
            var state_name = "monitor_school_" + field_name;
            if (!_.isUndefined(im.user.answers[state_name])) {
                data[field_name] = im.user.answers[state_name];
            }
        }

        data.emis = "/api/v1/school/emis/" + emis + "/";

        return data;
    },

    get_province: function(im, contact) {
        path = "school?emis=" + contact.extra.rts_emis;
        return go.utils
            .cms_get(path, im)
            .then(function(result) {
                var contact_province = result.data.objects[0].zone.district.province.name;
                return contact_province;
            });
    },

    fire_province_metrics: function(im, contact) {
        // if contact has no emis we cannot tell which province they're from
        if (_.isUndefined(contact.extra.rts_emis)) {
            return Q();

        // else if province is saved against contact use contact extra
        } else if (!_.isUndefined(contact.extra.province)) {
            var contact_province = contact.extra.province;
            // strip spaces from province name for metric
            contact_province = contact_province.replace(/\s/g,'');
            return im.metrics.fire.inc(['sum', 'sessions', contact_province].join('.'), 1);

        // else look up the province, use that, and save province against their contact for future
        } else {
            return go.utils
                .get_province(im, contact)
                .then(function(contact_province) {
                    contact.extra.province = contact_province;
                    contact_province = contact_province.replace(/\s/g,'');
                    return Q.all([
                        im.contacts.save(contact),
                        im.metrics.fire.inc(['sum', 'sessions', contact_province].join('.'), 1)
                    ]);
                });
        }
    }

};



go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;

    var GoApp = App.extend(function(self) {
        App.call(self, 'initial_state');
        var $ = self.$;

        self.init = function() {
            self.im.setMaxListeners(15);  // increase listener limit
            // Use the metrics helper to add the required metrics
            mh = new MetricsHelper(self.im);
            mh
                // Total unique users
                .add.total_unique_users('sum.unique_users')

                // Total and weekly USSD sessions
                .add.total_sessions('sum.ussd_sessions')

                // Head teacher registrations
                    // Total head teachers added via USSD - zonal heads
                    .add.total_state_actions(
                        {
                            state: 'reg_zonal_head',
                            action: 'exit'
                        },
                        'sum.head_teacher_registrations.ussd'
                    )
                    // Total head teachers added via USSD - non zonal heads
                    .add.total_state_actions(
                        {
                            state: 'reg_zonal_head_name',
                            action: 'exit'
                        },
                        'sum.head_teacher_registrations.ussd'
                    )

                // Learner performance reports
                    // Total learner performance reports added via USSD
                    .add.total_state_actions(
                        {
                            state: 'perf_learner_girls_writing',
                            action: 'exit'
                        },
                        'sum.learner_performance_reports.ussd'
                    )
                    // The above metric is duplicated to align with the django
                    // code, where girls = 1 report, boys = 1 report - 2 total
                    .add.total_state_actions(
                        {
                            state: 'perf_learner_girls_writing',
                            action: 'exit'
                        },
                        'sum.learner_performance_reports.ussd'
                    )

                // Teacher performance reports
                    // Total teacher performance reports added via USSD
                    .add.total_state_actions(
                        {
                            state: 'perf_teacher_reading_total',
                            action: 'exit'
                        },
                        'sum.teacher_performance_reports.ussd'
                    )

                // School monitoring reports
                    // Total school monitoring reports added via USSD - good lpip
                    .add.total_state_actions(
                        {
                            state: 'monitor_school_talking_wall',
                            action: 'exit'
                        },
                        'sum.school_monitoring_reports.ussd'
                    )
                    // Total school monitoring reports added via USSD - poor lpip
                    .add.total_state_actions(
                        {
                            state: 'monitor_school_falling_behind',
                            action: 'enter'
                        },
                        'sum.school_monitoring_reports.ussd'
                    )

                // Average sessions to register
                    // Head teacher (if they register as zonal head)
                    .add.tracker({
                        action: 'enter',
                        state: 'reg_emis'
                    }, {
                        action: 'enter',
                        state: 'reg_thanks_zonal_head'
                    }, {
                        sessions_between_states: 'avg.sessions_reg_ht_zonal_head'
                    })

                    // Head teacher (if they are NOT a zonal head)
                    .add.tracker({
                        action: 'enter',
                        state: 'reg_emis'
                    }, {
                        action: 'enter',
                        state: 'reg_thanks_head_teacher'
                    }, {
                        sessions_between_states: 'avg.sessions_reg_headteacher'
                    })

                    // District official
                    .add.tracker({
                        action: 'enter',
                        state: 'reg_district_official'
                    }, {
                        action: 'enter',
                        state: 'reg_district_official_thanks'
                    }, {
                        sessions_between_states: 'avg.sessions_reg_district_admin'
                    })

                // Average sessions to complete learner performance reports
                    // Does not include adding EMIS for District Admins
                    .add.tracker({
                        action: 'enter',
                        state: 'perf_learner_boys_total'
                    }, {
                        action: 'enter',
                        state: 'perf_learner_completed'
                    }, {
                        sessions_between_states: 'avg.sessions_perf_learner_report'
                    })

                // Average sessions to complete teacher performance reports
                    // Does not include adding EMIS for District Admins
                    .add.tracker({
                        action: 'enter',
                        state: 'perf_teacher_ts_number'
                    }, {
                        action: 'enter',
                        state: 'perf_teacher_completed'
                    }, {
                        sessions_between_states: 'avg.sessions_perf_teacher_report'
                    })

                // Average sessions to complete school monitoring report - school falling behind
                    // Does not include adding EMIS for District Admins
                    .add.tracker({
                        action: 'enter',
                        state: 'monitor_school_see_lpip'
                    }, {
                        action: 'enter',
                        state: 'monitor_school_falling_behind'
                    }, {
                        sessions_between_states: 'avg.sessions_school_monitoring_behind'
                    })

                // Average sessions to complete school monitoring report - complete lpip
                    // Does not include adding EMIS for District Admins
                    .add.tracker({
                        action: 'enter',
                        state: 'monitor_school_see_lpip'
                    }, {
                        action: 'enter',
                        state: 'monitor_school_completed'
                    }, {
                        sessions_between_states: 'avg.sessions_school_monitoring_complete'
                    })

            ;

            // Navigation tracking to measure drop-offs
            self.im.on('state:exit', function(e) {
                return self.im.metrics.fire.inc(['sum', e.state.name, 'exits'].join('.'), 1);
            });

            // Measure sessions per province
            self.im.on('session:new', function(e) {
                return go.utils.fire_province_metrics(self.im, self.contact);
            });

            self.env = self.im.config.env;

            return self.im.contacts
                .for_user()
                .then(function(user_contact) {
                   self.contact = user_contact;
                });
        };


        // INITIAL STATES & END STATE
        // --------------------------

        self.states.add('initial_state', function(name) {
            if (_.isUndefined(self.contact.extra.rts_id)) {
                // user is unregistered if doesn't have rts_id
                return self.states.create('initial_state_unregistered');
            } else if (_.isUndefined(self.contact.extra.rts_official_district_id)
                        && (self.contact.extra.is_zonal_head === 'true')) {
                // is a head teacher and a zonal head
                return self.states.create('initial_state_zonal_head');
            } else if (_.isUndefined(self.contact.extra.rts_official_district_id)) {
                // registered user is head teacher if doesn't have district_id
                return self.states.create('initial_state_head_teacher');
            } else {
                return self.states.create('initial_state_district_official');
            }
        });

        self.states.add('initial_state_unregistered', function(name) {
            return new ChoiceState(name, {
                question: $('Welcome to the Zambia School Gateway! Options:'),

                choices: [
                    new Choice("reg_emis", $("Register as Head Teacher")),
                    new Choice("reg_district_official", $("Register as District Official")),
                    new Choice("manage_change_emis_error", $("Change my school")),
                    new Choice("manage_change_msisdn_emis", $("Change my primary cell number"))
                ],

                next: function(choice) {
                    if (choice.value === 'reg_emis' || choice.value === 'manage_change_msisdn_emis') {
                        return {
                            name: choice.value,
                            creator_opts: {
                                retry: false
                            }
                        };
                    } else {
                        return choice.value;
                    }
                }
            });
        });

        self.states.add('initial_state_district_official', function(name) {
            return new ChoiceState(name, {
                question: $('What would you like to do?'),

                choices: [
                    new Choice("add_emis_perf_teacher_ts_number", $("Report on teacher performance.")),
                    new Choice("add_emis_perf_learner_boys_total", $("Report on learner performance.")),
                    new Choice("add_emis_school_monitoring", $("Report on a school monitoring visit."))
                ],

                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.states.add('initial_state_zonal_head', function(name) {
            return new ChoiceState(name, {
                question: $('Welcome to Zambia School Gateway!'),

                choices: [
                    new Choice("perf_teacher_ts_number", $("Report on teachers")),
                    new Choice("perf_learner_boys_total", $("Report on learners")),
                    new Choice("add_emis_school_monitoring", $("Report on school monitoring visit")),
                    new Choice("manage_change_emis", $("Change my school")),
                    new Choice("manage_update_school_data", $("Update my school data"))
                ],

                next: function(choice) {
                    if (choice.value === "manage_change_emis") {
                        return {
                            name: choice.value,
                            creator_opts: {
                                retry: false
                            }
                        };
                    } else {
                        return choice.value;
                    }
                }
            });
        });

        self.states.add('initial_state_head_teacher', function(name) {
            return new ChoiceState(name, {
                question: $('What would you like to do?'),

                choices: [
                    new Choice("perf_teacher_ts_number", $("Report on teacher performance.")),
                    new Choice("perf_learner_boys_total", $("Report on learner performance.")),
                    new Choice("manage_change_emis", $("Change my school.")),
                    new Choice("manage_update_school_data", $("Update my school's registration data."))
                ],

                next: function(choice) {
                    if (choice.value === "manage_change_emis") {
                        return {
                            name: choice.value,
                            creator_opts: {
                                retry: false
                            }
                        };
                    } else {
                        return choice.value;
                    }
                }
            });
        });

        self.states.add('reg_exit_emis', function(name) {
            return new EndState(name, {
                text: $("We don't recognise your EMIS number. Please send a SMS with" +
                        " the words EMIS ERROR to 739 and your DEST will contact you" +
                        " to resolve the problem."),

                next: "initial_state"
            });
        });

        self.states.add('end_state', function(name) {
            return new EndState(name, {
                text: $("Goodbye! Thank you for using the Gateway."),

                next: "initial_state"
            });
        });



        // CHANGE MANAGEMENT STATES
        // ------------------------

        self.states.add('manage_change_emis_error', function(name) {
            return go.cm.manage_change_emis_error(name, $);
        });

        self.states.add('manage_change_msisdn_emis', function(name, opts) {
            return go.cm.manage_change_msisdn_emis(name, $, opts, self.im);
        });

        self.states.add('manage_change_msisdn_emis_validates', function(name) {
            return go.cm.manage_change_msisdn_emis_validates(name, $);
        });

        self.states.add('manage_change_msisdn_emis_retry_exit', function(name) {
            return go.cm.manage_change_msisdn_emis_retry_exit(name, $);
        });

        self.states.add('manage_change_emis', function(name, opts) {
            return go.cm.manage_change_emis(name, $, opts, self.contact, self.im);
        });

        self.states.add('manage_change_emis_validates', function(name) {
            return go.cm.manage_change_emis_validates(name, $);
        });

        self.states.add('manage_change_emis_retry_exit', function(name) {
            return go.cm.manage_change_emis_retry_exit(name, $);
        });

        self.states.add('manage_update_school_data', function(name) {
            return go.cm.manage_update_school_data(name, $, self.contact, self.im);
        });



        // REGISTER HEAD TEACHER STATES
        // ----------------------------

        self.states.add('reg_emis', function(name, opts) {
            return go.rht.reg_emis(name, $, self.im, opts);
        });

        self.states.add('reg_emis_validates', function(name) {
            return go.rht.reg_emis_validates(name, $);
        });

        self.states.add('reg_emis_retry_exit', function(name) {
            return go.rht.reg_emis_retry_exit(name, $);
        });

        self.states.add('reg_school_name', function(name) {
            return go.rht.reg_school_name(name, $);
        });

        self.states.add('reg_first_name', function(name) {
            return go.rht.reg_first_name(name, $);
        });

        self.states.add('reg_surname', function(name) {
            return go.rht.reg_surname(name, $);
        });

        self.states.add('reg_date_of_birth', function(name) {
            return go.rht.reg_date_of_birth(name, $);
        });

        self.states.add('reg_gender', function(name) {
            return go.rht.reg_gender(name, $);
        });

        self.states.add('reg_school_boys', function(name) {
            return go.rht.reg_school_boys(name, $);
        });

        self.states.add('reg_school_girls', function(name) {
            return go.rht.reg_school_girls(name, $);
        });

        self.states.add('reg_school_classrooms', function(name) {
            return go.rht.reg_school_classrooms(name, $);
        });

        self.states.add('reg_school_teachers', function(name) {
            return go.rht.reg_school_teachers(name, $);
        });

        self.states.add('reg_school_teachers_g1', function(name) {
            return go.rht.reg_school_teachers_g1(name, $);
        });

        self.states.add('reg_school_teachers_g2', function(name) {
            return go.rht.reg_school_teachers_g2(name, $);
        });

        self.states.add('reg_school_students_g2_boys', function(name) {
            return go.rht.reg_school_students_g2_boys(name, $);
        });

        self.states.add('reg_school_students_g2_girls', function(name) {
            return go.rht.reg_school_students_g2_girls(name, $);
        });

        self.states.add('reg_zonal_head', function(name) {
            return go.rht.reg_zonal_head(name, $, self.im, self.contact);
        });

        self.states.add('reg_thanks_zonal_head', function(name) {
            return go.rht.reg_thanks_zonal_head(name, $);
        });

        self.states.add('reg_zonal_head_name', function(name) {
            return go.rht.reg_zonal_head_name(name, $, self.im, self.contact);
        });

        self.states.add('reg_thanks_head_teacher', function(name) {
            return go.rht.reg_thanks_head_teacher(name, $);
        });



        // REGISTER DISTRICT OFFICIAL STATES
        // ---------------------------------

        self.states.add('reg_district_official', function(name) {
            return go.rdo.reg_district_official(name, $, self.im);
        });

        self.states.add('reg_district_official_first_name', function(name) {
            return go.rdo.reg_district_official_first_name(name, $);
        });

        self.states.add('reg_district_official_surname', function(name) {
            return go.rdo.reg_district_official_surname(name, $);
        });

        self.states.add('reg_district_official_id_number', function(name) {
            return go.rdo.reg_district_official_id_number(name, $);
        });

        self.states.add('reg_district_official_dob', function(name) {
            return go.rdo.reg_district_official_dob(name, $, self.im, self.contact);
        });

        self.states.add('reg_district_official_thanks', function(name) {
            return go.rdo.reg_district_official_thanks(name, $);
        });



        // LEARNER PERFORMANCE STATES
        // --------------------------

        self.states.add('add_emis_perf_learner_boys_total', function(name) {
            return go.lp.add_emis_perf_learner_boys_total(name, $, self.contact, self.im);
        });


        self.states.add('perf_learner_boys_total', function(name) {
            return go.lp.perf_learner_boys_total(name, $);
        });

        self.states.add('perf_learner_boys_calc_error', function(name, opts) {
            return go.lp.perf_learner_boys_calc_error(name, $, opts);
        });

        self.states.add('perf_learner_boys_outstanding', function(name, opts) {
            return go.lp.perf_learner_boys_outstanding(name, $, opts);
        });

        self.states.add('perf_learner_boys_desirable', function(name, opts) {
            return go.lp.perf_learner_boys_desirable(name, $, opts);
        });

        self.states.add('perf_learner_boys_minimum', function(name, opts) {
            return go.lp.perf_learner_boys_minimum(name, $, opts);
        });

        self.states.add('perf_learner_boys_below_minimum', function(name, opts) {
            return go.lp.perf_learner_boys_below_minimum(name, $, opts);
        });


        self.states.add('perf_learner_girls_total', function(name) {
            return go.lp.perf_learner_girls_total(name, $);
        });

        self.states.add('perf_learner_girls_calc_error', function(name, opts) {
            return go.lp.perf_learner_girls_calc_error(name, $, opts);
        });

        self.states.add('perf_learner_girls_outstanding', function(name, opts) {
            return go.lp.perf_learner_girls_outstanding(name, $, opts);
        });

        self.states.add('perf_learner_girls_desirable', function(name, opts) {
            return go.lp.perf_learner_girls_desirable(name, $, opts);
        });

        self.states.add('perf_learner_girls_minimum', function(name, opts) {
            return go.lp.perf_learner_girls_minimum(name, $, opts);
        });

        self.states.add('perf_learner_girls_below_minimum', function(name, opts) {
            return go.lp.perf_learner_girls_below_minimum(name, $, opts);
        });


        self.states.add('perf_learner_boys_phonics', function(name) {
            return go.lp.perf_learner_boys_phonics(name, $,
                                                    self.im.user.answers.perf_learner_boys_total);
        });

        self.states.add('perf_learner_girls_phonics', function(name) {
            return go.lp.perf_learner_girls_phonics(name, $,
                                                    self.im.user.answers.perf_learner_girls_total);
        });

        self.states.add('perf_learner_boys_vocab', function(name) {
            return go.lp.perf_learner_boys_vocab(name, $,
                                                    self.im.user.answers.perf_learner_boys_total);
        });

        self.states.add('perf_learner_girls_vocab', function(name) {
            return go.lp.perf_learner_girls_vocab(name, $,
                                                    self.im.user.answers.perf_learner_girls_total);
        });

        self.states.add('perf_learner_boys_comprehension', function(name) {
            return go.lp.perf_learner_boys_comprehension(name, $,
                                                    self.im.user.answers.perf_learner_boys_total);
        });

        self.states.add('perf_learner_girls_comprehension', function(name) {
            return go.lp.perf_learner_girls_comprehension(name, $,
                                                    self.im.user.answers.perf_learner_girls_total);
        });

        self.states.add('perf_learner_boys_writing', function(name) {
            return go.lp.perf_learner_boys_writing(name, $,
                                                    self.im.user.answers.perf_learner_boys_total);
        });

        self.states.add('perf_learner_girls_writing', function(name) {
            return go.lp.perf_learner_girls_writing(name, $,
                                                    self.im.user.answers.perf_learner_girls_total,
                                                    self.contact, self.im);
        });

        self.states.add('perf_learner_completed', function(name) {
            return go.lp.perf_learner_completed(name, $);
        });




        // TEACHER PERFORMANCE STATES
        // --------------------------

        self.states.add('add_emis_perf_teacher_ts_number', function(name) {
            return go.tp.add_emis_perf_teacher_ts_number(name, $, self.contact, self.im);
        });

        self.states.add('perf_teacher_ts_number', function(name) {
            return go.tp.perf_teacher_ts_number(name, $);
        });

        self.states.add('perf_teacher_gender', function(name) {
            return go.tp.perf_teacher_gender(name, $);
        });

        self.states.add('perf_teacher_age', function(name) {
            return go.tp.perf_teacher_age(name, $);
        });

        self.states.add('perf_teacher_academic_level', function(name) {
            return go.tp.perf_teacher_academic_level(name, $);
        });

        self.states.add('perf_teacher_years_experience', function(name) {
            return go.tp.perf_teacher_years_experience(name, $);
        });

        self.states.add('perf_teacher_g2_pupils_present', function(name) {
            return go.tp.perf_teacher_g2_pupils_present(name, $);
        });

        self.states.add('perf_teacher_g2_pupils_registered', function(name) {
            return go.tp.perf_teacher_g2_pupils_registered(name, $);
        });

        self.states.add('perf_teacher_classroom_environment_score', function(name) {
            return go.tp.perf_teacher_classroom_environment_score(name, $);
        });

        self.states.add('perf_teacher_t_l_materials', function(name) {
            return go.tp.perf_teacher_t_l_materials(name, $);
        });

        self.states.add('perf_teacher_pupils_books_number', function(name) {
            return go.tp.perf_teacher_pupils_books_number(name, $);
        });

        self.states.add('perf_teacher_pupils_materials_score', function(name) {
            return go.tp.perf_teacher_pupils_materials_score(name, $);
        });

        self.states.add('perf_teacher_reading_lesson', function(name) {
            return go.tp.perf_teacher_reading_lesson(name, $);
        });

        self.states.add('perf_teacher_pupil_engagement_score', function(name) {
            return go.tp.perf_teacher_pupil_engagement_score(name, $);
        });

        self.states.add('perf_teacher_attitudes_and_beliefs', function(name) {
            return go.tp.perf_teacher_attitudes_and_beliefs(name, $);
        });

        self.states.add('perf_teacher_training_subtotal', function(name) {
            return go.tp.perf_teacher_training_subtotal(name, $);
        });

        self.states.add('perf_teacher_reading_assessment', function(name) {
            return go.tp.perf_teacher_reading_assessment(name, $);
        });

        self.states.add('perf_teacher_reading_total', function(name) {
            return go.tp.perf_teacher_reading_total(name, $, self.contact, self.im);
        });

        self.states.add('perf_teacher_completed', function(name) {
            return go.tp.perf_teacher_completed(name, $);
        });



        // SCHOOL MONITORING STATES
        // --------------------------

        self.states.add('add_emis_school_monitoring', function(name) {
            return go.sp.add_emis_school_monitoring(name, $, self.contact,
                                                        self.im);
        });

        self.states.add('monitor_school_visit_complete', function(name) {
            return go.sp.monitor_school_visit_complete(name, $);
        });

        self.states.add('monitor_school_see_lpip', function(name) {
            return go.sp.monitor_school_see_lpip(name, $);
        });

        self.states.add('monitor_school_teaching', function(name) {
            return go.sp.monitor_school_teaching(name, $);
        });

        self.states.add('monitor_school_learner_assessment', function(name) {
            return go.sp.monitor_school_learner_assessment(name, $);
        });

        self.states.add('monitor_school_learning_materials', function(name) {
            return go.sp.monitor_school_learning_materials(name, $);
        });

        self.states.add('monitor_school_learner_attendance', function(name) {
            return go.sp.monitor_school_learner_attendance(name, $);
        });

        self.states.add('monitor_school_reading_time', function(name) {
            return go.sp.monitor_school_reading_time(name, $);
        });

        self.states.add('monitor_school_struggling_learners', function(name) {
            return go.sp.monitor_school_struggling_learners(name, $);
        });

        self.states.add('monitor_school_g2_observation_results', function(name) {
            return go.sp.monitor_school_g2_observation_results(name, $);
        });

        self.states.add('monitor_school_ht_feedback', function(name) {
            return go.sp.monitor_school_ht_feedback(name, $);
        });

        self.states.add('monitor_school_submitted_classroom', function(name) {
            return go.sp.monitor_school_submitted_classroom(name, $);
        });

        self.states.add('monitor_school_gala_sheets', function(name) {
            return go.sp.monitor_school_gala_sheets(name, $, self.im, self.contact);
        });

        self.states.add('monitor_school_summary_worksheet', function(name) {
            return go.sp.monitor_school_summary_worksheet(name, $);
        });

        self.states.add('monitor_school_ht_feedback_literacy', function(name) {
            return go.sp.monitor_school_ht_feedback_literacy(name, $);
        });

        self.states.add('monitor_school_submitted_gala', function(name) {
            return go.sp.monitor_school_submitted_gala(name, $);
        });

        self.states.add('monitor_school_talking_wall', function(name) {
            return go.sp.monitor_school_talking_wall(name, $, self.im, self.contact);
        });

        self.states.add('monitor_school_completed', function(name) {
            return go.sp.monitor_school_completed(name, $);
        });

        self.states.add('monitor_school_falling_behind', function(name) {
            return go.sp.monitor_school_falling_behind(name, $);
        });

    });

    return {
        GoApp: GoApp
    };
}();
