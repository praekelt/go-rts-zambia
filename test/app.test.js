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


    // HEAD TEACHER REGISTRATION
    // -------------------------

    describe("when uu chooses to register as head teacher", function() {
        
        it("should ask for emis code", function() {
            return tester
                .setup.user.addr('097123')
                .inputs(
                    'start',
                    '1'  // initial_state
                )
                .check.interaction({
                    state: 'reg_emis',
                    reply:
                        "Please enter your school's EMIS number. " +
                        "This should have 4-6 digits e.g. 4351."
                })
                .run();
        });

        describe("when uu enters their emis code", function() {

            describe("if their emis code is valid", function() {
                it("should thank and instruct them to redial on num change", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001'  // reg_emis
                        )
                        .check.interaction({
                            state: 'reg_emis_validates',
                            reply: [
                                "Thanks for claiming this EMIS. Redial this number if you ever " +
                                "change cellphone number to reclaim the EMIS and continue to receive " +
                                "SMS updates.",
                                "1. Continue"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once", function() {
                it("should ask if they want to try again or exit", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '000A'  // reg_emis
                        )
                        .check.interaction({
                            state: 'reg_emis_retry_exit',
                            reply: [
                                "There is a problem with the EMIS number you have entered.",
                                "1. Try again",
                                "2. Exit"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once and chooses to exit", function() {
                it("should instruct to send sms and exit", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '000A',  // reg_emis
                            '2'  // reg_emis_retry_exit
                        )
                        .check.interaction({
                            state: 'reg_exit_emis',
                            reply: "We don't recognise your EMIS number. Please send a SMS with" +
                                    " the words EMIS ERROR to 739 and your DEST will contact you" +
                                    " to resolve the problem."
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once and chooses to try again", function() {
                it("should ask to enter emis number", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '000A',  // reg_emis
                            '1'  // reg_emis_retry_exit
                        )
                        .check.interaction({
                            state: 'reg_emis',
                            reply: "Please enter your school's EMIS number. " +
                                    "This should have 4-6 digits e.g. 4351."
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once and then a valid emis", function() {
                it("should thank and instruct them to redial on num change", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '000A',  // reg_emis
                            '1',  // reg_emis_retry_exit
                            '0001'
                        )
                        .check.interaction({
                            state: 'reg_emis_validates',
                            reply: [
                                "Thanks for claiming this EMIS. Redial this number if you ever " +
                                "change cellphone number to reclaim the EMIS and continue to receive " +
                                "SMS updates.",
                                "1. Continue"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code twice", function() {
                it("should instruct to send sms and exit", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '000A',  // reg_emis
                            '1',  // reg_emis_retry_exit
                            '000B'  // reg_emis
                        )
                        .check.interaction({
                            state: 'reg_exit_emis',
                            reply: "We don't recognise your EMIS number. Please send a SMS with" +
                                    " the words EMIS ERROR to 739 and your DEST will contact you" +
                                    " to resolve the problem."
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

        });

        describe("if the user chooses 1. Continue when emis validates", function() {
            it("should ask for their school name", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1'  // reg_emis_validates
                    )
                    .check.interaction({
                        state: 'reg_school_name',
                        reply: "Please enter the name of your school, e.g. Kapililonga"
                    })
                    .run();
            });
        });

        describe("after the user enters their school name", function() {
            it("should ask for their first name", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One'  //reg_school_name
                    )
                    .check.interaction({
                        state: 'reg_first_name',
                        reply: "Please enter your FIRST name."
                    })
                    .run();
            });
        });

        describe("after the user enters their first name", function() {
            it("should ask for their surname", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack'  // reg_first_name
                    )
                    .check.interaction({
                        state: 'reg_surname',
                        reply: "Please enter your SURNAME."
                    })
                    .run();
            });
        });

        describe("after the user enters their surname", function() {
            it("should ask for their date of birth", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack',  // reg_first_name
                        'Black'  // reg_surname
                    )
                    .check.interaction({
                        state: 'reg_date_of_birth',
                        reply: 
                            "Please enter your date of birth. Start with the day, followed by " +
                            "the month and year, e.g. 27111980"
                    })
                    .run();
            });
        });

        describe("after the user enters their date of birth", function() {

            describe("if their date of birth validates", function() {
                it("should ask for their gender", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980'  // reg_date_of_birth
                        )
                        .check.interaction({
                            state: 'reg_gender',
                            reply: [
                                "What is your gender?",
                                "1. Female",
                                "2. Male"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if their date of birth does not validate", function() {
                it("should ask for their date of birth again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11 Sep 1980'  // reg_date_of_birth
                        )
                        .check.interaction({
                            state: 'reg_date_of_birth',
                            reply: "Please enter your date of birth formatted DDMMYYYY"
                        })
                        .run();
                });
            });
        });

        describe("after the user enters their gender", function() {
            it("should ask for number of boys", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack',  // reg_first_name
                        'Black',  // reg_surname
                        '11091980',  // reg_date_of_birth
                        '2'  // reg_gender
                    )
                    .check.interaction({
                        state: 'reg_school_boys',
                        reply: "How many boys do you have in your school?"
                    })
                    .run();
            });
        });

        describe("after the user enters the number of boys", function() {

            describe("if the number of boys validates", function() {
                it("should ask for number of girls", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50'  // reg_school_boys
                        )
                        .check.interaction({
                            state: 'reg_school_girls',
                            reply: "How many girls do you have in your school?"
                        })
                        .run();
                });
            });

            describe("if the number of boys does not validate", function() {
                it("should ask for number of boys again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            'fifty'  // reg_school_boys
                        )
                        .check.interaction({
                            state: 'reg_school_boys',
                            reply: "Please provide a number value for how many boys you have in your school."
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of girls", function() {

            describe("if the number of girls validates", function() {
                it("should ask for the number of classrooms", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51'  // reg_school_girls
                        )
                        .check.interaction({
                            state: 'reg_school_classrooms',
                            reply: "How many classrooms do you have in your school?"
                        })
                        .run();
                });
            });

            describe("if the number of girls does not validate", function() {
                it("should ask for number of girls again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51g'  // reg_school_girls
                        )
                        .check.interaction({
                            state: 'reg_school_girls',
                            reply: "Please provide a number value for how many girls you have in your school."
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of classrooms", function() {

            describe("if the number of classrooms validates", function() {
                it("should ask for the number of teachers", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5'  // reg_school_classrooms
                        )
                        .check.interaction({
                            state: 'reg_school_teachers',
                            reply: 
                                "How many teachers are presently working in your school, " +
                                "including the head teacher?"
                        })
                        .run();
                });
            });

            describe("if the number of classrooms does not validate", function() {
                it("should ask for the number of classrooms again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            'five'  // reg_school_classrooms
                        )
                        .check.interaction({
                            state: 'reg_school_classrooms',
                            reply: "Please provide a number value for how many classrooms you have in your school"
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of teachers", function() {

            describe("if the number of teachers validates", function() {
                it("should ask for the number of G1 teachers", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5'  // reg_school_teachers
                        )
                        .check.interaction({
                            state: 'reg_school_teachers_g1',
                            reply: "How many teachers teach Grade 1 local language?"
                        })
                        .run();
                });
            });

            describe("if the number of teachers does not validate", function() {
                it("should ask for the number of teachers again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            'few'  // reg_school_teachers
                        )
                        .check.interaction({
                            state: 'reg_school_teachers',
                            reply: "Please provide a number value for how many teachers in total you have " +
                                    "in your school."
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of g1 teachers", function() {

            describe("if the number of G1 teachers validates", function() {
                it("should ask for the number of G2 teachers", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2'  // reg_school_teachers_g1
                        )
                        .check.interaction({
                            state: 'reg_school_teachers_g2',
                            reply: "How many teachers teach Grade 2 local language?"
                        })
                        .run();
                });
            });

            describe("if the number of G1 teachers does not validate", function() {
                it("should ask for the number of G1 teachers again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            'two'  // reg_school_teachers_g1
                        )
                        .check.interaction({
                            state: 'reg_school_teachers_g1',
                            reply: "Please provide a number value for how many teachers teach G1 local " +
                                    "language literacy."
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of g2 teachers", function() {

            describe("if the number of G2 teachers validates", function() {
                it("should ask for the number of G2 boys", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2',  // reg_school_teachers_g1
                            '2'  // reg_school_teachers_g2
                        )
                        .check.interaction({
                            state: 'reg_school_students_g2_boys',
                            reply: "How many boys are ENROLLED in Grade 2 at your school?"
                        })
                        .run();
                });
            });

            describe("if the number of G2 teachers does not validate", function() {
                it("should ask for the number of G2 teachers again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2',  // reg_school_teachers_g1
                            'two'  // reg_school_teachers_g2
                        )
                        .check.interaction({
                            state: 'reg_school_teachers_g2',
                            reply: "Please provide a number value for how many teachers teach G2 local" +
                                    " language literacy."
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of g2 boys", function() {

            describe("if the number of G2 boys validates", function() {
                it("should ask for the number of G2 girls", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2',  // reg_school_teachers_g1
                            '2',  // reg_school_teachers_g2
                            '10'  // reg_school_students_g2_boys
                        )
                        .check.interaction({
                            state: 'reg_school_students_g2_girls',
                            reply: "How many girls are ENROLLED in Grade 2 at your school?"
                        })
                        .run();
                });
            });

            describe("if the number of G2 boys does not validate", function() {
                it("should ask for the number of G2 boys again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2',  // reg_school_teachers_g1
                            '2',  // reg_school_teachers_g2
                            'ten'  // reg_school_students_g2_boys
                        )
                        .check.interaction({
                            state: 'reg_school_students_g2_boys',
                            reply: "Please provide a number value for the total number of G2 boys enrolled."
                        })
                        .run();
                });
            });
        });

        describe("after the user enters the number of g2 girls", function() {

            describe("if the number of G2 girls validates", function() {
                it("should ask if the user is a zonal head", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2',  // reg_school_teachers_g1
                            '2',  // reg_school_teachers_g2
                            '10',  // reg_school_students_g2_boys
                            '11'  // reg_school_students_g2_girls
                        )
                        .check.interaction({
                            state: 'reg_zonal_head',
                            reply: [
                                "Are you a Zonal Head Teacher?",
                                "1. Yes",
                                "2. No"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the number of G2 girls does not validate", function() {
                it("should ask for the G2 girls again", function() {
                    return tester
                        .setup.user.addr('097123')
                        .inputs(
                            'start',
                            '1',  // initial_state
                            '0001',  // reg_emis
                            '1',  // reg_emis_validates
                            'School One',  //reg_school_name
                            'Jack',  // reg_first_name
                            'Black',  // reg_surname
                            '11091980',  // reg_date_of_birth
                            '2',  // reg_gender
                            '50',  // reg_school_boys
                            '51',  // reg_school_girls
                            '5',  // reg_school_classrooms
                            '5',  // reg_school_teachers
                            '2',  // reg_school_teachers_g1
                            '2',  // reg_school_teachers_g2
                            '10',  // reg_school_students_g2_boys
                            'eleven'  // reg_school_students_g2_girls
                        )
                        .check.interaction({
                            state: 'reg_school_students_g2_girls',
                            reply: "Please provide a number value for the total number of G2 girls enrolled."
                        })
                        .run();
                });
            });
        });

        describe("after the user indicates that they ARE a zonal head", function() {
            it("should thank them and exit", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack',  // reg_first_name
                        'Black',  // reg_surname
                        '11091980',  // reg_date_of_birth
                        '2',  // reg_gender
                        '50',  // reg_school_boys
                        '51',  // reg_school_girls
                        '5',  // reg_school_classrooms
                        '5',  // reg_school_teachers
                        '2',  // reg_school_teachers_g1
                        '2',  // reg_school_teachers_g2
                        '10',  // reg_school_students_g2_boys
                        '11',  // reg_school_students_g2_girls
                        '1'  // reg_zonal_head
                    )
                    .check.interaction({
                        state: 'reg_thanks_zonal_head',
                        reply: 
                            "Well done! You are now registered as a Zonal Head " +
                            "Teacher. When you are ready, dial in to start " +
                            "reporting. You will also receive monthly SMS's from " +
                            "your zone."
                    })
                    .check.reply.ends_session()
                    .run();
            });

            it("should save contact information", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack',  // reg_first_name
                        'Black',  // reg_surname
                        '11091980',  // reg_date_of_birth
                        '2',  // reg_gender
                        '50',  // reg_school_boys
                        '51',  // reg_school_girls
                        '5',  // reg_school_classrooms
                        '5',  // reg_school_teachers
                        '2',  // reg_school_teachers_g1
                        '2',  // reg_school_teachers_g2
                        '10',  // reg_school_students_g2_boys
                        '11',  // reg_school_students_g2_girls
                        '1'  // reg_zonal_head
                    )
                    .check(function(api) {
                        var contact = api.contacts.store[0];
                        assert.equal(contact.extra.rts_id, '2');
                        assert.equal(contact.extra.rts_emis, '1');
                        assert.equal(contact.name, 'Jack');
                        assert.equal(contact.surname, 'Black');
                    })
                    .run();
            });
        });

        describe("after the user indicates that they are NOT a zonal head", function() {
            it("should ask for zonal head name", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack',  // reg_first_name
                        'Black',  // reg_surname
                        '11091980',  // reg_date_of_birth
                        '2',  // reg_gender
                        '50',  // reg_school_boys
                        '51',  // reg_school_girls
                        '5',  // reg_school_classrooms
                        '5',  // reg_school_teachers
                        '2',  // reg_school_teachers_g1
                        '2',  // reg_school_teachers_g2
                        '10',  // reg_school_students_g2_boys
                        '11',  // reg_school_students_g2_girls
                        '2'  // reg_zonal_head
                    )
                    .check.interaction({
                        state: 'reg_zonal_head_name',
                        reply: "Please enter the name and surname of your ZONAL HEAD TEACHER."
                    })
                    .run();
            });
        });

        describe("after the user enters the zonal head name", function() {
            it("should thank them and exit", function() {
                return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '1',  // initial_state
                        '0001',  // reg_emis
                        '1',  // reg_emis_validates
                        'School One',  //reg_school_name
                        'Jack',  // reg_first_name
                        'Black',  // reg_surname
                        '11091980',  // reg_date_of_birth
                        '2',  // reg_gender
                        '50',  // reg_school_boys
                        '51',  // reg_school_girls
                        '5',  // reg_school_classrooms
                        '5',  // reg_school_teachers
                        '2',  // reg_school_teachers_g1
                        '2',  // reg_school_teachers_g2
                        '10',  // reg_school_students_g2_boys
                        '11',  // reg_school_students_g2_girls
                        '2',  // reg_zonal_head
                        'Jim Carey'  // reg_zonal_head_name
                    )
                    .check.interaction({
                        state: 'reg_thanks_head_teacher',
                        reply: 
                            "Congratulations! You are now registered as a user of " +
                            "the Gateway! Please dial in again when you are ready to " +
                            "start reporting on teacher and learner performance."
                    })
                    .check.reply.ends_session()
                    .run();
            });
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


// end broken indentation to save whitespace

    });
});
