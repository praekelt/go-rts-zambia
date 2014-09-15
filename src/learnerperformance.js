
self.states.add('state_lp_start', function(name) {
    return new ChoiceState(name, {
        question: 'Hi there! What do you want to do?',

        choices: [
            new Choice('next', 'Go to next state'),
            new Choice('exit', 'Exit')],

        next: function(choice) {
            if(choice.value === 'next') {
                return 'state_lp_next';
            } else {
                return 'state_exit';
            }
        }
    });
});


self.states.add('state_lp_next', function(name) {
    return new ChoiceState(name, {
        question: 'Hi there! What do you want to do?',

        choices: [
            new Choice('again', 'Back to beginning'),
            new Choice('exit', 'Exit')],

        next: function(choice) {
            if(choice.value === 'again') {
                return 'state_lp_start';
            } else {
                return 'state_exit';
            }
        }
    });
});


self.states.add('state_exit', function(name) {
    return new EndState(name, {
                text: 'Thanks, cheers!',
                next: 'state_lp1'
            });
});