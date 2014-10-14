go.lp = function() {

    var vumigo = require('vumigo_v02');
    var _ = require('lodash');
    var FreeText = vumigo.states.FreeText;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;


    var lp = {
        // LearnerPerformance States

        add_emis_perf_learner_boys_total: function(name, $, contact, im) {
            var error = $("The emis does not exist, please try again. " +
                        "This should have 4-6 digits e.g 4351.");

            var question = $("Please enter the school's EMIS number that you would " +
                            "like to report on. This should have 4-6 digits e.g 4351.");

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_emis(content, im) === false) {
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
