// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

go.rht = function() {
    var vumigo = require('vumigo_v02');
    var FreeText = vumigo.states.FreeText;
    var EndState = vumigo.states.EndState;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;


    var rht = {
        // Registration of Head Teacher States

        reg_emis: function(name, $, array_emis, opts) {
            return new FreeText(name, {
                question: 
                    $("Please enter your school's EMIS number. " +
                    "This should have 4-6 digits e.g. 4351."),

                next: function(content) {
                    if (go.utils.check_valid_emis(content, array_emis)) {
                        return "reg_emis_validates";
                    } else if (opts.retry === false) {
                        return "reg_emis_retry_exit";
                    } else if (opts.retry === true) {
                        return "reg_exit_emis";
                    }
                }
            });
        },

        reg_emis_validates: function(name, $) {
            return new ChoiceState(name, {
                question: 
                    $("Thanks for claiming this EMIS. Redial this number if you ever " +
                    "change cellphone number to reclaim the EMIS and continue to receive " +
                    "SMS updates."),

                choices: [
                    new Choice('continue', $("Continue"))
                ],

                next: "reg_school_name"
            });
        },

        reg_emis_retry_exit: function(name, $) {
            return new ChoiceState(name, {
                question: $("There is a problem with the EMIS number you have entered."),

                choices: [
                    new Choice('retry', $("Try again")),
                    new Choice('exit', $("Exit"))
                ],

                next: function(content) {
                    if (content.value === 'retry') {
                        return {
                            name: "reg_emis",
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

        reg_exit_emis: function(name, $) {
            return new EndState(name, {
                text: $("We don't recognise your EMIS number. Please send a SMS with" +
                        " the words EMIS ERROR to 739 and your DEST will contact you" +
                        " to resolve the problem."),

                next: "initial_state"
            });
        },

        reg_school_name: function(name, $) {
            return new FreeText(name, {
                question: $("Please enter the name of your school, e.g. Kapililonga"),

                next: "reg_first_name"
            });
        },

        reg_first_name: function(name, $) {
            return new FreeText(name, {
                question: $("Please enter your FIRST name."),

                next: "reg_surname"
            });
        },

        reg_surname: function(name, $) {
            return new FreeText(name, {
                question: $("Please enter your SURNAME."),

                next: "reg_date_of_birth"
            });
        },

        reg_date_of_birth: function(name, $) {
            var error = $("Please enter your date of birth formatted DDMMYYYY");

            var question = $("Please enter your date of birth. Start with the day, followed by " +
                            "the month and year, e.g. 27111980");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_and_parse_date(content) === false) {
                        return error;
                    }
                },

                next: "reg_gender"
            });
        },

        reg_gender: function(name, $) {
            return new ChoiceState(name, {
                question: $("What is your gender?"),

                choices: [
                    new Choice('female', $('Female')),
                    new Choice('male', $('Male'))
                ],

                next: "reg_school_boys"
            });
        },

        reg_school_boys: function(name, $) {
            var question = $("How many boys do you have in your school?");

            var error = $("Please provide a number value for how many boys you have in your school.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_girls"
            });
        },

        reg_school_girls: function(name, $) {
            var question = $("How many girls do you have in your school?");

            var error = $("Please provide a number value for how many girls you have in your school.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_classrooms"
            });
        },

        reg_school_classrooms: function(name, $) {
            var question = $("How many classrooms do you have in your school?");

            var error = $("Please provide a number value for how many classrooms you have in your school");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_teachers"
            });
        },

        reg_school_teachers: function(name, $) {
            var question = $("How many teachers are presently working in your school, " +
                            "including the head teacher?");

            var error = $("Please provide a number value for how many teachers in total you have " +
                        "in your school.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_teachers_g1"
            });
        },

        reg_school_teachers_g1: function(name, $) {
            var question = $("How many teachers teach Grade 1 local language?");

            var error = $("Please provide a number value for how many teachers teach G1 local " +
                        "language literacy.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_teachers_g2"
            });
        },

        reg_school_teachers_g2: function(name, $) {
            var question = $("How many teachers teach Grade 2 local language?");

            var error = $("Please provide a number value for how many teachers teach G2 local" +
                        " language literacy.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_students_g2_boys"
            });
        },

        reg_school_students_g2_boys: function(name, $) {
            var question = $("How many boys are ENROLLED in Grade 2 at your school?");

            var error = $("Please provide a number value for the total number of G2 boys enrolled.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_school_students_g2_girls"
            });
        },

        reg_school_students_g2_girls: function(name, $) {
            var question = $("How many girls are ENROLLED in Grade 2 at your school?");

            var error = $("Please provide a number value for the total number of G2 girls enrolled.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!go.utils.check_valid_number(content)) {
                        return error;
                    }
                },

                next: "reg_zonal_head"
            });
        },

        reg_zonal_head: function(name, $, im, contact) {
            return new ChoiceState(name, {
                question: $("Are you a Zonal Head Teacher?"),

                choices: [
                    new Choice('reg_thanks_zonal_head', $('Yes')),
                    new Choice('reg_zonal_head_name', $('No'))
                ],

                next: function(choice) {
                    if (choice.value === 'reg_thanks_zonal_head') {
                        var headteacher_data = go.utils.registration_data_headteacher_collect(im);

                        return go.utils
                            .cms_post("data/headteacher/", headteacher_data, im)
                            .then(function(result) {
                                return go.utils
                                    .cms_update_school_and_contact(result, im, contact)
                                    .then(function() {
                                        return choice.value;
                                    });
                            });
                    } else {
                        return choice.value;
                    }
                }
            });
        },

        reg_thanks_zonal_head: function(name, $) {
            return new EndState(name, {
                text:
                    $("Well done! You are now registered as a Zonal Head " +
                    "Teacher. When you are ready, dial in to start " +
                    "reporting. You will also receive monthly SMS's from " +
                    "your zone."),

                next: "initial_state"
            });
        },

        reg_zonal_head_name: function(name, $, im, contact) {
            return new FreeText(name, {
                question: $("Please enter the name and surname of your ZONAL HEAD TEACHER."),

                next: function() {
                    var headteacher_data = go.utils.registration_data_headteacher_collect(im);
                    return go.utils
                        .cms_post("data/headteacher/", headteacher_data, im)
                            .then(function(result) {
                                return go.utils
                                    .cms_update_school_and_contact(result, im, contact)
                                    .then(function() {
                                        return "reg_thanks_head_teacher";
                                    });
                            });
                }
            });
        },

        reg_thanks_head_teacher: function(name, $) {
            return new EndState(name, {
                text:
                    $("Congratulations! You are now registered as a user of " +
                    "the Gateway! Please dial in again when you are ready to " +
                    "start reporting on teacher and learner performance."),

                next: "initial_state"
            });
        }

    };

    return rht;

}();

