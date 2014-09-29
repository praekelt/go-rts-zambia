go.lp = function() {

    var vumigo = require('vumigo_v02');
    var FreeText = vumigo.states.FreeText;
    // var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    // var Choice = vumigo.states.Choice;


    var lp = {
        // LearnerPerformance States

        add_emis_perf_learner_boys_total: function(name, array_emis, contact, im) {
            var error = "The emis does not exist, please try again. " +
                        "This should have 4-6 digits e.g 4351.";

            var question = "Please enter the school's EMIS number that you would " +
                        "like to report on. This should have 4-6 digits e.g 4351.";

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

        perf_learner_boys_total: function(name) {
            var error = "Please provide a number value for total boys assessed.";

            var question = "How many boys took part in the learner assessment?";

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (go.utils.check_valid_number(content) === false) {
                        return error;
                    }
                },

                next: 'perf_learner_boys_outstanding_results'
            });
        },



        state_lp_exit: function(name) {
            return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'state_lp_start'
            });
        }

    };

    return lp;

}();
