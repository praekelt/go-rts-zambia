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
                    new Choice('male', 'Male'),
                    new Choice('female', 'Female')
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
                    new Choice("1", "Gr 7"),
                    new Choice("2", "Gr 9"),
                    new Choice("3", "Gr 12"),
                    new Choice("4", "PTC"),
                    new Choice("5", "PTD"),
                    new Choice("6", "Dip Ed"),
                    new Choice("7", "Other diploma"),
                    new Choice("8", "BA Degree"),
                    new Choice("9", "MA Degree"),
                    new Choice("10", "Other")
                ],

                next: 'perf_teacher_years_experience'
            });
        },

        perf_teacher_years_experience: function(name, $) {
            return new ChoiceState(name, {
                question: $("How many years of teaching experience does this teacher have?"),

                choices: [
                    new Choice("0-3", "0 - 3 years"),
                    new Choice("4-8", "4 - 8 years"),
                    new Choice("9-12", "9 - 12 years"),
                    new Choice("13+", "13 years or more")
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
                    new Choice("perf_teacher_ts_number", "Add another teacher."),
                    new Choice("initial_state", "Go back to the main menu."),
                    new Choice("end_state", "Exit.")
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