// tip: code fold level 3

go.rdo = function() {
    var vumigo = require('vumigo_v02');
    var FreeText = vumigo.states.FreeText;
    var EndState = vumigo.states.EndState;
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
    var Choice = vumigo.states.Choice;


    var rdo = {
        // Registration of District Official States

        reg_district_official: function(name, $, districts) {
            var choices = [];

            for (var i=0; i<districts.inspect().value.length; i++) {
                var district = districts.inspect().value[i];
                choices[i] = new Choice(district.id, district.name);
            }

            return new PaginatedChoiceState(name, {
                question: $("Please enter your district name."),

                choices: choices,

                options_per_page: 8,

                next: 'reg_district_official_first_name'
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
                    if (go.utils.check_and_parse_date(content) === false) {
                        return error;
                    }
                },

                next: function() {
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

go.cm = function() {

    var vumigo = require('vumigo_v02');
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var Choice = vumigo.states.Choice;


    var cm = {
        // Registration of Change Management States

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

    return cm;

}();

go.lp = function() {

    var vumigo = require('vumigo_v02');
    var _ = require('lodash');
    var FreeText = vumigo.states.FreeText;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;


    var lp = {
        // LearnerPerformance States

        add_emis_perf_learner_boys_total: function(name, $, array_emis, contact, im) {
            var error = $("The emis does not exist, please try again. " +
                        "This should have 4-6 digits e.g 4351.");

            var question = $("Please enter the school's EMIS number that you would " +
                            "like to report on. This should have 4-6 digits e.g 4351.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_emis(content, array_emis) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    contact.extra.rts_emis = content;
                    return im.contacts
                        .save(contact)
                        .then(function() {
                            return "perf_learner_boys_total";
                        });
                }

            });
        },

        perf_learner_boys_total: function(name, $) {
            var error = $("Please provide a number value for total boys assessed.");

            var question = $("How many boys took part in the learner assessment?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    return {
                        name: 'perf_learner_boys_outstanding',
                        creator_opts: {
                            target_sum: parseInt(content, 10),
                            sum_as_string: "",
                            current_sum: 0
                        }
                    };
                }
            });
        },

        perf_learner_boys_calc_error: function(name, $, opts) {
            return new ChoiceState(name, {
                question: 
                    $("You've entered results for {{ current_sum }} boys ({{ sum_as_string }}), " +
                        "but you initially indicated {{ target_sum }} boys participants. Please " +
                        "try again.")
                    .context({
                        current_sum: opts.current_sum,
                        sum_as_string: opts.sum_as_string,
                        target_sum: opts.target_sum
                    }),

                choices: [
                    new Choice('continue', $('Continue'))
                ],

                next: 'perf_learner_boys_total'
            });
        },

        perf_learner_boys_outstanding: function(name, $, opts) {
            var error = $("Please provide a valid number value " +
                        "for total boys achieving 16 out of 20 or more.");

            var question = $("In total, how many boys achieved 16 out of 20 or more?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum > opts.target_sum) {
                        return {
                            name: 'perf_learner_boys_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_boys_desirable',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_boys_desirable: function(name, $, opts) {
            var error = $("Please provide a valid number value for total boys achieving " + 
                        "between 12 and 15 out of 20.");

            var question = $("In total, how many boys achieved between 12 and 15 out of 20?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum > opts.target_sum) {
                        return {
                            name: 'perf_learner_boys_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_boys_minimum',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_boys_minimum: function(name, $, opts) {
            var error = $("Please provide a valid number value for total boys achieving " + 
                        "between 8 and 11 out of 20.");

            var question = $("In total, how many boys achieved between 8 and 11 out of 20?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum > opts.target_sum) {
                        return {
                            name: 'perf_learner_boys_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_boys_below_minimum',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_boys_below_minimum: function(name, $, opts) {
            var error = $("Please provide a valid number value for total boys achieving " + 
                        "between 0 and 7 out of 20.");

            var question = $("In total, how many boys achieved between 0 and 7 out of 20?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum !== opts.target_sum) {
                        return {
                            name: 'perf_learner_boys_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_girls_total',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_girls_total: function(name, $) {
            var error = $("Please provide a number value for total girls assessed.");

            var question = $("How many girls took part in the learner assessment?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    return {
                        name: 'perf_learner_girls_outstanding',
                        creator_opts: {
                            target_sum: parseInt(content, 10),
                            sum_as_string: "",
                            current_sum: 0
                        }
                    };
                }
            });
        },

        perf_learner_girls_calc_error: function(name, $, opts) {
            return new ChoiceState(name, {
                question: 
                    $("You've entered results for {{ current_sum }} girls ({{ sum_as_string }}), " +
                        "but you initially indicated {{ target_sum }} girls participants. Please " +
                        "try again.")
                    .context({
                        current_sum: opts.current_sum,
                        sum_as_string: opts.sum_as_string,
                        target_sum: opts.target_sum
                    }),

                choices: [
                    new Choice('continue', $('Continue'))
                ],

                next: 'perf_learner_girls_total'
            });
        },

        perf_learner_girls_outstanding: function(name, $, opts) {
            var error = $("Please provide a valid number value " +
                        "for total girls achieving 16 out of 20 or more.");

            var question = $("In total, how many girls achieved 16 out of 20 or more?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum > opts.target_sum) {
                        return {
                            name: 'perf_learner_girls_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_girls_desirable',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_girls_desirable: function(name, $, opts) {
            var error = $("Please provide a valid number value for total girls achieving " + 
                        "between 12 and 15 out of 20.");

            var question = $("In total, how many girls achieved between 12 and 15 out of 20?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum > opts.target_sum) {
                        return {
                            name: 'perf_learner_girls_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_girls_minimum',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_girls_minimum: function(name, $, opts) {
            var error = $("Please provide a valid number value for total girls achieving " + 
                        "between 8 and 11 out of 20.");

            var question = $("In total, how many girls achieved between 8 and 11 out of 20?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum > opts.target_sum) {
                        return {
                            name: 'perf_learner_girls_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_girls_below_minimum',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_girls_below_minimum: function(name, $, opts) {
            var error = $("Please provide a valid number value for total girls achieving " + 
                        "between 0 and 7 out of 20.");

            var question = $("In total, how many girls achieved between 0 and 7 out of 20?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    opts = go.utils.update_calculated_totals(opts, content);

                    if (opts.current_sum !== opts.target_sum) {
                        return {
                            name: 'perf_learner_girls_calc_error',
                            creator_opts: opts
                        };
                    } else {
                        return {
                            name: 'perf_learner_boys_phonics',
                            creator_opts: opts
                        };
                    }
                }
            });
        },

        perf_learner_boys_phonics: function(name, $, boys_total) {
            var error = $("Please provide a valid number value for total boys scoring 4 or more" +
                        " correctly out of 6 for Phonics and Phonemic Awareness.");

            var question = $("How many boys scored 4 or more correctly out of 6 for Section " +
                            "1 (Phonics and Phonemic Awareness)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(boys_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_girls_phonics'
            });
        },

        perf_learner_girls_phonics: function(name, $, girls_total) {
            var error = $("Please provide a valid number value for total girls scoring 4 or more" +
                        " correctly out of 6 for Phonics and Phonemic Awareness.");

            var question = $("How many girls scored 4 or more correctly out of 6 for Section " +
                            "1 (Phonics and Phonemic Awareness)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(girls_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_boys_vocab'
            });
        },

        perf_learner_boys_vocab: function(name, $, boys_total) {
            var error = $("Please provide a valid number value for boys scoring 3 or more " +
                        "correctly out of 6 for Vocabulary.");

            var question = $("How many boys scored 3 or more correctly out of 6 for Section 2 " +
                            "(Vocabulary)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(boys_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_girls_vocab'
            });
        },

        perf_learner_girls_vocab: function(name, $, girls_total) {
            var error = $("Please provide a valid number value for girls scoring 3 or more " +
                        "correctly out of 6 for Vocabulary.");

            var question = $("How many girls scored 3 or more correctly out of 6 for Section 2 " +
                            "(Vocabulary)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(girls_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_boys_comprehension'
            });
        },

        perf_learner_boys_comprehension: function(name, $, boys_total) {
            var error = $("Please provide a valid number value for boys scoring 2 or more " +
                        "correctly out of 4 for Comprehension.");

            var question = $("How many boys scored 2 or more correctly out of 4 for Section 3 " +
                            "(Comprehension)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(boys_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_girls_comprehension'
            });
        },

        perf_learner_girls_comprehension: function(name, $, girls_total) {
            var error = $("Please provide a valid number value for girls scoring 2 or more " +
                        "correctly out of 4 for Comprehension.");

            var question = $("How many girls scored 2 or more correctly out of 4 for Section 3 " +
                            "(Comprehension)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(girls_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_boys_writing'
            });
        },

        perf_learner_boys_writing: function(name, $, boys_total) {
            var error = $("Please provide a valid number value for total boys achieving 2 out" +
                        " of 4 correct answers for Writing.");

            var question = $("How many boys scored 2 or more correctly out of 4 for Section 4 " +
                            "(Writing)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(boys_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: 'perf_learner_girls_writing'
            });
        },

        perf_learner_girls_writing: function(name, $, girls_total, contact, im) {
            var error = $("Please provide a valid number value for total girls achieving 2 out" +
                        " of 4 correct answers for Writing.");

            var question = $("How many girls scored 2 or more correctly out of 4 for Section 4 " +
                            "(Writing)?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if ((go.utils.check_valid_number(content) === false) || 
                            (parseInt(girls_total, 10) < parseInt(content, 10))) {
                        return error;
                    }
                },

                next: function() {
                    var emis = contact.extra.rts_emis;
                    var id = contact.extra.rts_id;
                    var data = go.utils.performance_data_learner_collect(emis, im);

                    if (_.isUndefined(contact.extra.rts_official_district_id)) {
                        // is head teacher
                        data.boys.created_by = "/api/v1/data/headteacher/" + id + "/";
                        data.girls.created_by = "/api/v1/data/headteacher/" + id + "/";
                    } else {
                        // is district admin
                        data.boys.created_by_da = "/api/v1/district_admin/" + id + "/";
                        data.girls.created_by_da = "/api/v1/district_admin/" + id + "/";
                    }

                    return go.utils
                        .cms_post("data/learnerperformance/", data.boys, im)
                        .then(function() {
                            return go.utils
                                .cms_post("data/learnerperformance/", data.girls, im)
                                .then(function() {
                                    return 'perf_learner_completed';
                                });
                        });
                }
            });
        },

        perf_learner_completed: function(name, $) {
            return new ChoiceState(name, {
                question: $("Congratulations. You have finished reporting on the learner assessment."),

                choices: [
                    new Choice('initial_state', $('Go back to the main menu.')),
                    new Choice('end_state', $('Exit.'))
                ],

                next: function(choice) {
                    return choice.value;
                }
            });
        },


        'commas': 'commas'

    };

    return lp;

}();

go.tp = function() {
    var vumigo = require('vumigo_v02');
    var _ = require('lodash');
    var FreeText = vumigo.states.FreeText;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;


    var tp = {
        // TeacherPerformance States

        add_emis_perf_teacher_ts_number: function(name, $, array_emis, contact, im) {
            var error = $("The emis does not exist, please try again. " +
                        "This should have 4-6 digits e.g 4351.");

            var question = $("Please enter the school's EMIS number that you would " +
                            "like to report on. This should have 4-6 digits e.g 4351.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_emis(content, array_emis) === false) {
                        return error;
                    }
                },

                next: function(content) {
                    contact.extra.rts_emis = content;
                    return im.contacts
                        .save(contact)
                        .then(function() {
                            return "perf_teacher_ts_number";
                        });
                }

            });
        },

        perf_teacher_ts_number: function(name, $) {
            var error = $("Please provide a valid number value for the teacher's TS number.");

            var question = $("Please enter the teacher's TS number.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: 'perf_teacher_gender'
            });
        },

        perf_teacher_gender: function(name, $) {
            return new ChoiceState(name, {
                question: $("What is the gender of the teacher?"),

                choices: [
                    new Choice('male', $('Male')),
                    new Choice('female', $('Female'))
                ],

                next: 'perf_teacher_age'
            });
        },

        perf_teacher_age: function(name, $) {
            var error = $("Please provide a valid number value for the teacher's age.");

            var question = $("Please enter the teacher's age in years e.g. 26.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) >= 76 || parseInt(content, 10) <= 19) {
                        return error;
                    }
                },

                next: 'perf_teacher_academic_level'
            });
        },

        perf_teacher_academic_level: function(name, $) {
            return new ChoiceState(name, {
                question: $("What is the teacher's highest education level?"),

                choices: [
                    new Choice("1", $("Gr 7")),
                    new Choice("2", $("Gr 9")),
                    new Choice("3", $("Gr 12")),
                    new Choice("4", $("PTC")),
                    new Choice("5", $("PTD")),
                    new Choice("6", $("Dip Ed")),
                    new Choice("7", $("Other diploma")),
                    new Choice("8", $("BA Degree")),
                    new Choice("9", $("MA Degree")),
                    new Choice("10", $("Other"))
                ],

                next: 'perf_teacher_years_experience'
            });
        },

        perf_teacher_years_experience: function(name, $) {
            return new ChoiceState(name, {
                question: $("How many years of teaching experience does this teacher have?"),

                choices: [
                    new Choice("0-3", $("0 - 3 years")),
                    new Choice("4-8", $("4 - 8 years")),
                    new Choice("9-12", $("9 - 12 years")),
                    new Choice("13+", $("13 years or more"))
                ],

                next: 'perf_teacher_g2_pupils_present'
            });
        },

        perf_teacher_g2_pupils_present: function(name, $) {
            var error = $('Please provide a number value for pupils present.');

            var question = $("How many children were PRESENT during the observed lesson?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: 'perf_teacher_g2_pupils_registered'
            });
        },

        perf_teacher_g2_pupils_registered: function(name, $) {
            var error = $('Please provide a number value for pupils enrolled.');

            var question = $("How many children are ENROLLED in the Grade 2 class that was " +
                            "observed?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: 'perf_teacher_classroom_environment_score'
            });
        },

        perf_teacher_classroom_environment_score: function(name, $) {
            var error = $("Please provide a valid number value for the Classroom Environment " +
                        "subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the classroom " +
                            "observation for Section 2 (Classroom Environment).");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 8) {
                        return error;
                    }
                },

                next: 'perf_teacher_t_l_materials'
            });
        },

        perf_teacher_t_l_materials: function(name, $) {
            var error = $("Please provide a valid number value for the Teaching and Learning " +
                        "Materials subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the classroom " +
                            "observation for Section 3 (Teaching and Learning Materials).");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 7) {
                        return error;
                    }
                },

                next: 'perf_teacher_pupils_books_number'
            });
        },

        perf_teacher_pupils_books_number: function(name, $) {
            var error = $("Please provide a number value for number of learners' books.");

            var question = $("Enter the number of learners' books (text books) for literacy that " +
                            "were available in the classroom during the lesson observation.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: 'perf_teacher_pupils_materials_score'
            });
        },

        perf_teacher_pupils_materials_score: function(name, $) {
            var error = $("Please provide a valid number value for the Learner Materials subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the classroom " +
                            "observation for Section 4 (Learner Materials).");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 6) {
                        return error;
                    }
                },

                next: 'perf_teacher_reading_lesson'
            });
        },

        perf_teacher_reading_lesson: function(name, $) {
            var error = $("Please provide a valid number value for the Time on Task and Reading " +
                        "Practice subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the classroom " +
                            "observation for Section 5 (Time on Task and Reading Practice)");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 14) {
                        return error;
                    }
                },

                next: 'perf_teacher_pupil_engagement_score'
            });
        },

        perf_teacher_pupil_engagement_score: function(name, $) {
            var error = $("Please provide a valid number value for the Learner Engagement subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the classroom " +
                            "observation for Section 6 (Learner Engagement)");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 17) {
                        return error;
                    }
                },

                next: 'perf_teacher_attitudes_and_beliefs'
            });
        },

        perf_teacher_attitudes_and_beliefs: function(name, $) {
            var error = $("Please provide a valid number value for the Teacher Attitudes and " +
                        "Beliefs subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the interview " +
                            "on Section 7.1. (Teacher Attitudes and Beliefs)");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 16) {
                        return error;
                    }
                },

                next: 'perf_teacher_training_subtotal'
            });
        },

        perf_teacher_training_subtotal: function(name, $) {
            var error = $("Please provide a valid number value for the Teacher Training " +
                        "interview subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the interview " +
                            "on Section 7.2. (Teacher Training)");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 3) {
                        return error;
                    }
                },

                next: 'perf_teacher_reading_assessment'
            });
        },

        perf_teacher_reading_assessment: function(name, $) {
            var error = $("Please provide a valid number value for the Reading Assessment " +
                        "subtotal.");

            var question = $("Enter the subtotal that the teacher achieved during the interview " +
                            "on Section 7.3. (Reading Assessment).");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false ||
                            parseInt(content, 10) < 0 || parseInt(content, 10) > 10) {
                        return error;
                    }
                },

                next: 'perf_teacher_reading_total'
            });
        },

        perf_teacher_reading_total: function(name, $, contact, im) {
            var error = $("Please provide a number value for the pupils in the class that have " +
                        "broken through/can read.");

            var question = $("According to your assessment records, how many of the pupils in " +
                            "the class that was observed have broken through/can read?");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: function() {
                    var emis = contact.extra.rts_emis;
                    var id = contact.extra.rts_id;
                    var data = go.utils.performance_data_teacher_collect(emis, im);

                    if (_.isUndefined(contact.extra.rts_official_district_id)) {
                        // is head teacher
                        data.created_by = "/api/v1/data/headteacher/" + id + "/";
                    } else {
                        // is district admin
                        data.created_by_da = "/api/v1/district_admin/" + id + "/";
                    }

                    return go.utils
                        .cms_post("data/teacherperformance/", data, im)
                        .then(function() {
                            return 'perf_teacher_completed';
                        });
                }
            });
        },

        perf_teacher_completed: function(name, $) {
            return new ChoiceState(name, {
                question: $("Congratulations, you have finished reporting on this teacher."),

                choices: [
                    new Choice("perf_teacher_ts_number", $("Add another teacher.")),
                    new Choice("initial_state", $("Go back to the main menu.")),
                    new Choice("end_state", $("Exit."))
                ],

                next: function(choice) {
                    return choice.value;
                }
            });
        },

        'commas': 'commas'

    };

    return tp;

}();

