go.sp = function() {
    var vumigo = require('vumigo_v02');
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var Choice = vumigo.states.Choice;

    var choices_yes_incomplete_no = [
        new Choice('yes', $("YES - completed")),
        new Choice('yes_incomplete', $("YES - in progress")),
        new Choice('no', $("NO"))
    ];

    var choices_yes_no = [
        new Choice('yes', $("YES")),
        new Choice('no', $("NO"))
    ];

    var choices_yes_submitted_no = [
        new Choice('yes_cellphone', $("YES submitted by cell phone")),
        new Choice('yes_paper', $("YES submitted paper form to DEBS office")),
        new Choice('no', $("NO"))
    ];

    var choices_yes_updated_no = [
        new Choice('yes', $("YES")),
        new Choice('yes_incomplete', $("YES but not updated")),
        new Choice('no', $("NO"))
    ];


    var sp = {
        // School Monitoring States

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
        },

        add_emis_school_monitoring: function(name, $, array_emis, contact, im) {
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
                    contact.extra.school_monitoring_emis = content;
                    return im.contacts
                        .save(contact)
                        .then(function() {
                            return "monitor_school_see_lpip";
                        });
                }

            });
        },

        monitor_school_see_lpip: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Please complete the following questions after the visit is complete. " +
                    "Did you see the School Learner Performance Improvement Plan for this year?",

                choices: choices_yes_incomplete_no,

                next: function(choice) {
                    if(choice.value === 'no') {
                        return 'q07';
                    } else {
                        return 'q01';
                    }
                }
            });
        },

        q01: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Please indicate the status of key LPIP activities: Is there an activity " +
                    "for improving the teaching of early grade reading?",

                choices: choices_yes_incomplete_no,

                next: 'q02'
            });
        },

        q02: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Is there an activity for improving learner assessment?",

                choices: choices_yes_incomplete_no,

                next: 'q03'
            });
        },

        q03: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Is there an activity for buying or making teaching and learning materials?",

                choices: choices_yes_incomplete_no,

                next: 'q04'
            });
        },

        q04: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Is there an activity for improving learner attendance?",

                choices: choices_yes_incomplete_no,

                next: 'q05'
            });
        },

        q05: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Is there an activity for increasing the time available for children to " +
                    "read, inside or outside school?",

                choices: choices_yes_incomplete_no,

                next: 'q06'
            });
        },

        q06: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Is there an activity to give extra or remedial support to struggling " +
                    "learners?",

                choices: choices_yes_incomplete_no,

                next: 'q07'
            });
        },

        q07: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Did you see the Grade 2 reading lesson observation results done by the " +
                    "head teacher for the current term?",

                choices: choices_yes_incomplete_no,

                next: function(choice) {
                    if(choice.value === 'no') {
                        return 'q10';
                    } else {
                        return 'q08';
                    }
                }
            });
        },

        q08: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "According to the teacher observed, has the Head Teacher given him/her " +
                    "feedback?",

                choices: choices_yes_no,

                next: 'q09'
            });
        },

        q09: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Has the Head Teacher submitted the classroom observation results to the ZSG?",

                choices: choices_yes_submitted_no,

                next: 'q10'
            });
        },

        q10: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Did you see the GALA stimulus sheets completed by the learners for the " +
                    "current term?",

                choices: choices_yes_incomplete_no,

                next: function(choice) {
                    if(choice.value === 'no') {
                        return 'q16';
                    } else {
                        return 'q11';
                    }
                }
            });
        },

        q11: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Was the summary worksheet accurately completed by the Head Teacher?",

                choices: choices_yes_no,

                next: 'q12'
            });
        },

        q12: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "According to the teacher observed, has the Head Teacher given him/her " +
                    "feedback on the literacy assessment results?",

                choices: choices_yes_no,

                next: 'q13'
            });
        },

        q13: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Has the Head Teacher submitted the GALA results to the ZSG?",

                choices: choices_yes_submitted_no,

                next: 'q14'
            });
        },

        q14: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Is the Talking Wall poster on display and up to date?",

                choices: choices_yes_updated_no,

                next: 'q15'
            });
        },

        q15: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "Congratulations, you have finished reporting on this school.",

                choices: [
                    new Choice('add_emis_school_monitoring',
                                    $("Report on another school monitoring visit")),
                    new Choice('initial_state', $("Go back to the main menu")),
                    new Choice('end_state', $("Exit"))
                ],

                next: function(choice) {
                    return choice.value();
                }
            });
        },

        q16: function(name, $) {
            return new ChoiceState(name, {
                question:
                    "This school is falling behind with their LPIP and E-SIMON " +
                    "responsibilities. Please assist the Head Teacher to catch up.",

                choices: [
                    new Choice('initial_state', $("Go back to the main menu")),
                    new Choice('end_state', $("Exit"))
                ],

                next: function(choice) {
                    return choice.value();
                }
            });
        },

        "commas": "commas"
    };

    return sp;

}();
