go.cm = function() {

    var vumigo = require('vumigo_v02');
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;


    var cm = {
        // Registration of Change Management States

        manage_change_emis_error: function(name, $) {
            return new ChoiceState(name, {
                question: "Your cell phone number is unrecognised. Please associate your new " +
                        "number with your old EMIS first before requesting to change school.",

                choices: [
                    new Choice('initial_state', $("Main menu.")),
                    new Choice('end_state', $("Exit."))],

                next: function(choice) {
                    return choice.value;
                }
            });
        },

        "commas": "commas"
    };

    return cm;

}();