go.sp = function() {
    var vumigo = require('vumigo_v02');
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var Choice = vumigo.states.Choice;


    var sp = {
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

    return sp;

}();

var vumigo = require('vumigo_v02');
var moment = require('moment');
var _ = require('lodash');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;
var JsonApi = vumigo.http.api.JsonApi;


// tip: code fold level 2, then unfold var GoApp, then fold level 3

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

    cms_update_school_and_contact: function(result, im, contact) {
        parsed_result = JSON.parse(result.body);
        var headteacher_id = parsed_result.id;
        var emis = parsed_result.emis.emis;
        var school_data = go.utils.registration_data_school_collect(im);
        school_data.created_by = "/api/v1/data/headteacher/" + headteacher_id + "/";
        school_data.emis = "/api/v1/school/emis/" + emis + "/";
        return go.utils
            .cms_post("data/school/", school_data, im)
            .then(function(result) {
                contact.extra.rts_id = headteacher_id.toString();
                contact.extra.rts_emis = emis.toString();
                contact.name = im.user.answers.reg_first_name;
                contact.surname = im.user.answers.reg_surname;
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
    }

};



go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;

    var GoApp = App.extend(function(self) {
        App.call(self, 'initial_state');
        var $ = self.$;

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


        // INITIAL STATES & END STATE
        // --------------------------

        self.states.add('initial_state', function(name) {
            if (_.isUndefined(self.contact.extra.rts_id)) {
                // user is unregistered if doesn't have rts_id
                return self.states.create('initial_state_unregistered');
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

        self.states.add('initial_state_district_official', function(name) {
            return new ChoiceState(name, {
                question: $('What would you like to do?'),

                choices: [
                    new Choice("add_emis_perf_teacher_ts_number", $("Report on teacher performance.")),
                    new Choice("add_emis_perf_learner_boys_total", $("Report on learner performance.")),
                ],

                next: function(choice) {
                    return choice.value;
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
                    return choice.value;
                }
            });
        });

        self.states.add('end_state', function(name) {
            return new EndState(name, {
                text: $("Goodbye! Thank you for using the Gateway."),

                next: "initial_state"
            });
        });



        // REGISTER HEAD TEACHER STATES
        // ----------------------------

        self.states.add('reg_emis', function(name, opts) {
            return go.rht.reg_emis(name, $, self.array_emis, opts);
        });

        self.states.add('reg_emis_validates', function(name) {
            return go.rht.reg_emis_validates(name, $);
        });

        self.states.add('reg_emis_retry_exit', function(name) {
            return go.rht.reg_emis_retry_exit(name, $);
        });

        self.states.add('reg_exit_emis', function(name) {
            return go.rht.reg_exit_emis(name, $);
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
            return go.rdo.reg_district_official(name, $, self.districts);
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


        // CHANGE MANAGEMENT STATES
        // ------------------------

        self.states.add('state_cm_start', function(name, $) {
            return go.cm.state_cm_start(name);
        });

        self.states.add('state_cm_exit', function(name, $) {
            return go.cm.state_cm_exit(name);
        });



        // LEARNER PERFORMANCE STATES
        // --------------------------

        self.states.add('add_emis_perf_learner_boys_total', function(name) {
            return go.lp.add_emis_perf_learner_boys_total(name, $, self.array_emis, self.contact,
                                                            self.im);
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
            return go.tp.add_emis_perf_teacher_ts_number(name, $, self.array_emis, self.contact,
                                                        self.im);
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
