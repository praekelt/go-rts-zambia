var vumigo = require('vumigo_v02');
var ChoiceState = vumigo.states.ChoiceState;
var EndState = vumigo.states.EndState;
var Choice = vumigo.states.Choice;


go.sp = {
    // LearnerPerformance States

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
    }

};
