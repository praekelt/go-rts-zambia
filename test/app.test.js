var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("app", function() {
    describe("GoApp", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'test_app'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("when the user starts a session", function() {
            it("should ask them want they want to do", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'state_lp_start',
                        reply: [
                            'Hi there! What do you want to do?',
                            '1. Go to next state',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user asks to go to the next state", function() {
            it("should go to next state", function() {
                return tester
                    .setup.user.state('state_lp_start')
                    .input('1')
                    .check.interaction({
                        state: 'state_lp_next',
                        reply: [
                            'Hi there! What do you want to do?',
                            '1. Switch to TeacherPerformance',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("when the user asks to exit", function() {
            it("should say thank you and end the session", function() {
                return tester
                    .setup.user.state('state_lp_start')
                    .input('2')
                    .check.interaction({
                        state: 'state_lp_exit',
                        reply: 'Thanks, cheers!'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("when the user asks to switch to tp", function() {
            it("should switch to state_tp_start", function() {
                return tester
                    .setup.user.state('state_lp_next')
                    .input('1')
                    .check.interaction({
                        state: 'state_tp_start',
                        reply: [
                            'Hi there! What do you want to do?',
                            '1. Go to next state',
                            '2. Exit'
                        ].join('\n')
                    })
                    .run();
            });
        });

    });
});
