go.sp = function() {
    var vumigo = require('vumigo_v02');
    var _ = require('lodash');
    var ChoiceState = vumigo.states.ChoiceState;
    var FreeText = vumigo.states.FreeText;
    var Choice = vumigo.states.Choice;


    var sp = {
        // School Monitoring States

        add_emis_school_monitoring: function(name, $, contact, im) {
            var error = $("The emis does not exist, please try again. " +
                        "This should have 4-6 digits e.g 4351.");

            var question = $("Please enter the school's EMIS number that you would " +
                            "like to report on. This should have 4-6 digits e.g 4351.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    return go.utils
                        .check_valid_emis(content, im)
                        .then(function(result) {
                            if (result === false) {
                                return error;
                            }
                        });
                },

                next: function(content) {
                    contact.extra.school_monitoring_emis = content;
                    return im.contacts
                        .save(contact)
                        .then(function() {
                            return "monitor_school_visit_complete";
                        });
                }

            });
        },

        monitor_school_visit_complete: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Please complete the following questions after the visit is complete."),

                choices: [
                    new Choice('monitor_school_see_lpip', $("Continue")),
                    new Choice('end_state', $("Exit"))
                ],

                next: function(choice) {
                    return choice.value;
                }
            });
        },

        monitor_school_see_lpip: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Did you see the School Learner Performance Improvement Plan for this year?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: function(choice) {
                    if(choice.value === 'no') {
                        return 'monitor_school_g2_observation_results';
                    } else {
                        return 'monitor_school_teaching';
                    }
                }
            });
        },

         // q01
        monitor_school_teaching: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Please indicate the following: Is there an activity in the LPIP for " +
                    "improving the teaching of early grade reading?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_learner_assessment'
            });
        },

        // q02
        monitor_school_learner_assessment: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Is there an activity for improving learner assessment?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_learning_materials'
            });
        },

        // q03
        monitor_school_learning_materials: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Is there an activity for buying or making teaching and learning materials?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_learner_attendance'
            });
        },

        // q04
        monitor_school_learner_attendance: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Is there an activity for improving learner attendance?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_reading_time'
            });
        },

        // q05
        monitor_school_reading_time: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Is there an activity for increasing the time available for children to " +
                    "read, inside or outside school?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_struggling_learners'
            });
        },

        // q06
        monitor_school_struggling_learners: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Is there an activity to give extra or remedial support to struggling " +
                    "learners?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_g2_observation_results'
            });
        },

        // q07 - diverts
        monitor_school_g2_observation_results: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Did you see the Grade 2 reading lesson observation results done by the " +
                    "head teacher for the current term?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: function(choice) {
                    if(choice.value === 'no') {
                        return 'monitor_school_gala_sheets';
                    } else {
                        return 'monitor_school_ht_feedback';
                    }
                }
            });
        },

        // q08
        monitor_school_ht_feedback: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("According to the teacher observed, has the Head Teacher given him/her " +
                    "feedback?"),

                choices: [
                    new Choice('yes', $("YES")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_submitted_classroom'
            });
        },

        // q09
        monitor_school_submitted_classroom: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Has the Head Teacher submitted the classroom observation results to the ZSG?"),

                choices: [
                    new Choice('yes_cellphone', $("YES submitted by cell phone")),
                    new Choice('yes_paper', $("YES submitted paper form to DEBS office")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_gala_sheets'
            });
        },

        // q10 - diverts
        monitor_school_gala_sheets: function(name, $, im, contact) {
            return new ChoiceState(name, {
                question:
                    $("Did you see the GALA stimulus sheets completed by the learners for the " +
                    "current term?"),

                choices: [
                    new Choice('yes', $("YES - completed")),
                    new Choice('yes_in_progress', $("YES - in progress")),
                    new Choice('no', $("NO"))
                ],

                next: function(choice) {
                    if(choice.value === 'no') {
                        var emis = contact.extra.school_monitoring_emis;
                        var id = contact.extra.rts_id;
                        var school_monitoring_data = go.utils.school_monitoring_data_collect(emis, im);

                        if (_.isUndefined(contact.extra.rts_official_district_id)) {
                            // is head teacher
                            school_monitoring_data.created_by = "/api/v1/data/headteacher/" + id + "/";
                        } else {
                            // is district admin
                            school_monitoring_data.created_by_da = "/api/v1/district_admin/" + id + "/";
                        }

                        return go.utils
                            .cms_post("data/school_monitoring/", school_monitoring_data, im)
                            .then(function(result) {
                                contact.extra.school_monitoring_emis = "";
                                return im.contacts
                                    .save(contact)
                                    .then(function() {
                                        return 'monitor_school_falling_behind';
                                    });
                            });
                    } else {
                        return 'monitor_school_summary_worksheet';
                    }
                }
            });
        },

        // q11
        monitor_school_summary_worksheet: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Was the summary worksheet accurately completed by the Head Teacher?"),

                choices: [
                    new Choice('yes', $("YES")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_ht_feedback_literacy'
            });
        },

        // q12
        monitor_school_ht_feedback_literacy: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("According to the teacher observed, has the Head Teacher given him/her " +
                    "feedback on the literacy assessment results?"),

                choices: [
                    new Choice('yes', $("YES")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_submitted_gala'
            });
        },

        // q13
        monitor_school_submitted_gala: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Has the Head Teacher submitted the GALA results to the ZSG?"),

                choices: [
                    new Choice('yes_cellphone', $("YES submitted by cell phone")),
                    new Choice('yes_paper', $("YES submitted paper form to DEBS office")),
                    new Choice('no', $("NO"))
                ],

                next: 'monitor_school_talking_wall'
            });
        },

        // q14
        monitor_school_talking_wall: function(name, $, im, contact) {
            return new ChoiceState(name, {
                question:
                    $("Is the Talking Wall poster on display and up to date?"),

                choices: [
                    new Choice('yes', $("YES")),
                    new Choice('yes_not_updated', $("YES but not updated")),
                    new Choice('no', $("NO"))
                ],

                next: function(choice) {
                    var emis = contact.extra.school_monitoring_emis;
                    var id = contact.extra.rts_id;
                    var school_monitoring_data = go.utils.school_monitoring_data_collect(emis, im);

                    if (_.isUndefined(contact.extra.rts_official_district_id)) {
                        // is head teacher
                        school_monitoring_data.created_by = "/api/v1/data/headteacher/" + id + "/";
                    } else {
                        // is district admin
                        school_monitoring_data.created_by_da = "/api/v1/district_admin/" + id + "/";
                    }

                    return go.utils
                        .cms_post("data/school_monitoring/", school_monitoring_data, im)
                        .then(function(result) {
                            contact.extra.school_monitoring_emis = "";
                            return im.contacts
                                .save(contact)
                                .then(function() {
                                    return 'monitor_school_completed';
                                });
                        });
                }
            });
        },

        // q15
        monitor_school_completed: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("Congratulations, you have finished reporting on this school."),

                choices: [
                    new Choice('add_emis_school_monitoring',
                                    $("Report on another school monitoring visit")),
                    new Choice('initial_state', $("Go back to the main menu")),
                    new Choice('end_state', $("Exit"))
                ],

                next: function(choice) {
                    return choice.value;
                }
            });
        },

        // q16
        monitor_school_falling_behind: function(name, $) {
            return new ChoiceState(name, {
                question:
                    $("This school is falling behind with their LPIP and E-SIMON " +
                    "responsibilities. Please assist the Head Teacher to catch up."),

                choices: [
                    new Choice('initial_state', $("Go back to the main menu")),
                    new Choice('end_state', $("Exit"))
                ],

                next: function(choice) {
                    return choice.value;
                }
            });
        },

        "commas": "commas"
    };

    return sp;

}();
