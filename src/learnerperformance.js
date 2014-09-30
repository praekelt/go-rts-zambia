go.lp = function() {

    var vumigo = require('vumigo_v02');
    var FreeText = vumigo.states.FreeText;
    var ChoiceState = vumigo.states.ChoiceState;
    // var EndState = vumigo.states.EndState;
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
                            total: Number(content)
                        }
                    };
                }
            });
        },

        perf_learner_boys_calc_error: function(name, $, opts) {
            return new ChoiceState(name, {
                question: 
                    $("You've entered results for {{ calc_total }} boys ({{ calculation }}), but " +
                        "you initially indicated {{ total }} boys participants. Please try again.")
                    .context({
                        calc_total: opts.calc_total,
                        calculation: opts.calculation,
                        total: opts.total
                    }),

                choices: [
                    new Choice('continue', 'Continue')
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
                    var calc_total = Number(content);
                    var calculation = content;

                    if (calc_total > opts.total) {
                        return {
                            name: 'perf_learner_boys_calc_error',
                            creator_opts: {
                                calculation: calculation,
                                total: opts.total,
                                calc_total: calc_total
                            }
                        };
                    } else {
                        return {
                            name: 'perf_learner_boys_desirable',
                            creator_opts: {
                                total: opts.total,
                                calc_total: calc_total,
                                calculation: calculation
                            }
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
                    var calc_total = opts.calc_total + Number(content);
                    var calculation = opts.calculation + '+' + content;

                    if (calc_total > opts.total) {
                        return {
                            name: 'perf_learner_boys_calc_error',
                            creator_opts: {
                                calculation: calculation,
                                total: opts.total,
                                calc_total: calc_total
                            }
                        };
                    } else {
                        return {
                            name: 'perf_learner_boys_minimum',
                            creator_opts: {
                                total: opts.total,
                                calc_total: calc_total,
                                calculation: calculation
                            }
                        };
                    }
                }
            });
        },


        'commas': 'commas'

    };

    return lp;

}();
