var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.tp = {
    // TeacherPerformance States

    state_tp_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_tp_next';
                } else {
                    return 'state_tp_exit';
                }
            }
        });
    },

    state_tp_next: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('again', 'Back to beginning'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'again') {
                    return 'state_tp_start';
                } else {
                    return 'state_tp_exit';
                }
            }
        });
    },

    state_tp_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_tp_start'
        });
    }

};
