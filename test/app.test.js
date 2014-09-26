var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var assert = require('assert');
var AppTester = vumigo.AppTester;
var messagestore = require('./messagestore');
var DummyMessageStoreResource = messagestore.DummyMessageStoreResource;


describe("app", function() {
    describe("GoApp", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    name: 'test_app',
                    env: 'test',
                    cms_api_root: 'http://qa/api/v1/',
                })
                .setup(function(api) {
                    api.resources.add(new DummyMessageStoreResource());
                    api.resources.attach(api);
                })
                .setup(function(api) {
                    fixtures().forEach(function(d) {
                        d.repeatable = true;
                        api.http.fixtures.add(d);
                    });
                });
        });


// start broken indentation to save whitespace


// REGISTRATION
// ------------

// uu = unregistered user

describe("when an unregistered user logs on", function() {
    
    describe("when uu starts a session", function() {
        it("should ask them want they want to do", function() {
            return tester
                .setup.user.addr('097123')
                .inputs('start')
                .check.interaction({
                    state: 'initial_state',
                    reply: [
                        'Welcome to the Zambia School Gateway! Options:',
                        '1. Register as Head Teacher',
                        '2. Register as District Official',
                        '3. Change my school',
                        '4. Change my primary cell number'
                    ].join('\n')
                })
                .run();
        });
    });


    // DISTRICT OFFICIAL REGISTRATION
    // ------------------------------

    describe("when uu chooses to register as district official", function() {
        
        it("should ask for district name", function() {
            return tester
                .setup.user.addr('097123')
                .inputs('start', '2')
                .check.interaction({
                    state: 'reg_district_official',
                    reply: [
                        'Please enter your district name.',
                        '1. Chembe',
                        '2. Chinsali',
                        '3. Chipata',
                        '4. Chipili',
                        '5. Isoka',
                        '6. Limulunga',
                        '7. Lundazi',
                        '8. Mansa',
                        '9. More'
                    ].join('\n')
                })
                .run();
        });

        describe("when uu enters their district name", function() {

            describe("if their choice is valid", function() {
                it("should ask for their first name", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs('start', '2', '1')
                        .check.interaction({
                            state: 'reg_district_official_first_name',
                            reply: "Please enter your FIRST name."
                        })
                        .run();
                });
            });

            describe("if they choose 9. More", function() {
                it("should show the second page of districts", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs('start', '2', '9')
                        .check.interaction({
                            state: 'reg_district_official',
                            reply: [
                                'Please enter your district name.',
                                '1. Mongu',
                                '2. Mporokoso',
                                '3. Mufumbwe',
                                '4. Mulobezi',
                                '5. Mungwi',
                                '6. Mwandi',
                                '7. Mwense',
                                '8. Sesheke',
                                '9. More',
                                '10. Back'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if they choose 9. More twice", function() {
                it("should show the third page of districts", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs('start', '2', '9', '9')
                        .check.interaction({
                            state: 'reg_district_official',
                            reply: [
                                'Please enter your district name.',
                                "1. Shiwang'andu",
                                '2. Solwezi',
                                '3. Back'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if they choose 9. More, then 10. Back", function() {
                it("should show the first page of districts again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs('start', '2', '9', '10')
                        .check.interaction({
                            state: 'reg_district_official',
                            reply: [
                                'Please enter your district name.',
                                '1. Chembe',
                                '2. Chinsali',
                                '3. Chipata',
                                '4. Chipili',
                                '5. Isoka',
                                '6. Limulunga',
                                '7. Lundazi',
                                '8. Mansa',
                                '9. More'
                            ].join('\n')
                        })
                        .run();
                });
            });


        });

        describe("when uu enters their first name", function() {
            it("should ask for their surname", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs('start', '2', '9', '2', 'Michael')
                    .check.interaction({
                        state: 'reg_district_official_surname',
                        reply: "Please enter your SURNAME."
                    })
                    .run();
            });
        });

        describe("when uu enters their surname", function() {
            it("should ask for their id number", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs('start', '2', '9', '2', 'Michael', 'Sherwin')
                    .check.interaction({
                        state: 'reg_district_official_id_number',
                        reply: "Please enter your ID number."
                    })
                    .run();
            });
        });

        describe("when uu enters their id number", function() {
            it("should ask for their date of birth", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs('start', '2', '9', '2', 'Michael', 'Sherwin', '123454321')
                    .check.interaction({
                        state: 'reg_district_official_dob',
                        reply:
                            "Please enter your date of birth. Start with the day," +
                            " followed by the month and year, e.g. 27111980."
                    })
                    .run();
            });
        });

        describe("when uu enters their date of birth", function() {

            describe("if their dob input is valid", function() {
                it("should congratulate them and exit", function() {
                    return tester
                        .setup.user.addr('097123')
                        .setup.user.answers({
                            'reg_district_official': '1'
                        })
                        .inputs('start', '2', '9', '2', 'Michael', 'Sherwin', '123454321', '27111980')
                        .check.interaction({
                            state: 'reg_district_official_thanks',
                            reply:
                                "Congratulations! You are now registered as a user of the" +
                                " Gateway! Please dial in again when you are ready to start" +
                                " reporting on teacher and learner performance."
                        })
                        .check.reply.ends_session()
                        .run();
                });

                it("should save contact information", function() {
                    return tester
                        .setup.user.addr('097123')
                        .setup.user.answers({
                            'reg_district_official': '1'
                        })
                        .inputs('start', '2', '9', '2', 'Michael', 'Sherwin', '123454321', '27111980')
                        .check(function(api) {
                            var contact = api.contacts.store[0];
                            assert.equal(contact.extra.rts_id, '2');
                            assert.equal(contact.extra.rts_district_official_id_number, '123454321');
                            assert.equal(contact.extra.rts_official_district_id, '1');
                            assert.equal(contact.name, 'Michael');
                            assert.equal(contact.surname, 'Sherwin');
                        })
                        .run();
                });
            });

            describe("if their dob input is not valid", function() {
                it("should ask them to re-enter dob", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs('start', '2', '9', '2', 'Michael', 'Sherwin', '123454321', '9999')
                        .check.interaction({
                            state: 'reg_district_official_dob',
                            reply: "Please enter your date of birth formatted DDMMYYYY"
                        })
                        .run();
                });
            });

        });

    });
});



// MONITORING
// ----------

describe("when a registered user logs on", function() {

    describe("when the registered user is a district official", function() {
        it("should ask them what they want to do", function() {
            return tester
                .setup.user.addr('097444')
                .inputs('start')
                .check.interaction({
                    state: 'initial_state',
                    reply: [
                        'What would you like to do?',
                        '1. Report on teacher performance.',
                        '2. Report on learner performance',
                    ].join('\n')
                })
                .run();
        });
    });

    describe("when the registered user is a head teacher", function() {
        it("should ask them what they want to do", function() {
            return tester
                .setup.user.addr('097555')
                .inputs('start')
                .check.interaction({
                    state: 'initial_state',
                    reply: [
                        'What would you like to do?',
                        '1. Report on teacher performance.',
                        '2. Report on learner performance',
                        '3. Change my school',
                        "4. Update my school's registration data."
                    ].join('\n')
                })
                .run();
        });
    });


    // LEARNER PERFORMANCE MONITORING
    // ------------------------------

    describe("when the user chooses to report on learner performance", function() {

        describe("if the user is a district official", function() {
            it("should ask for an emis code", function() {

            });

            describe("when the district official user enters an emis", function() {

                describe("if the emis does not validate", function() {
                    it("should ask for the emis again", function() {

                    });
                });

                describe("if the emis validates", function() {
                    it("should ask for boys total", function() {

                    });

                    it("should save certain data to the district official user's contact", function() {

                    });
                });

            });

            // test one full registration as a district official to check data saving
            describe("when the district official user completes a successful report", function() {
                it("should ask if they want to return to main menu or exit", function() {

                });
                
                it("should save all the data", function() {

                });
            });

        });

        describe("if the user is a head teacher", function() {
            it("should ask for boys total", function() {

            });

            // test step by step flow as a head teacher

            // boys total
            describe("when the user enters boys total", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys outstanding results", function() {

                    });
                });

                // test for numeric value
                describe("if the number does not validate", function() {
                    it("should ask for boys total again", function() {

                    });
                });
            });


            // boys outstanding
            describe("when the user enters boys outstanding results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys desirable results", function() {

                    });
                });

                describe("if boys outstanding results > boys total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to boys total", function() {

                    });
                });
            });

            // boys desirable
            describe("when the user enters boys desirable results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys minimum results", function() {

                    });
                });

                describe("if boys outstanding + desirable > boys total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to boys total", function() {

                    });
                });
            });

            // boys minimum
            describe("when the user enters boys minimum results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys below minimum results", function() {

                    });
                });

                // test for numeric value
                describe("if the number does not validate", function() {
                    it("should ask for boys minimum results again", function() {

                    });
                });

                describe("if boys outstanding + desirable + minimum > boys total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to boys total", function() {

                    });
                });
            });

            // boys below minimum
            describe("when the user enters boys below minimum results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls total", function() {

                    });
                });

                describe("if boys outstanding + desirable + minimum + below minimum > boys total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to boys total", function() {

                    });
                });

                describe("if boys outstanding + desirable + minimum + below minimum < boys total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to boys total", function() {

                    });
                });
            });


            // girls total
            describe("when the user enters girls total", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls outstanding results", function() {

                    });
                });



            // girls outstanding
            describe("when the user enters girls outstanding results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls desirable results", function() {

                    });
                });

                describe("if girls outstanding results > girls total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to girls total", function() {

                    });
                });
            });

            // girls desirable
            describe("when the user enters girls desirable results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls minimum results", function() {

                    });
                });

                describe("if girls outstanding + desirable > girls total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to girls total", function() {

                    });
                });
            });

            // girls minimum
            describe("when the user enters girls minimum results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls below minimum results", function() {

                    });
                });

                describe("if girls outstanding + desirable + minimum > girls total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to girls total", function() {

                    });
                });
            });

            // girls below minimum
            describe("when the user enters girls below minimum results", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys phonics", function() {

                    });
                });

                describe("if girls outstanding + desirable + minimum + below minimum > girls total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to girls total", function() {

                    });
                });

                describe("if girls outstanding + desirable + minimum + below minimum < girls total", function() {
                    it("should display error message", function() {

                    });

                    it("should go back to girls total", function() {

                    });
                });
            });


            // boys phonics
            describe("when the user enters boys phonics result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls phonics result", function() {

                    });
                });

                describe("if boys phonics result > boys total", function() {
                    it("should ask for boys phonics again", function() {

                    });
                });
            });

            // girls phonics
            describe("when the user enters girls phonics result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys vocab result", function() {

                    });
                });

                describe("if girls phonics result > girls total", function() {
                    it("should ask for girls phonics again", function() {

                    });
                });
            });


            // boys vocab
            describe("when the user enters boys vocab result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls vocab result", function() {

                    });
                });

                describe("if boys vocab result > boys total", function() {
                    it("should ask for boys vocab again", function() {

                    });
                });
            });

            // girls vocab
            describe("when the user enters girls vocab result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys comprehension result", function() {

                    });
                });

                describe("if girls vocab result > girls total", function() {
                    it("should ask for girls vocab again", function() {

                    });
                });
            });


            // boys comprehension
            describe("when the user enters boys comprehension result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls comprehension result", function() {

                    });
                });

                describe("if boys comprehension result > boys total", function() {
                    it("should ask for boys comprehension again", function() {

                    });
                });
            });

            // girls comprehension
            describe("when the user enters girls comprehension result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for boys writing result", function() {

                    });
                });

                describe("if girls comprehension result > girls total", function() {
                    it("should ask for girls comprehension again", function() {

                    });
                });
            });


            // boys writing
            describe("when the user enters boys writing result", function() {
                
                describe("if the number validates", function() {
                    it("should ask for girls writing result", function() {

                    });
                });

                describe("if boys writing result > boys total", function() {
                    it("should ask for boys writing again", function() {

                    });
                });
            });

            // girls writing
            describe("when the user enters girls writing result", function() {
                
                describe("if the number validates", function() {
                    it("should show success and options", function() {

                    });

                    it("should save learner performance data", function() {

                    });
                });

                describe("if girls writing result > girls total", function() {
                    it("should ask for girls writing again", function() {

                    });
                });
            });

            // completed - main menu
            describe("after completing report if user selects to go to main menu", function() {
                it("should go back to main menu", function() {

                });
            });

            // completed - exit
            describe("after completing report if user selects to exit", function() {
                it("should thank them and exit", function() {

                });
            });


        });

    });

});


// OTHER
// -----

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

// end broken indentation to save whitespace

    });
});
