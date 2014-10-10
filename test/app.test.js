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
                })
                .setup(function(api) {
                    // registered district official
                    api.contacts.add({
                        msisdn: '+097444',
                        name: 'Pete',
                        surname: 'Yorn',
                        extra: {
                            rts_id: '444',
                            rts_district_official_id_number: '444111',
                            rts_official_district_id: '4'
                        }
                    });
                })
                .setup(function(api) {
                    // registered head teacher - zonal head
                    api.contacts.add({
                        msisdn: '+097555',
                        name: 'Regina',
                        surname: 'Spektor',
                        extra: {
                            rts_id: '555',
                            rts_emis: '45',
                            is_zonal_head: 'true'
                        }
                    });
                })
                .setup(function(api) {
                    // registered head teacher - not zonal head
                    api.contacts.add({
                        msisdn: '+097888',
                        name: 'Jon',
                        surname: 'Foreman',
                        extra: {
                            rts_id: '888',
                            rts_emis: '777',
                            is_zonal_head: 'false'
                        }
                    });
                });
        });


// start broken indentation to save whitespace


// REGISTRATION
// ------------

// uu = unregistered user

describe.skip("when an unregistered user logs on", function() {

    describe("when uu starts a session", function() {
        it("should ask them want they want to do", function() {
            return tester
                .setup.user.addr('097123')
                .inputs('start')
                .check.interaction({
                    state: 'initial_state_unregistered',
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
                        var contact = api.contacts.store[3];
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
                            var contact = api.contacts.store[3];
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


    // CHANGE SCHOOL
    // -------------

    describe("when uu chooses to change their school", function() {
        it("should tell them to associate their number with EMIS first", function() {
            return tester
                .setup.user.addr('097123')
                .inputs(
                    'start',
                    '3'  // initial_state
                )
                .check.interaction({
                    state: 'manage_change_emis_error',
                    reply: [
                        "Your cell phone number is unrecognised. Please associate your new " +
                        "number with your old EMIS first before requesting to change school.",
                        "1. Main menu.",
                        "2. Exit."
                    ].join("\n")
                })
                .run();
        });

        describe("after seeing the associate EMIS message", function() {

            describe("if they choose main menu", function() {
                it("should go back to initial state", function() {
                    return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '3',  // initial_state
                        '1'  // manage_change_emis_error
                    )
                    .check.interaction({
                        state: 'initial_state_unregistered',
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

            describe("if they choose to exit", function() {
                it("should thank them and exit", function() {
                    return tester
                    .setup.user.addr('097123')
                    .inputs(
                        'start',
                        '3',  // initial_state
                        '2'  // manage_change_emis_error
                    )
                    .check.interaction({
                        state: 'end_state',
                        reply: "Goodbye! Thank you for using the Gateway.",
                    })
                    .check.reply.ends_session()
                    .run();
                });
            });

        });
    });


    // CHANGE CELLPHONE NUMBER
    // -----------------------

    describe("when uu chooses to change their cell number", function() {
        it("should ask them for their school's EMIS number", function() {
            return tester
                .setup.user.addr('097666')
                .inputs(
                    'start',
                    '4'  // initial_state
                )
                .check.interaction({
                    state: 'manage_change_msisdn_emis',
                    reply:
                        "Please enter the school's EMIS number that you are currently " +
                        "registered with. This should have 4-6 digits e.g 4351.",
                })
                .run();
        });

        describe("after entering an EMIS number", function() {

            describe("if emis validates", function() {
                it("should thank them and exit", function() {
                    return tester
                        .setup.user.addr('097666')
                        .inputs(
                            'start',
                            '4',  // initial_state
                            '1'  // manage_change_msisdn_emis
                        )
                        .check.interaction({
                            state: 'manage_change_msisdn_emis_validates',
                            reply:
                                "Thank you! Your cell phone number is now the official number " +
                                "that your school will use to communicate with the Gateway."
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once", function() {
                it("should ask if they want to try again or exit", function() {
                    return tester
                        .setup.user.addr('097666')
                        .inputs(
                            'start',
                            '4',  // initial_state
                            '000A'  // manage_change_msisdn_emis
                        )
                        .check.interaction({
                            state: 'manage_change_msisdn_emis_retry_exit',
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
                        .setup.user.addr('097666')
                        .inputs(
                            'start',
                            '4',  // initial_state
                            '000A',  // manage_change_msisdn_emis
                            '2'  // manage_change_msisdn_emis_retry_exit
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
                        .setup.user.addr('097666')
                        .inputs(
                            'start',
                            '4',  // initial_state
                            '000A',  // manage_change_msisdn_emis
                            '1'  // manage_change_msisdn_emis_retry_exit
                        )
                        .check.interaction({
                            state: 'manage_change_msisdn_emis',
                            reply:
                                "Please enter the school's EMIS number that you are currently " +
                                "registered with. This should have 4-6 digits e.g 4351."
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once and then a valid emis", function() {
                it("should thank and instruct them to redial on num change", function() {
                    return tester
                        .setup.user.addr('097666')
                        .inputs(
                            'start',
                            '4',  // initial_state
                            '000A',  // manage_change_msisdn_emis
                            '1',  // manage_change_msisdn_emis_retry_exit
                            '0001'
                        )
                        .check.interaction({
                            state: 'manage_change_msisdn_emis_validates',
                            reply:
                                "Thank you! Your cell phone number is now the official number " +
                                "that your school will use to communicate with the Gateway."
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code twice", function() {
                it("should instruct to send sms and exit", function() {
                    return tester
                        .setup.user.addr('097666')
                        .inputs(
                            'start',
                            '4',  // initial_state
                            '000A',  // manage_change_msisdn_emis
                            '1',  // manage_change_msisdn_emis_retry_exit
                            '000B'
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
                    state: 'initial_state_district_official',
                    reply: [
                        'What would you like to do?',
                        '1. Report on teacher performance.',
                        '2. Report on learner performance.',
                        '3. Report on a school monitoring visit.'
                    ].join('\n')
                })
                .run();
        });
    });

    describe("when the registered user is a head teacher and a zonal head", function() {
        it("should ask them what they want to do", function() {
            return tester
                .setup.user.addr('097555')
                .inputs('start')
                .check.interaction({
                    state: 'initial_state_zonal_head',
                    reply: [
                        'Welcome to Zambia School Gateway!',
                        '1. Report on teachers',
                        '2. Report on learners',
                        '3. Report on school monitoring visit',
                        '4. Change my school',
                        "5. Update my school data"
                    ].join('\n')
                })
                .run();
        });
    });

    describe("when the registered user is a head teacher and not a zonal head", function() {
        it("should ask them what they want to do", function() {
            return tester
                .setup.user.addr('097888')
                .inputs('start')
                .check.interaction({
                    state: 'initial_state_head_teacher',
                    reply: [
                        'What would you like to do?',
                        '1. Report on teacher performance.',
                        '2. Report on learner performance.',
                        '3. Change my school.',
                        "4. Update my school's registration data."
                    ].join('\n')
                })
                .run();
        });
    });


    // TEACHER PERFORMANCE MONITORING
    // ------------------------------

    describe.skip("when the user chooses to report on teacher performance", function() {
        describe("if the user is a district official", function() {
            it("should ask for an emis code", function() {
                return tester
                    .setup.user.addr('097444')
                    .inputs(
                        'start',
                        '1'  // initial_state_district_official
                    )
                    .check.interaction({
                        state: 'add_emis_perf_teacher_ts_number',
                        reply:
                            "Please enter the school's EMIS number that you would like " +
                            "to report on. This should have 4-6 digits e.g 4351."
                    })
                    .run();
            });

            describe("when the district official user enters an emis", function() {

                describe("if the emis does not validate", function() {
                    it("should ask for the emis again", function() {
                        return tester
                            .setup.user.addr('097444')
                            .inputs(
                                'start',
                                '1',  // initial_state_district_official
                                '5555555'  // add_emis_perf_teacher_ts_number
                            )
                            .check.interaction({
                                state: 'add_emis_perf_teacher_ts_number',
                                reply:
                                    "The emis does not exist, please try again. This " +
                                    "should have 4-6 digits e.g 4351."
                            })
                            .run();
                    });
                });

                describe("if the emis validates", function() {
                    it("should ask for the teacher's TS number", function() {
                        return tester
                            .setup.user.addr('097444')
                            .inputs(
                                'start',
                                '1',  // initial_state_district_official
                                '0001'  // add_emis_perf_teacher_ts_number
                            )
                            .check.interaction({
                                state: 'perf_teacher_ts_number',
                                reply:
                                    "Please enter the teacher's TS number."
                            })
                            .run();
                    });

                    it("should save the emis to the district official user's contact", function() {
                        return tester
                            .setup.user.addr('097444')
                            .inputs(
                                'start',
                                '1',  // initial_state_district_official
                                '0001'  // add_emis_perf_teacher_ts_number
                            )
                            .check(function(api) {
                                var contact = api.contacts.store[0];
                                assert.equal(contact.extra.rts_emis, '0001');
                            })
                            .run();
                    });
                });

            });

            // test one full registration as a district official
            describe("when the district official user completes a successful report", function() {
                it("should ask what they want to do", function() {
                    return tester
                        .setup.user.addr('097444')
                        .inputs(
                            'start',
                            '1',  // initial_state_district_official
                            '0001',  // add_emis_perf_teacher_ts_number
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3',  // perf_teacher_academic_level
                            '1',  // perf_teacher_years_experience
                            '40',  // perf_teacher_g2_pupils_present
                            '50',  // perf_teacher_g2_pupils_registered
                            '8',  // perf_teacher_classroom_environment_score
                            '7',  // perf_teacher_t_l_materials
                            '90',  // perf_teacher_pupils_books_number
                            '6',  // perf_teacher_pupils_materials_score
                            '14',  // perf_teacher_reading_lesson
                            '17',  // perf_teacher_pupil_engagement_score
                            '16',  // perf_teacher_attitudes_and_beliefs
                            '3',  // perf_teacher_training_subtotal
                            '10',  // perf_teacher_reading_assessment
                            '9'  // perf_teacher_reading_total
                        )
                        .check.interaction({
                            state: 'perf_teacher_completed',
                            reply: [
                                "Congratulations, you have finished reporting on this teacher.",
                                "1. Add another teacher.",
                                "2. Go back to the main menu.",
                                "3. Exit."
                            ].join('\n')
                        })
                        .run();
                });
            });

        });

        describe("if the user is a head teacher", function() {
            it("should ask for teacher TS number", function() {
                return tester
                    .setup.user.addr('097555')
                    .inputs(
                        'start',
                        '1'  // initial_state_head_teacher
                    )
                    .check.interaction({
                        state: 'perf_teacher_ts_number',
                        reply:
                            "Please enter the teacher's TS number."
                    })
                    .run();
            });

            // test step by step flow as a head teacher

            // ts number
            describe("when the user enters TS number", function() {

                describe("if the number validates", function() {
                    it("should ask for teacher gender", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106'  // perf_teacher_ts_number
                            )
                            .check.interaction({
                                state: 'perf_teacher_gender',
                                reply: [
                                    "What is the gender of the teacher?",
                                    "1. Male",
                                    "2. Female"
                                ].join('\n')
                            })
                            .run();
                    });
                });

                describe("if the number does not validate", function() {
                    it("should ask for TS number again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                'hundreed'  // perf_teacher_ts_number
                            )
                            .check.interaction({
                                state: 'perf_teacher_ts_number',
                                reply:
                                    "Please provide a valid number value for the teacher's " +
                                    "TS number."
                            })
                            .run();
                    });
                });
            });

            // gender
            describe("when the user enters gender", function() {
                it("should ask for the teacher's age", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2'  // perf_teacher_gender
                        )
                        .check.interaction({
                            state: 'perf_teacher_age',
                            reply:
                                "Please enter the teacher's age in years e.g. 26."
                        })
                        .run();
                });
            });

            // age
            describe("when the user enters teacher age", function() {

                describe("if the age validates", function() {
                    it("should ask for teacher academic level", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30'  // perf_teacher_age
                            )
                            .check.interaction({
                                state: 'perf_teacher_academic_level',
                                reply: [
                                    "What is the teacher's highest education level?",
                                    "1. Gr 7",
                                    "2. Gr 9",
                                    "3. Gr 12",
                                    "4. PTC",
                                    "5. PTD",
                                    "6. Dip Ed",
                                    "7. Other diploma",
                                    "8. BA Degree",
                                    "9. MA Degree",
                                    "10. Other"
                                ].join('\n')
                            })
                            .run();
                    });
                });

                describe("if the age is too low", function() {
                    it("should ask for age again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '19'  // perf_teacher_age
                            )
                            .check.interaction({
                                state: 'perf_teacher_age',
                                reply:
                                    "Please provide a valid number value for the teacher's age."
                            })
                            .run();
                    });
                });

                describe("if the age is too high", function() {
                    it("should ask for age again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '76'  // perf_teacher_age
                            )
                            .check.interaction({
                                state: 'perf_teacher_age',
                                reply:
                                    "Please provide a valid number value for the teacher's age."
                            })
                            .run();
                    });
                });
            });

            // academic level
            describe("when the user enters academic level", function() {
                it("should ask for teacher's years experience", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3'  // perf_teacher_academic_level
                        )
                        .check.interaction({
                            state: 'perf_teacher_years_experience',
                            reply: [
                                "How many years of teaching experience does this teacher have?",
                                "1. 0 - 3 years",
                                "2. 4 - 8 years",
                                "3. 9 - 12 years",
                                "4. 13 years or more"
                            ].join('\n')
                        })
                        .run();
                });
            });

            // years experience
            describe("when the user enters years of experience", function() {
                it("should ask for number of children present", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3',  // perf_teacher_academic_level
                            '1'  // perf_teacher_years_experience
                        )
                        .check.interaction({
                            state: 'perf_teacher_g2_pupils_present',
                            reply:
                                "How many children were PRESENT during the observed lesson?"
                        })
                        .run();
                });
            });

            // children present
            describe("when the user enters number of children present", function() {
                it("should ask for number of children enrolled", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3',  // perf_teacher_academic_level
                            '1',  // perf_teacher_years_experience
                            '40'  // perf_teacher_g2_pupils_present
                        )
                        .check.interaction({
                            state: 'perf_teacher_g2_pupils_registered',
                            reply:
                                "How many children are ENROLLED in the Grade 2 class that " +
                                "was observed?"
                        })
                        .run();
                });
            });

            // children enrolled
            describe("when the user enters number of children enrolled", function() {
                it("should ask for number of children enrolled", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3',  // perf_teacher_academic_level
                            '1',  // perf_teacher_years_experience
                            '40',  // perf_teacher_g2_pupils_present
                            '50'  // perf_teacher_g2_pupils_registered
                        )
                        .check.interaction({
                            state: 'perf_teacher_classroom_environment_score',
                            reply:
                                "Enter the subtotal that the teacher achieved during the " +
                                "classroom observation for Section 2 (Classroom Environment)."
                        })
                        .run();
                });
            });

            // environment score
            describe("when the user enters environment score", function() {

                describe("if the environment score validates", function() {
                    it("should ask for T&L Materials score", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8'  // perf_teacher_classroom_environment_score
                            )
                            .check.interaction({
                                state: 'perf_teacher_t_l_materials',
                                reply:
                                    "Enter the subtotal that the teacher achieved during the classroom " +
                                    "observation for Section 3 (Teaching and Learning Materials).",
                            })
                            .run();
                    });
                });

                describe("if the environment score is too high", function() {
                    it("should ask for environment score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '9'  // perf_teacher_classroom_environment_score
                            )
                            .check.interaction({
                                state: 'perf_teacher_classroom_environment_score',
                                reply:
                                    "Please provide a valid number value for the Classroom " +
                                    "Environment subtotal."
                            })
                            .run();
                    });
                });
            });

            // tl materials score
            describe("when the user enters tl materials score", function() {

                describe("if the tl materials score validates", function() {
                    it("should ask for number of text books", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7'  // perf_teacher_t_l_materials
                            )
                            .check.interaction({
                                state: 'perf_teacher_pupils_books_number',
                                reply:
                                    "Enter the number of learners' books (text books) for " +
                                    "literacy that were available in the classroom during the " +
                                    "lesson observation.",
                            })
                            .run();
                    });
                });

                describe("if the tl materials score is too high", function() {
                    it("should ask for tl materials score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '8'  // perf_teacher_t_l_materials
                            )
                            .check.interaction({
                                state: 'perf_teacher_t_l_materials',
                                reply:
                                    "Please provide a valid number value for the Teaching and " +
                                    "Learning Materials subtotal."
                            })
                            .run();
                    });
                });
            });

            // number of books
            describe("when the user enters number of books", function() {
                it("should ask for pupils materials score", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3',  // perf_teacher_academic_level
                            '1',  // perf_teacher_years_experience
                            '40',  // perf_teacher_g2_pupils_present
                            '50',  // perf_teacher_g2_pupils_registered
                            '8',  // perf_teacher_classroom_environment_score
                            '7',  // perf_teacher_t_l_materials
                            '90'  // perf_teacher_pupils_books_number
                        )
                        .check.interaction({
                            state: 'perf_teacher_pupils_materials_score',
                            reply:
                                "Enter the subtotal that the teacher achieved during the " +
                                "classroom observation for Section 4 (Learner Materials)."
                        })
                        .run();
                });
            });

            // pupils materials score
            describe("when the user enters pupils materials score", function() {

                describe("if the pupils materials score validates", function() {
                    it("should ask for pupil reading score", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6'  // perf_teacher_pupils_materials_score
                            )
                            .check.interaction({
                                state: 'perf_teacher_reading_lesson',
                                reply:
                                    "Enter the subtotal that the teacher achieved during the " +
                                    "classroom observation for Section 5 (Time on Task and " +
                                    "Reading Practice)"
                            })
                            .run();
                    });
                });

                describe("if the pupils materials score is too high", function() {
                    it("should ask for pupils materials score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '7'  // perf_teacher_pupils_materials_score
                            )
                            .check.interaction({
                                state: 'perf_teacher_pupils_materials_score',
                                reply:
                                    "Please provide a valid number value for the Learner " +
                                    "Materials subtotal."
                            })
                            .run();
                    });
                });
            });

            // pupils reading score
            describe("when the user enters pupils reading score", function() {

                describe("if the pupils reading score validates", function() {
                    it("should ask for pupil engagement score", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14'  // perf_teacher_reading_lesson
                            )
                            .check.interaction({
                                state: 'perf_teacher_pupil_engagement_score',
                                reply:
                                    "Enter the subtotal that the teacher achieved during the " +
                                    "classroom observation for Section 6 (Learner Engagement)",
                            })
                            .run();
                    });
                });

                describe("if the pupils reading score is too high", function() {
                    it("should ask for pupils reading score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '15'  // perf_teacher_reading_lesson
                            )
                            .check.interaction({
                                state: 'perf_teacher_reading_lesson',
                                reply:
                                    "Please provide a valid number value for the Time on Task " +
                                    "and Reading Practice subtotal."
                            })
                            .run();
                    });
                });
            });

            // pupils engagement score
            describe("when the user enters pupils engagement score", function() {

                describe("if the pupils engagement score validates", function() {
                    it("should ask for attitudes & beliefs score", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17'  // perf_teacher_pupil_engagement_score
                            )
                            .check.interaction({
                                state: 'perf_teacher_attitudes_and_beliefs',
                                reply:
                                    "Enter the subtotal that the teacher achieved during the " +
                                    "interview on Section 7.1. (Teacher Attitudes and Beliefs)",
                            })
                            .run();
                    });
                });

                describe("if the pupils engagement score is too high", function() {
                    it("should ask for pupils engagement score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '18'  // perf_teacher_pupil_engagement_score
                            )
                            .check.interaction({
                                state: 'perf_teacher_pupil_engagement_score',
                                reply:
                                    "Please provide a valid number value for the Learner " +
                                    "Engagement subtotal."
                            })
                            .run();
                    });
                });
            });

            // teacher attitudes and beliefs
            describe("when the user enters teacher attitudes and beliefs score", function() {

                describe("if the attitudes and beliefs score validates", function() {
                    it("should ask for teacher training score", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16'  // perf_teacher_attitudes_and_beliefs
                            )
                            .check.interaction({
                                state: 'perf_teacher_training_subtotal',
                                reply:
                                    "Enter the subtotal that the teacher achieved during the " +
                                    "interview on Section 7.2. (Teacher Training)",
                            })
                            .run();
                    });
                });

                describe("if the teacher attitudes and beliefs score is too high", function() {
                    it("should ask for teacher attitudes and beliefs score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '17'  // perf_teacher_attitudes_and_beliefs
                            )
                            .check.interaction({
                                state: 'perf_teacher_attitudes_and_beliefs',
                                reply:
                                    "Please provide a valid number value for the Teacher " +
                                    "Attitudes and Beliefs subtotal."
                            })
                            .run();
                    });
                });
            });

            // teacher training score
            describe("when the user enters teacher training score", function() {

                describe("if the teacher training score validates", function() {
                    it("should ask for teacher reading assessment score", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '3'  // perf_teacher_training_subtotal
                            )
                            .check.interaction({
                                state: 'perf_teacher_reading_assessment',
                                reply:
                                    "Enter the subtotal that the teacher achieved during the " +
                                    "interview on Section 7.3. (Reading Assessment).",
                            })
                            .run();
                    });
                });

                describe("if the teacher training score is too high", function() {
                    it("should ask for teacher training score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '4'  // perf_teacher_training_subtotal
                            )
                            .check.interaction({
                                state: 'perf_teacher_training_subtotal',
                                reply:
                                    "Please provide a valid number value for the Teacher " +
                                    "Training interview subtotal."
                            })
                            .run();
                    });
                });
            });

            // teacher reading assessment
            describe("when the user enters teacher reading assessment score", function() {

                describe("if the teacher reading assessment score validates", function() {
                    it("should ask for number of reading pupils", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '3',  // perf_teacher_training_subtotal
                                '10'  // perf_teacher_reading_assessment
                            )
                            .check.interaction({
                                state: 'perf_teacher_reading_total',
                                reply:
                                    "According to your assessment records, how many of the " +
                                    "pupils in the class that was observed have broken " +
                                    "through/can read?",
                            })
                            .run();
                    });
                });

                describe("if the teacher reading assessment score is too high", function() {
                    it("should ask for teacher reading assessment score again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '3',  // perf_teacher_training_subtotal
                                '11'  // perf_teacher_reading_assessment
                            )
                            .check.interaction({
                                state: 'perf_teacher_reading_assessment',
                                reply:
                                    "Please provide a valid number value for the Reading " +
                                    "Assessment subtotal."
                            })
                            .run();
                    });
                });
            });

            // teacher reading assessment
            describe("when the user enters number of reading pupils", function() {
                it("should congratulate them and ask them what they want to do", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '1',  // initial_state_head_teacher
                            '106',  // perf_teacher_ts_number
                            '2',  // perf_teacher_gender
                            '30',  // perf_teacher_age
                            '3',  // perf_teacher_academic_level
                            '1',  // perf_teacher_years_experience
                            '40',  // perf_teacher_g2_pupils_present
                            '50',  // perf_teacher_g2_pupils_registered
                            '8',  // perf_teacher_classroom_environment_score
                            '7',  // perf_teacher_t_l_materials
                            '90',  // perf_teacher_pupils_books_number
                            '6',  // perf_teacher_pupils_materials_score
                            '14',  // perf_teacher_reading_lesson
                            '17',  // perf_teacher_pupil_engagement_score
                            '16',  // perf_teacher_attitudes_and_beliefs
                            '3',  // perf_teacher_training_subtotal
                            '10',  // perf_teacher_reading_assessment
                            '9'  // perf_teacher_reading_total
                        )
                        .check.interaction({
                            state: 'perf_teacher_completed',
                            reply: [
                                "Congratulations, you have finished reporting on this teacher.",
                                "1. Add another teacher.",
                                "2. Go back to the main menu.",
                                "3. Exit."
                            ].join('\n')
                        })
                        .run();
                });
            });

            // after completion
            describe("when the user has completed the report", function() {

                describe("if they choose to report on another teacher", function() {
                    it("should ask for the teacher TS number", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '3',  // perf_teacher_training_subtotal
                                '10',  // perf_teacher_reading_assessment
                                '9',  // perf_teacher_reading_total
                                '1'  // perf_teacher_completed
                            )
                            .check.interaction({
                                state: 'perf_teacher_ts_number',
                                reply:
                                    "Please enter the teacher's TS number."
                            })
                            .run();
                    });
                });

                describe("if they choose to go to the main menu", function() {
                    it("should ask what the want to do", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '3',  // perf_teacher_training_subtotal
                                '10',  // perf_teacher_reading_assessment
                                '9',  // perf_teacher_reading_total
                                '2'  // perf_teacher_completed
                            )
                            .check.interaction({
                                state: 'initial_state_zonal_head',
                                reply: [
                                    'Welcome to Zambia School Gateway!',
                                    '1. Report on teachers',
                                    '2. Report on learners',
                                    '3. Report on school monitoring visit',
                                    '4. Change my school',
                                    "5. Update my school data"
                                ].join('\n')
                            })
                            .run();
                    });
                });

                describe("if they choose to exit", function() {
                    it("should thank them and exit", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '1',  // initial_state_head_teacher
                                '106',  // perf_teacher_ts_number
                                '2',  // perf_teacher_gender
                                '30',  // perf_teacher_age
                                '3',  // perf_teacher_academic_level
                                '1',  // perf_teacher_years_experience
                                '40',  // perf_teacher_g2_pupils_present
                                '50',  // perf_teacher_g2_pupils_registered
                                '8',  // perf_teacher_classroom_environment_score
                                '7',  // perf_teacher_t_l_materials
                                '90',  // perf_teacher_pupils_books_number
                                '6',  // perf_teacher_pupils_materials_score
                                '14',  // perf_teacher_reading_lesson
                                '17',  // perf_teacher_pupil_engagement_score
                                '16',  // perf_teacher_attitudes_and_beliefs
                                '3',  // perf_teacher_training_subtotal
                                '10',  // perf_teacher_reading_assessment
                                '9',  // perf_teacher_reading_total
                                '3'  // perf_teacher_completed
                            )
                            .check.interaction({
                                state: 'end_state',
                                reply:
                                    "Goodbye! Thank you for using the Gateway."
                            })
                            .check.reply.ends_session()
                            .run();
                    });
                });

            });
        });
    });


    // LEARNER PERFORMANCE MONITORING
    // ------------------------------

    describe.skip("when the user chooses to report on learner performance", function() {

        describe("if the user is a district official", function() {
            it("should ask for an emis code", function() {
                return tester
                    .setup.user.addr('097444')
                    .inputs(
                        'start',
                        '2'  // initial_state_district_official
                    )
                    .check.interaction({
                        state: 'add_emis_perf_learner_boys_total',
                        reply:
                            "Please enter the school's EMIS number that you would like " +
                            "to report on. This should have 4-6 digits e.g 4351."
                    })
                    .run();
            });

            describe("when the district official user enters an emis", function() {

                describe("if the emis does not validate", function() {
                    it("should ask for the emis again", function() {
                        return tester
                            .setup.user.addr('097444')
                            .inputs(
                                'start',
                                '2',  // initial_state_district_official
                                '5555555'  // add_emis_perf_learner_boys_total
                            )
                            .check.interaction({
                                state: 'add_emis_perf_learner_boys_total',
                                reply:
                                    "The emis does not exist, please try again. This " +
                                    "should have 4-6 digits e.g 4351."
                            })
                            .run();
                    });
                });

                describe("if the emis validates", function() {
                    it("should ask for boys total", function() {
                        return tester
                            .setup.user.addr('097444')
                            .inputs(
                                'start',
                                '2',  // initial_state_district_official
                                '0001'  // add_emis_perf_learner_boys_total
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_total',
                                reply:
                                    "How many boys took part in the learner assessment?"
                            })
                            .run();
                    });

                    it("should save the emis to the district official user's contact", function() {
                        return tester
                            .setup.user.addr('097444')
                            .inputs(
                                'start',
                                '2',  // initial_state_district_official
                                '0001'  // add_emis_perf_learner_boys_total
                            )
                            .check(function(api) {
                                var contact = api.contacts.store[0];
                                assert.equal(contact.extra.rts_emis, '0001');
                            })
                            .run();
                    });
                });

            });

            // test one full registration as a district official to check data saving
            describe("when the district official user completes a successful report", function() {
                it("should ask if they want to return to main menu or exit", function() {
                    return tester
                        .setup.user.addr('097444')
                        .inputs(
                            'start',
                            '2',  // initial_state_district_official
                            '0001',  // add_emis_perf_learner_boys_total
                            '52', // perf_learner_boys_total
                            '10',  // perf_learner_boys_outstanding
                            '15',  // perf_learner_boys_desirable
                            '20',  // perf_learner_boys_minimum
                            '7',  // perf_learner_boys_below_minimum
                            '49',  // perf_learner_girls_total
                            '10',  // perf_learner_girls_outstanding
                            '15',  // perf_learner_girls_desirable
                            '20',  // perf_learner_girls_minimum
                            '4',  // perf_learner_girls_below_minimum
                            '31',  // perf_learner_boys_phonics
                            '32',  // perf_learner_girls_phonics
                            '33',  // perf_learner_boys_vocab
                            '34',  // perf_learner_girls_vocab
                            '35',  // perf_learner_boys_comprehension
                            '36',  // perf_learner_girls_comprehension
                            '37',  // perf_learner_boys_writing
                            '38'  // perf_learner_girls_writing
                        )
                        .check.interaction({
                            state: 'perf_learner_completed',
                            reply: [
                                "Congratulations. You have finished reporting on the learner assessment.",
                                "1. Go back to the main menu.",
                                "2. Exit."
                            ].join('\n')
                        })
                        .run();
                });
            });

        });

        describe("if the user is a head teacher", function() {
            it("should ask for boys total", function() {
                return tester
                    .setup.user.addr('097555')
                    .inputs(
                        'start',
                        '2'  // initial_state_head_teacher
                    )
                    .check.interaction({
                        state: 'perf_learner_boys_total',
                        reply:
                            "How many boys took part in the learner assessment?"
                    })
                    .run();
            });

            // test step by step flow as a head teacher

            // boys total
            describe("when the user enters boys total", function() {

                describe("if the number validates", function() {
                    it("should ask for boys outstanding results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52'  // perf_learner_boys_total
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_outstanding',
                                reply:
                                    "In total, how many boys achieved 16 out of 20 or more?"
                            })
                            .run();
                    });
                });

                // test for numeric value
                describe("if the number does not validate", function() {
                    it("should ask for boys total again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                'fifty-two'  // perf_learner_boys_total
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_total',
                                reply:
                                    "Please provide a number value for total boys assessed."
                            })
                            .run();
                    });
                });
            });


            // boys outstanding
            describe("when the user enters boys outstanding results", function() {

                describe("if the number validates", function() {
                    it("should ask for boys desirable results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10'  // perf_learner_boys_outstanding
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_desirable',
                                reply:
                                    "In total, how many boys achieved between 12 and 15 out of 20?"
                            })
                            .run();
                    });
                });

                describe("if boys outstanding results > boys total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '60'  // perf_learner_boys_outstanding
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_calc_error',
                                reply: [
                                    "You've entered results for 60 boys (60), but " +
                                    "you initially indicated 52 boys participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });

                    it("should go back to boys total upon choosing to continue", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '60',  // perf_learner_boys_outstanding
                                '1'  // perf_learner_boys_calc_error
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_total',
                                reply:
                                    "How many boys took part in the learner assessment?"
                            })
                            .run();
                    });
                });
            });

            // boys desirable
            describe("when the user enters boys desirable results", function() {

                describe("if the number validates", function() {
                    it("should ask for boys minimum results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15'  // perf_learner_boys_desirable
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_minimum',
                                reply:
                                    "In total, how many boys achieved between 8 and 11 out of 20?"
                            })
                            .run();
                    });
                });

                describe("if boys outstanding + desirable > boys total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '50'  // perf_learner_boys_desirable
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_calc_error',
                                reply: [
                                    "You've entered results for 60 boys (10+50), but " +
                                    "you initially indicated 52 boys participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });

                    it("should go back to boys total upon choosing to continue", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '50',  // perf_learner_boys_desirable
                                '1'  // perf_learner_boys_calc_error
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_total',
                                reply:
                                    "How many boys took part in the learner assessment?"
                            })
                            .run();
                    });
                });
            });

            // boys minimum
            describe("when the user enters boys minimum results", function() {

                describe("if the number validates", function() {
                    it("should ask for boys below minimum results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20'  // perf_learner_boys_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_below_minimum',
                                reply:
                                    "In total, how many boys achieved between 0 and 7 out of 20?"
                            })
                            .run();
                    });
                });

                // test for numeric value
                describe("if the number does not validate", function() {
                    it("should ask for boys minimum results again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                'twenty'  // perf_learner_boys_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_minimum',
                                reply:
                                    "Please provide a valid number value for total boys achieving between 8 and 11 " +
                                    "out of 20."
                            })
                            .run();
                    });
                });

                describe("if boys outstanding + desirable + minimum > boys total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '35'  // perf_learner_boys_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_calc_error',
                                reply: [
                                    "You've entered results for 60 boys (10+15+35), but " +
                                    "you initially indicated 52 boys participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });
                });
            });

            // boys below minimum
            describe("when the user enters boys below minimum results", function() {

                describe("if the number validates", function() {
                    it("should ask for girls total", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7'  // perf_learner_boys_below_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_total',
                                reply:
                                    "How many girls took part in the learner assessment?"
                            })
                            .run();
                    });
                });

                describe("if boys outstanding + desirable + minimum + below minimum > boys total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '10'  // perf_learner_boys_below_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_calc_error',
                                reply: [
                                    "You've entered results for 55 boys (10+15+20+10), but " +
                                    "you initially indicated 52 boys participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });
                });

                describe("if boys outstanding + desirable + minimum + below minimum < boys total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '5'  // perf_learner_boys_below_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_calc_error',
                                reply: [
                                    "You've entered results for 50 boys (10+15+20+5), but " +
                                    "you initially indicated 52 boys participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });
                });
            });


            // girls total
            describe("when the user enters girls total", function() {

                describe("if the number validates", function() {
                    it("should ask for girls outstanding results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49'  // perf_learner_girls_total
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_outstanding',
                                reply:
                                    "In total, how many girls achieved 16 out of 20 or more?"
                            })
                            .run();
                    });
                });
            });


            // girls outstanding
            describe("when the user enters girls outstanding results", function() {

                describe("if the number validates", function() {
                    it("should ask for girls desirable results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10'  // perf_learner_girls_outstanding
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_desirable',
                                reply:
                                    "In total, how many girls achieved between 12 and 15 out of 20?"
                            })
                            .run();
                    });
                });

                describe("if girls outstanding results > girls total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '60'  // perf_learner_girls_outstanding
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_calc_error',
                                reply: [
                                    "You've entered results for 60 girls (60), but " +
                                    "you initially indicated 49 girls participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });

                    it("should go back to girls total upon choosing to continue", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '60',  // perf_learner_girls_outstanding
                                '1'  // perf_learner_girls_calc_error
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_total',
                                reply:
                                    "How many girls took part in the learner assessment?"
                            })
                            .run();
                    });
                });
            });

            // girls desirable
            describe("when the user enters girls desirable results", function() {

                describe("if the number validates", function() {
                    it("should ask for girls minimum results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15'  // perf_learner_girls_desirable
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_minimum',
                                reply:
                                    "In total, how many girls achieved between 8 and 11 out of 20?"
                            })
                            .run();
                    });
                });

                describe("if girls outstanding + desirable > girls total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '50'  // perf_learner_girls_desirable
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_calc_error',
                                reply: [
                                    "You've entered results for 60 girls (10+50), but " +
                                    "you initially indicated 49 girls participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });

                    it("should go back to girls total upon choosing to continue", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '50',  // perf_learner_girls_desirable
                                '1'  // perf_learner_girls_calc_error
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_total',
                                reply:
                                    "How many girls took part in the learner assessment?"
                            })
                            .run();
                    });
                });
            });

            // girls minimum
            describe("when the user enters girls minimum results", function() {

                describe("if the number validates", function() {
                    it("should ask for girls below minimum results", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20'  // perf_learner_girls_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_below_minimum',
                                reply:
                                    "In total, how many girls achieved between 0 and 7 out of 20?"
                            })
                            .run();
                    });
                });

                describe("if girls outstanding + desirable + minimum > girls total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '35'  // perf_learner_girls_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_calc_error',
                                reply: [
                                    "You've entered results for 60 girls (10+15+35), but " +
                                    "you initially indicated 49 girls participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });
                });
            });

            // girls below minimum
            describe("when the user enters girls below minimum results", function() {

                describe("if the number validates", function() {
                    it("should ask for boys phonics", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4'  // perf_learner_girls_below_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_phonics',
                                reply:
                                    "How many boys scored 4 or more correctly out of 6 for Section " +
                                    "1 (Phonics and Phonemic Awareness)?"
                            })
                            .run();
                    });
                });

                describe("if girls outstanding + desirable + minimum + below minimum > girls total", function() {
                    it("should display error message", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '10'  // perf_learner_girls_below_minimum
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_calc_error',
                                reply: [
                                    "You've entered results for 55 girls (10+15+20+10), but " +
                                    "you initially indicated 49 girls participants. Please try again.",
                                    "1. Continue"
                                ].join('\n')
                            })
                            .run();
                    });
                });

                describe("if girls outstanding + desirable + minimum + below minimum < girls total", function() {
                    it("should display error message", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '2',  // initial_state_head_teacher
                            '52', // perf_learner_boys_total
                            '10',  // perf_learner_boys_outstanding
                            '15',  // perf_learner_boys_desirable
                            '20',  // perf_learner_boys_minimum
                            '7',  // perf_learner_boys_below_minimum
                            '49',  // perf_learner_girls_total
                            '10',  // perf_learner_girls_outstanding
                            '15',  // perf_learner_girls_desirable
                            '20',  // perf_learner_girls_minimum
                            '1'  // perf_learner_girls_below_minimum
                        )
                        .check.interaction({
                            state: 'perf_learner_girls_calc_error',
                            reply: [
                                "You've entered results for 46 girls (10+15+20+1), but " +
                                "you initially indicated 49 girls participants. Please try again.",
                                "1. Continue"
                            ].join('\n')
                        })
                        .run();
                    });
                });
            });


            // boys phonics
            describe("when the user enters boys phonics result", function() {

                describe("if the number validates", function() {
                    it("should ask for girls phonics result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31'  // perf_learner_boys_phonics
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_phonics',
                                reply:
                                    "How many girls scored 4 or more correctly out of 6 for Section " +
                                    "1 (Phonics and Phonemic Awareness)?"
                            })
                            .run();
                    });
                });

                describe("if the entry is not a number", function() {
                    it("should ask for boys phonics again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                'lots'  // perf_learner_boys_phonics
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_phonics',
                                reply:
                                    "Please provide a valid number value for total boys scoring 4 or more" +
                                    " correctly out of 6 for Phonics and Phonemic Awareness."
                            })
                            .run();
                    });
                });

                describe("if boys phonics result > boys total", function() {
                    it("should ask for boys phonics again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '53'  // perf_learner_boys_phonics
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_phonics',
                                reply:
                                    "Please provide a valid number value for total boys scoring 4 or more" +
                                    " correctly out of 6 for Phonics and Phonemic Awareness."
                            })
                            .run();
                    });
                });
            });

            // girls phonics
            describe("when the user enters girls phonics result", function() {

                describe("if the number validates", function() {
                    it("should ask for boys vocab result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32'  // perf_learner_girls_phonics
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_vocab',
                                reply:
                                    "How many boys scored 3 or more correctly out of 6 " +
                                    "for Section 2 (Vocabulary)?"
                            })
                            .run();
                    });
                });

                describe("if the entry is not a number", function() {
                    it("should ask for girls phonics again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                'many'  // perf_learner_girls_phonics
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_phonics',
                                reply:
                                    "Please provide a valid number value for total girls scoring 4 or more" +
                                    " correctly out of 6 for Phonics and Phonemic Awareness."
                            })
                            .run();
                    });
                });

                describe("if girls phonics result > girls total", function() {
                    it("should ask for girls phonics again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '50'  // perf_learner_girls_phonics
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_phonics',
                                reply:
                                    "Please provide a valid number value for total girls scoring 4 or more" +
                                    " correctly out of 6 for Phonics and Phonemic Awareness."
                            })
                            .run();
                    });
                });
            });


            // boys vocab
            describe("when the user enters boys vocab result", function() {

                describe("if the number validates", function() {
                    it("should ask for girls vocab result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33'  // perf_learner_boys_vocab
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_vocab',
                                reply:
                                    "How many girls scored 3 or more correctly out of 6 " +
                                    "for Section 2 (Vocabulary)?"
                            })
                            .run();
                    });
                });
            });

            // girls vocab
            describe("when the user enters girls vocab result", function() {

                describe("if the number validates", function() {
                    it("should ask for boys comprehension result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33',  // perf_learner_boys_vocab
                                '34'  // perf_learner_girls_vocab
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_comprehension',
                                reply:
                                    "How many boys scored 2 or more correctly out of 4 " +
                                    "for Section 3 (Comprehension)?"
                            })
                            .run();
                    });
                });
            });


            // boys comprehension
            describe("when the user enters boys comprehension result", function() {

                describe("if the number validates", function() {
                    it("should ask for girls comprehension result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33',  // perf_learner_boys_vocab
                                '34',  // perf_learner_girls_vocab
                                '35'  // perf_learner_boys_comprehension
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_comprehension',
                                reply:
                                    "How many girls scored 2 or more correctly out of 4 " +
                                    "for Section 3 (Comprehension)?"
                            })
                            .run();
                    });
                });
            });

            // girls comprehension
            describe("when the user enters girls comprehension result", function() {

                describe("if the number validates", function() {
                    it("should ask for boys writing result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33',  // perf_learner_boys_vocab
                                '34',  // perf_learner_girls_vocab
                                '35',  // perf_learner_boys_comprehension
                                '36'  // perf_learner_girls_comprehension
                            )
                            .check.interaction({
                                state: 'perf_learner_boys_writing',
                                reply:
                                    "How many boys scored 2 or more correctly out of 4 " +
                                    "for Section 4 (Writing)?"
                            })
                            .run();
                    });
                });
            });


            // boys writing
            describe("when the user enters boys writing result", function() {

                describe("if the number validates", function() {
                    it("should ask for girls writing result", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33',  // perf_learner_boys_vocab
                                '34',  // perf_learner_girls_vocab
                                '35',  // perf_learner_boys_comprehension
                                '36',  // perf_learner_girls_comprehension
                                '37'  // perf_learner_boys_writing
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_writing',
                                reply:
                                    "How many girls scored 2 or more correctly out of 4 " +
                                    "for Section 4 (Writing)?"
                            })
                            .run();
                    });
                });
            });

            // girls writing
            describe("when the user enters girls writing result", function() {

                describe("if the number validates", function() {
                    it("should show success and options", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33',  // perf_learner_boys_vocab
                                '34',  // perf_learner_girls_vocab
                                '35',  // perf_learner_boys_comprehension
                                '36',  // perf_learner_girls_comprehension
                                '37',  // perf_learner_boys_writing
                                '38'  // perf_learner_girls_writing
                            )
                            .check.interaction({
                                state: 'perf_learner_completed',
                                reply: [
                                    "Congratulations. You have finished reporting on the learner assessment.",
                                    "1. Go back to the main menu.",
                                    "2. Exit."
                                ].join('\n')
                            })
                            .run();
                    });
                });

                describe("if girls writing result > girls total", function() {
                    it("should ask for girls writing again", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '2',  // initial_state_head_teacher
                                '52', // perf_learner_boys_total
                                '10',  // perf_learner_boys_outstanding
                                '15',  // perf_learner_boys_desirable
                                '20',  // perf_learner_boys_minimum
                                '7',  // perf_learner_boys_below_minimum
                                '49',  // perf_learner_girls_total
                                '10',  // perf_learner_girls_outstanding
                                '15',  // perf_learner_girls_desirable
                                '20',  // perf_learner_girls_minimum
                                '4',  // perf_learner_girls_below_minimum
                                '31',  // perf_learner_boys_phonics
                                '32',  // perf_learner_girls_phonics
                                '33',  // perf_learner_boys_vocab
                                '34',  // perf_learner_girls_vocab
                                '35',  // perf_learner_boys_comprehension
                                '36',  // perf_learner_girls_comprehension
                                '37',  // perf_learner_boys_writing
                                '75'  // perf_learner_girls_writing
                            )
                            .check.interaction({
                                state: 'perf_learner_girls_writing',
                                reply:
                                    "Please provide a valid number value for total girls achieving 2 out of 4" +
                                    " correct answers for Writing."
                            })
                            .run();
                    });
                });
            });


            // completed - main menu
            describe("after completing report if user selects to go to main menu", function() {
                it("should go back to main menu", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '2',  // initial_state_head_teacher
                            '52', // perf_learner_boys_total
                            '10',  // perf_learner_boys_outstanding
                            '15',  // perf_learner_boys_desirable
                            '20',  // perf_learner_boys_minimum
                            '7',  // perf_learner_boys_below_minimum
                            '49',  // perf_learner_girls_total
                            '10',  // perf_learner_girls_outstanding
                            '15',  // perf_learner_girls_desirable
                            '20',  // perf_learner_girls_minimum
                            '4',  // perf_learner_girls_below_minimum
                            '31',  // perf_learner_boys_phonics
                            '32',  // perf_learner_girls_phonics
                            '33',  // perf_learner_boys_vocab
                            '34',  // perf_learner_girls_vocab
                            '35',  // perf_learner_boys_comprehension
                            '36',  // perf_learner_girls_comprehension
                            '37',  // perf_learner_boys_writing
                            '38',  // perf_learner_girls_writing
                            '1'  // perf_learner_completed
                        )
                        .check.interaction({
                            state: 'initial_state_zonal_head',
                            reply: [
                                'Welcome to Zambia School Gateway!',
                                '1. Report on teachers',
                                '2. Report on learners',
                                '3. Report on school monitoring visit',
                                '4. Change my school',
                                "5. Update my school data"
                            ].join('\n')
                        })
                        .run();
                });
            });

            // completed - exit
            describe("after completing report if user selects to exit", function() {
                it("should thank them and exit", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '2',  // initial_state_head_teacher
                            '52', // perf_learner_boys_total
                            '10',  // perf_learner_boys_outstanding
                            '15',  // perf_learner_boys_desirable
                            '20',  // perf_learner_boys_minimum
                            '7',  // perf_learner_boys_below_minimum
                            '49',  // perf_learner_girls_total
                            '10',  // perf_learner_girls_outstanding
                            '15',  // perf_learner_girls_desirable
                            '20',  // perf_learner_girls_minimum
                            '4',  // perf_learner_girls_below_minimum
                            '31',  // perf_learner_boys_phonics
                            '32',  // perf_learner_girls_phonics
                            '33',  // perf_learner_boys_vocab
                            '34',  // perf_learner_girls_vocab
                            '35',  // perf_learner_boys_comprehension
                            '36',  // perf_learner_girls_comprehension
                            '37',  // perf_learner_boys_writing
                            '38',  // perf_learner_girls_writing
                            '2'  // perf_learner_completed
                        )
                        .check.interaction({
                            state: 'end_state',
                            reply: "Goodbye! Thank you for using the Gateway.",
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });


        });

    });


    // SCHOOL MONITORING
    // -----------------

    describe.only("when the user chooses to report on school monitoring", function() {
        describe("if the user is a zonal head", function() {
            it("should ask for emis number", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3'  // initial_state_zonal_head
                    )
                    .check.interaction({
                        state: 'add_emis_school_monitoring',
                        reply:
                            "Please enter the school's EMIS number that you would " +
                            "like to report on. This should have 4-6 digits e.g 4351."
                    })
                    .run();
            });
        });

        describe("if the user is a district official", function() {
            it("should ask for emis number", function() {
                return tester
                    .setup.user.addr('097444')  // zonal head
                    .inputs(
                        'start',
                        '3'  // initial_state_district_official
                    )
                    .check.interaction({
                        state: 'add_emis_school_monitoring',
                        reply:
                            "Please enter the school's EMIS number that you would " +
                            "like to report on. This should have 4-6 digits e.g 4351."
                    })
                    .run();
            });
        });

        describe("after entering an emis number", function() {
            describe("if the emis does not validate", function() {
                it("should ask for the emis again", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '000A'  // add_emis_school_monitoring
                        )
                        .check.interaction({
                            state: 'add_emis_school_monitoring',
                            reply:
                                "The emis does not exist, please try again. " +
                                "This should have 4-6 digits e.g 4351."
                        })
                        .run();
                });
            });

            describe("if the emis validates", function() {
                it("should ask if they saw the School LPIP", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342'  // add_emis_school_monitoring
                        )
                        .check.interaction({
                            state: 'monitor_school_see_lpip',
                            reply: [
                                "Please complete the following questions after the visit is " +
                                "complete. Did you see the School Learner Performance " +
                                "Improvement Plan for this year?",
                                "1. YES - completed",
                                "2. YES - in progress",
                                "3. NO"
                            ].join('\n')
                        })
                        .run();
                });

                it("should save the emis to their contact as an extra", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342'  // add_emis_school_monitoring
                        )
                        .check(function(api) {
                            var contact = api.contacts.store[1];
                            assert.equal(contact.extra.school_monitoring_emis, '4342');
                        })
                        .run();
                });
            });
        });

        describe("if they answer YES to seeing the School LPIP", function() {
            it("should ask about activity for improving teaching", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1'  // monitor_school_see_lpip
                    )
                    .check.interaction({
                        state: 'monitor_school_teaching',
                        reply: [
                            "Please indicate the following: Is there an activity in the LPIP for " +
                            "improving the teaching of early grade reading?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("if they answer NO to seeing the School LPIP", function() {
            it("should ask about Grade 2 reading lesson observation results", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '3'  // monitor_school_see_lpip
                    )
                    .check.interaction({
                        state: 'monitor_school_g2_observation_results',
                        reply: [
                            "Did you see the Grade 2 reading lesson observation results done " +
                            "by the head teacher for the current term?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering teaching", function() {
            it("should ask about activity for improving learner assessment", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3'  // monitor_school_teaching
                    )
                    .check.interaction({
                        state: 'monitor_school_learner_assessment',
                        reply: [
                            "Is there an activity for improving learner assessment?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering learner assessment", function() {
            it("should ask about activity for improving learning materials", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2'  // monitor_school_learner_assessment
                    )
                    .check.interaction({
                        state: 'monitor_school_learning_materials',
                        reply: [
                            "Is there an activity for buying or making teaching and learning " +
                            "materials?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering learning materials", function() {
            it("should ask about activity for improving learner attendance", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1'  // monitor_school_learning_materials
                    )
                    .check.interaction({
                        state: 'monitor_school_learner_attendance',
                        reply: [
                            "Is there an activity for improving learner attendance?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering learner attendance", function() {
            it("should ask about activity for increasing reading time", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1',  // monitor_school_learning_materials
                        '3'  // monitor_school_learner_attendance
                    )
                    .check.interaction({
                        state: 'monitor_school_reading_time',
                        reply: [
                            "Is there an activity for increasing the time available for " +
                            "children to read, inside or outside school?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering reading time", function() {
            it("should ask about activity for struggling learners", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1',  // monitor_school_learning_materials
                        '3',  // monitor_school_learner_attendance
                        '2'  // monitor_school_reading_time
                    )
                    .check.interaction({
                        state: 'monitor_school_struggling_learners',
                        reply: [
                            "Is there an activity to give extra or remedial support to " +
                            "struggling learners?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering struggling learners", function() {
            it("should ask about Grade 2 reading lesson observation results", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1',  // monitor_school_learning_materials
                        '3',  // monitor_school_learner_attendance
                        '2',  // monitor_school_reading_time
                        '1'  // monitor_school_struggling_learners
                    )
                    .check.interaction({
                        state: 'monitor_school_g2_observation_results',
                        reply: [
                            "Did you see the Grade 2 reading lesson observation results done " +
                            "by the head teacher for the current term?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("if they answer YES to seeing Grade 2 reading lesson observation", function() {
            it("should ask about head teacher feedback", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1',  // monitor_school_learning_materials
                        '3',  // monitor_school_learner_attendance
                        '2',  // monitor_school_reading_time
                        '1',  // monitor_school_struggling_learners
                        '2'  // monitor_school_g2_observation_results
                    )
                    .check.interaction({
                        state: 'monitor_school_ht_feedback',
                        reply: [
                            "According to the teacher observed, has the Head Teacher given " +
                            "him/her feedback?",
                            "1. YES",
                            "2. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("if they answer NO to seeing Grade 2 reading lesson observation", function() {
            it("should ask about seeing gala sheets", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '3',  // monitor_school_see_lpip
                        '3'  // monitor_school_g2_observation_results
                    )
                    .check.interaction({
                        state: 'monitor_school_gala_sheets',
                        reply: [
                            "Did you see the GALA stimulus sheets completed by the learners for " +
                            "the current term?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering head teacher feedback", function() {
            it("should ask about submitting classroom observation results", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1',  // monitor_school_learning_materials
                        '3',  // monitor_school_learner_attendance
                        '2',  // monitor_school_reading_time
                        '1',  // monitor_school_struggling_learners
                        '2',  // monitor_school_g2_observation_results
                        '1'  // monitor_school_ht_feedback
                    )
                    .check.interaction({
                        state: 'monitor_school_submitted_classroom',
                        reply: [
                            "Has the Head Teacher submitted the classroom observation results to " +
                            "the ZSG?",
                            "1. YES submitted by cell phone",
                            "2. YES submitted paper form to DEBS office",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering submitting classroom", function() {
            it("should ask about seeing gala sheets", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching
                        '2',  // monitor_school_learner_assessment
                        '1',  // monitor_school_learning_materials
                        '3',  // monitor_school_learner_attendance
                        '2',  // monitor_school_reading_time
                        '1',  // monitor_school_struggling_learners
                        '2',  // monitor_school_g2_observation_results
                        '1',  // monitor_school_ht_feedback
                        '2'  // monitor_school_submitted_classroom
                    )
                    .check.interaction({
                        state: 'monitor_school_gala_sheets',
                        reply: [
                            "Did you see the GALA stimulus sheets completed by the learners for " +
                            "the current term?",
                            "1. YES - completed",
                            "2. YES - in progress",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("if they answer YES to seeing gala sheets", function() {
            it("should ask about summary worksheet", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching q01
                        '2',  // monitor_school_learner_assessment q02
                        '1',  // monitor_school_learning_materials q03
                        '3',  // monitor_school_learner_attendance q04
                        '2',  // monitor_school_reading_time q05
                        '1',  // monitor_school_struggling_learners q06
                        '2',  // monitor_school_g2_observation_results q07
                        '1',  // monitor_school_ht_feedback q08
                        '2',  // monitor_school_submitted_classroom q09
                        '1'  // monitor_school_gala_sheets q10
                    )
                    .check.interaction({
                        state: 'monitor_school_summary_worksheet',
                        reply: [
                            "Was the summary worksheet accurately completed by the Head Teacher?",
                            "1. YES",
                            "2. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("if they answer NO to seeing gala sheets", function() {
            it("should ask them to assist with LPIP and E-SIMON", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '3',  // monitor_school_see_lpip
                        '3',  // monitor_school_g2_observation_results
                        '3'  // monitor_school_gala_sheets
                    )
                    .check.interaction({
                        state: 'monitor_school_falling_behind',
                        reply: [
                            "This school is falling behind with their LPIP and E-SIMON " +
                            "responsibilities. Please assist the Head Teacher to catch up.",
                            "1. Go back to the main menu",
                            "2. Exit"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after seeing the falling behind screen", function() {

            describe("if the user chooses to go back to main menu", function() {
                it("should ask them what they want to do", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342',  // add_emis_school_monitoring
                            '3',  // monitor_school_see_lpip
                            '3',  // monitor_school_g2_observation_results
                            '3',  // monitor_school_gala_sheets
                            '1'  // monitor_school_falling_behind
                        )
                        .check.interaction({
                            state: 'initial_state_zonal_head',
                            reply: [
                                'Welcome to Zambia School Gateway!',
                                '1. Report on teachers',
                                '2. Report on learners',
                                '3. Report on school monitoring visit',
                                '4. Change my school',
                                "5. Update my school data"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the user chooses to exit", function() {
                it("should thank them and exit", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342',  // add_emis_school_monitoring
                            '3',  // monitor_school_see_lpip
                            '3',  // monitor_school_g2_observation_results
                            '3',  // monitor_school_gala_sheets
                            '2'  // monitor_school_falling_behind
                        )
                        .check.interaction({
                            state: 'end_state',
                            reply: "Goodbye! Thank you for using the Gateway."
                        })
                        .run();
                });
            });
        });

        describe("after answering summary worksheet", function() {
            it("should ask about receiving feedback on literacy assessment", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching q01
                        '2',  // monitor_school_learner_assessment q02
                        '1',  // monitor_school_learning_materials q03
                        '3',  // monitor_school_learner_attendance q04
                        '2',  // monitor_school_reading_time q05
                        '1',  // monitor_school_struggling_learners q06
                        '2',  // monitor_school_g2_observation_results q07
                        '1',  // monitor_school_ht_feedback q08
                        '2',  // monitor_school_submitted_classroom q09
                        '1',  // monitor_school_gala_sheets q10
                        '2'  // monitor_school_summary_worksheet q11
                    )
                    .check.interaction({
                        state: 'monitor_school_ht_feedback_literacy',
                        reply: [
                            "According to the teacher observed, has the Head Teacher given " +
                            "him/her feedback on the literacy assessment results?",
                            "1. YES",
                            "2. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering literacy assessment feedback", function() {
            it("should ask about submitting gala results", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching q01
                        '2',  // monitor_school_learner_assessment q02
                        '1',  // monitor_school_learning_materials q03
                        '3',  // monitor_school_learner_attendance q04
                        '2',  // monitor_school_reading_time q05
                        '1',  // monitor_school_struggling_learners q06
                        '2',  // monitor_school_g2_observation_results q07
                        '1',  // monitor_school_ht_feedback q08
                        '2',  // monitor_school_submitted_classroom q09
                        '1',  // monitor_school_gala_sheets q10
                        '2',  // monitor_school_summary_worksheet q11
                        '1'  // monitor_school_ht_feedback_literacy q12
                    )
                    .check.interaction({
                        state: 'monitor_school_submitted_gala',
                        reply: [
                            "Has the Head Teacher submitted the GALA results to the ZSG?",
                            "1. YES submitted by cell phone",
                            "2. YES submitted paper form to DEBS office",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering submitting gala sheets", function() {
            it("should ask about talking wall poster", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching q01
                        '2',  // monitor_school_learner_assessment q02
                        '1',  // monitor_school_learning_materials q03
                        '3',  // monitor_school_learner_attendance q04
                        '2',  // monitor_school_reading_time q05
                        '1',  // monitor_school_struggling_learners q06
                        '2',  // monitor_school_g2_observation_results q07
                        '1',  // monitor_school_ht_feedback q08
                        '2',  // monitor_school_submitted_classroom q09
                        '1',  // monitor_school_gala_sheets q10
                        '2',  // monitor_school_summary_worksheet q11
                        '1',  // monitor_school_ht_feedback_literacy q12
                        '3'  // monitor_school_submitted_gala q13
                    )
                    .check.interaction({
                        state: 'monitor_school_talking_wall',
                        reply: [
                            "Is the Talking Wall poster on display and up to date?",
                            "1. YES",
                            "2. YES but not updated",
                            "3. NO"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after answering talking wall", function() {
            it("should congratulate and ask what they want to do", function() {
                return tester
                    .setup.user.addr('097555')  // zonal head
                    .inputs(
                        'start',
                        '3',  // initial_state_zonal_head
                        '4342',  // add_emis_school_monitoring
                        '1',  // monitor_school_see_lpip
                        '3',  // monitor_school_teaching q01
                        '2',  // monitor_school_learner_assessment q02
                        '1',  // monitor_school_learning_materials q03
                        '3',  // monitor_school_learner_attendance q04
                        '2',  // monitor_school_reading_time q05
                        '1',  // monitor_school_struggling_learners q06
                        '2',  // monitor_school_g2_observation_results q07
                        '1',  // monitor_school_ht_feedback q08
                        '2',  // monitor_school_submitted_classroom q09
                        '1',  // monitor_school_gala_sheets q10
                        '2',  // monitor_school_summary_worksheet q11
                        '1',  // monitor_school_ht_feedback_literacy q12
                        '3',  // monitor_school_submitted_gala q13
                        '2'  // monitor_school_talking_wall q14
                    )
                    .check.interaction({
                        state: 'monitor_school_completed',
                        reply: [
                            "Congratulations, you have finished reporting on this school.",
                            "1. Report on another school monitoring visit",
                            "2. Go back to the main menu",
                            "3. Exit"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("after completing monitoring", function() {

            describe("if the chooses to report on another school", function() {
                it("should ask them to enter emis number", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342',  // add_emis_school_monitoring
                            '1',  // monitor_school_see_lpip
                            '3',  // monitor_school_teaching q01
                            '2',  // monitor_school_learner_assessment q02
                            '1',  // monitor_school_learning_materials q03
                            '3',  // monitor_school_learner_attendance q04
                            '2',  // monitor_school_reading_time q05
                            '1',  // monitor_school_struggling_learners q06
                            '2',  // monitor_school_g2_observation_results q07
                            '1',  // monitor_school_ht_feedback q08
                            '2',  // monitor_school_submitted_classroom q09
                            '1',  // monitor_school_gala_sheets q10
                            '2',  // monitor_school_summary_worksheet q11
                            '1',  // monitor_school_ht_feedback_literacy q12
                            '3',  // monitor_school_submitted_gala q13
                            '2',  // monitor_school_talking_wall q14
                            '1'  // monitor_school_completed q15
                        )
                        .check.interaction({
                            state: 'add_emis_school_monitoring',
                            reply:
                                "Please enter the school's EMIS number that you would " +
                                "like to report on. This should have 4-6 digits e.g 4351."
                        })
                        .run();
                });
            });

            describe("if the user chooses to go back to main menu", function() {
                it("should ask them what they want to do", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342',  // add_emis_school_monitoring
                            '1',  // monitor_school_see_lpip
                            '3',  // monitor_school_teaching q01
                            '2',  // monitor_school_learner_assessment q02
                            '1',  // monitor_school_learning_materials q03
                            '3',  // monitor_school_learner_attendance q04
                            '2',  // monitor_school_reading_time q05
                            '1',  // monitor_school_struggling_learners q06
                            '2',  // monitor_school_g2_observation_results q07
                            '1',  // monitor_school_ht_feedback q08
                            '2',  // monitor_school_submitted_classroom q09
                            '1',  // monitor_school_gala_sheets q10
                            '2',  // monitor_school_summary_worksheet q11
                            '1',  // monitor_school_ht_feedback_literacy q12
                            '3',  // monitor_school_submitted_gala q13
                            '2',  // monitor_school_talking_wall q14
                            '2'  // monitor_school_completed q15
                        )
                        .check.interaction({
                            state: 'initial_state_zonal_head',
                            reply: [
                                'Welcome to Zambia School Gateway!',
                                '1. Report on teachers',
                                '2. Report on learners',
                                '3. Report on school monitoring visit',
                                '4. Change my school',
                                "5. Update my school data"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the chooses to exit", function() {
                it("should thank them and exit", function() {
                    return tester
                        .setup.user.addr('097555')  // zonal head
                        .inputs(
                            'start',
                            '3',  // initial_state_zonal_head
                            '4342',  // add_emis_school_monitoring
                            '1',  // monitor_school_see_lpip
                            '3',  // monitor_school_teaching q01
                            '2',  // monitor_school_learner_assessment q02
                            '1',  // monitor_school_learning_materials q03
                            '3',  // monitor_school_learner_attendance q04
                            '2',  // monitor_school_reading_time q05
                            '1',  // monitor_school_struggling_learners q06
                            '2',  // monitor_school_g2_observation_results q07
                            '1',  // monitor_school_ht_feedback q08
                            '2',  // monitor_school_submitted_classroom q09
                            '1',  // monitor_school_gala_sheets q10
                            '2',  // monitor_school_summary_worksheet q11
                            '1',  // monitor_school_ht_feedback_literacy q12
                            '3',  // monitor_school_submitted_gala q13
                            '2',  // monitor_school_talking_wall q14
                            '3'  // monitor_school_completed q15
                        )
                        .check.interaction({
                            state: 'end_state',
                            reply: "Goodbye! Thank you for using the Gateway."
                        })
                        .run();
                });
            });

        });

    });


    // CHANGE SCHOOL
    // -------------

    describe.skip("when user chooses to change their school", function() {
        it("should ask them for their school's EMIS number", function() {
            return tester
                .setup.user.addr('097555')
                .inputs(
                    'start',
                    '4'  // initial_state_zonal_head
                )
                .check.interaction({
                    state: 'manage_change_emis',
                    reply:
                        "Please enter your school's EMIS number. This should have 4-6 " +
                        "digits e.g 4351.",
                })
                .run();
        });

        describe("after entering an EMIS number", function() {

            describe("if emis validates", function() {
                it("should thank and instruct to redial", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '4',  // initial_state_zonal_head
                            '2334'  // manage_change_emis
                        )
                        .check.interaction({
                            state: 'manage_change_emis_validates',
                            reply: [
                                "Thanks for claiming this EMIS. Redial this number if you ever " +
                                "change cellphone number to reclaim the EMIS and continue to " +
                                "receive SMS updates.",
                                "1. Continue"
                            ].join("\n")
                        })
                        .run();
                });

                describe("if they choose to continue after reading message", function() {
                    it("should ask them for number of boys at the school", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '4',  // initial_state_zonal_head
                                '2334',  // manage_change_emis
                                '1'  // manage_change_emis_validates
                            )
                            .check.interaction({
                                state: 'reg_school_boys',
                                reply: "How many boys do you have in your school?"
                            })
                            .run();
                    });
                });

                describe("if the user completes school change process", function() {
                    it("should save data", function() {
                        return tester
                            .setup.user.addr('097555')
                            .inputs(
                                'start',
                                '4',  // initial_state_zonal_head
                                '2334',  // manage_change_emis
                                '1',  // manage_change_emis_validates
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
                                var contact = api.contacts.store[1];
                                assert.equal(contact.extra.rts_id, '555');
                                assert.equal(contact.extra.rts_emis, '2334');
                                assert.equal(contact.extra.registration_origin, '');
                                assert.equal(contact.name, 'Regina');
                                assert.equal(contact.surname, 'Spektor');
                            })
                            .run();
                    });
                });

            });

            describe("if the user enters an invalid emis code once", function() {
                it("should ask if they want to try again or exit", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '4',  // initial_state_zonal_head
                            '000A'  // manage_change_emis
                        )
                        .check.interaction({
                            state: 'manage_change_emis_retry_exit',
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
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '4',  // initial_state_zonal_head
                            '000A',  // manage_change_emis
                            '2'  // manage_change_emis_retry_exit
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
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '4',  // initial_state_zonal_head
                            '000A',  // manage_change_emis
                            '1'  // manage_change_emis_retry_exit
                        )
                        .check.interaction({
                            state: 'manage_change_emis',
                            reply:
                                "Please enter your school's EMIS number. This should have 4-6 " +
                                "digits e.g 4351.",
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code once and then a valid emis", function() {
                it("should thank and instruct them to redial", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '4',  // initial_state_zonal_head
                            '000A',  // manage_change_emis
                            '1',  // manage_change_emis_retry_exit
                            '2334'  // manage_change_emis
                        )
                        .check.interaction({
                            state: 'manage_change_emis_validates',
                            reply: [
                                "Thanks for claiming this EMIS. Redial this number if you ever " +
                                "change cellphone number to reclaim the EMIS and continue to " +
                                "receive SMS updates.",
                                "1. Continue"
                            ].join("\n")
                        })
                        .run();
                });
            });

            describe("if the user enters an invalid emis code twice", function() {
                it("should instruct to send sms and exit", function() {
                    return tester
                        .setup.user.addr('097555')
                        .inputs(
                            'start',
                            '4',  // initial_state_zonal_head
                            '000A',  // manage_change_emis
                            '1',  // manage_change_emis_retry_exit
                            '000B'  // manage_change_emis
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

    });


    // UPDATE SCHOOL DATA
    // ------------------

    describe.skip("when user chooses to update their school data", function() {
        it("should give instruction, ask to continue", function() {
            return tester
                .setup.user.addr('097555')
                .inputs(
                    'start',
                    '5'  // initial_state_zonal_head
                )
                .check.interaction({
                    state: 'manage_update_school_data',
                    reply: [
                        "You'll now be asked to re-enter key school details to ensure the " +
                        "records are accurate. Enter 1 to continue.",
                        "1. Continue"
                    ].join("\n")
                })
                .run();
        });

        describe("if they choose to continue after reading message", function() {
            it("should ask them for number of boys at the school", function() {
                return tester
                    .setup.user.addr('097555')
                    .inputs(
                        'start',
                        '5',  // initial_state_zonal_head
                        '1'  // manage_update_school_data
                    )
                    .check.interaction({
                        state: 'reg_school_boys',
                        reply: "How many boys do you have in your school?"
                    })
                    .run();
            });
        });

        describe("if the user completes school update process", function() {
            it("should save data", function() {
                return tester
                    .setup.user.addr('097555')
                    .inputs(
                        'start',
                        '5',  // initial_state_zonal_head
                        '1',  // manage_update_school_data
                        '33',  // reg_school_boys
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
                        var contact = api.contacts.store[1];
                        assert.equal(contact.extra.rts_id, '555');
                        assert.equal(contact.extra.rts_emis, '45');
                        assert.equal(contact.extra.registration_origin, '');
                        assert.equal(contact.name, 'Regina');
                        assert.equal(contact.surname, 'Spektor');
                    })
                    .run();
            });
        });


        describe("if they choose to continue after reading message", function() {
            it("should ask them for number of boys at the school", function() {
                return tester
                    .setup.user.addr('097555')
                    .inputs(
                        'start',
                        '5',  // initial_state_zonal_head
                        '1'  // manage_update_school_data
                    )
                    .check.interaction({
                        state: 'reg_school_boys',
                        reply: "How many boys do you have in your school?"
                    })
                    .run();
            });
        });

    });

});


// end broken indentation to save whitespace

    });
});