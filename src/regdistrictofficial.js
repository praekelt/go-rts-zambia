var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.rdo = {
    // Registration of Head Teacher States

    state_rdo_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_rdo_exit';
                } else {
                    return 'state_rdo_exit';
                }
            }
        });
    },

    state_rdo_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_rdo_start'
        });
    }

};
