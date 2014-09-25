var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.rht = {
    // Registration of Head Teacher States

    state_rht_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_rht_exit';
                } else {
                    return 'state_rht_exit';
                }
            }
        });
    },

    state_rht_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_rht_start'
        });
    }

};
