var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.lp = {
    // LearnerPerformance States

    state_lp_start: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('next', 'Go to next state'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'next') {
                    return 'state_lp_next';
                } else {
                    return 'state_lp_exit';
                }
            }
        });
    },

    state_lp_next: function(name) {
        return new ChoiceState(name, {
            question: 'Hi there! What do you want to do?',

            choices: [
                new Choice('to_tp', 'Switch to TeacherPerformance'),
                new Choice('exit', 'Exit')],

            next: function(choice) {
                if(choice.value === 'to_tp') {
                    return 'state_tp_start'; // Switch to TP
                } else {
                    return 'state_lp_exit';
                }
            }
        });
    },

    state_lp_exit: function(name) {
        return new EndState(name, {
            text: 'Thanks, cheers!',
            next: 'state_lp_start'
        });
    }

};
