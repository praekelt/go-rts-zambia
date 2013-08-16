var fs = require("fs");
var assert = require("assert");
var vumigo = require("vumigo_v01");
var app = require("../lib/go-rts-zambia");

// This just checks that you hooked you InteractionMachine
// up to the api correctly and called im.attach();
describe("test_api", function() {
    it("should exist", function() {
        assert.ok(app.api);
    });
    it("should have an on_inbound_message method", function() {
        assert.ok(app.api.on_inbound_message);
    });
    it("should have an on_inbound_event method", function() {
        assert.ok(app.api.on_inbound_event);
    });
});

var test_fixtures_full = [
    'test/fixtures/get_hierarchy.json',
    'test/fixtures/post_registration_update_msisdn.json',
    'test/fixtures/post_registration_emisdelink.json',
    'test/fixtures/post_registration_headteacher.json',
    'test/fixtures/post_registration_headteacher_zonal.json',
    'test/fixtures/post_registration_school.json',
    'test/fixtures/post_performance_teacher.json',
    'test/fixtures/post_performance_learner_boys.json',
    'test/fixtures/post_performance_learner_girls.json',
];

var tester;

describe("When using the USSD line as an unrecognised MSISDN", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = test_fixtures_full;
    beforeEach(function() {
        tester = new vumigo.test_utils.ImTester(app.api, {
            custom_setup: function (api) {
                api.config_store.config = JSON.stringify({
                    sms_short_code: "1234",
                    cms_api_root: 'http://qa/api/'
                });

                var dummy_contact = {
                    key: "f953710a2472447591bd59e906dc2c26",
                    surname: "Trotter",
                    user_account: "test-0-user",
                    bbm_pin: null,
                    msisdn: "+1234567",
                    created_at: "2013-04-24 14:01:41.803693",
                    gtalk_id: null,
                    dob: null,
                    groups: null,
                    facebook_id: null,
                    twitter_handle: null,
                    email_address: null,
                    name: "Rodney"
                };

                api.add_contact(dummy_contact);

                fixtures.forEach(function (f) {
                    api.load_http_fixture(f);
                });
            },
            async: true
        });
    });

    it('should tell us whether a date string is acceptable', function(done) {
        var state_creator = app.api.im.state_creator;
        assert.equal(
            state_creator.check_and_parse_date('11091980').toISOString(),
            new Date(1980,8,11).toISOString());
        assert.equal(
            state_creator.check_and_parse_date('11th Sept 1980'),
            false);
        assert.equal(
            state_creator.check_and_parse_date('2013-08-01'),
            false);
        done();
    });

    // first test should always start 'null, null' because we haven't
    // started interacting yet
    it("first display navigation menu", function (done) {
        var p = tester.check_state({
            user: null,
            content: null,
            next_state: "initial_state",
            response: "^Welcome to the Gateway! What would you like to do\\?[^]" +
                    "1. Register as a new user[^]" +
                    "2. Change my school[^]" +
                    "3. Change my primary mobile number$"
        });
        p.then(done, done);
    });

    it("selecting to register should ask for EMIS", function (done) {
        var user = {
            current_state: 'initial_state'
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "reg_emis",
            response: "^What is your school EMIS number\\?$"
        });
        p.then(done, done);
    });

    it("entering valid EMIS should ask for School Name", function (done) {
        var user = {
            current_state: 'reg_emis',
            answers: {
                initial_state: 'reg_emis'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "0001",
            next_state: "reg_school_name",
            response: "^What is your school name\\?$"
        });
        p.then(done, done);
    });

    it("entering invalid EMIS should ask for reenter or exit", function (done) {
        var user = {
            current_state: 'reg_emis',
            answers: {
                initial_state: 'reg_emis'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "000A",
            next_state: "reg_emis_error",
            response: "^Sorry![^]That is not a EMIS we recognise. Make sure " +
                "you have entered the number correctly.[^]" +
                "1. Try again[^]" +
                "2. Exit$"
        });
        p.then(done, done);
    });

    it("entering invalid EMIS and choosing to exit should tell send SMS", function (done) {
        var user = {
            current_state: 'reg_emis_error',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '000A'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "reg_exit_emis",
            response: "^There seems to be a problem with the EMIS number. " +
                "Please send a SMS with the code EMIS ERROR to 1234 " +
                "and your district officer will be in touch.$",
            continue_session: false
        });
        p.then(done, done);
    });

    it("entering invalid EMIS and choosing to reenter should ask EMIS", function (done) {
        var user = {
            current_state: 'reg_emis_error',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '000A'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "reg_emis",
            response: "^What is your school EMIS number\\?$"
        });
        p.then(done, done);
    });

    it("entering School Name should ask for users name", function (done) {
        var user = {
            current_state: 'reg_school_name',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "School One",
            next_state: "reg_first_name",
            response: "^What is your name\\?$"
        });
        p.then(done, done);
    });

    it("entering name should ask for users surname", function (done) {
        var user = {
            current_state: 'reg_first_name',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "Jack",
            next_state: "reg_surname",
            response: "^What is your surname\\?$"
        });
        p.then(done, done);
    });

    it("entering suname should ask for users date of birth", function (done) {
        var user = {
            current_state: 'reg_surname',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "Black",
            next_state: "reg_date_of_birth",
            response: "^What is your date of birth\\? \\(example 21071980\\)$"
        });
        p.then(done, done);
    });

    it("entering valid date of birth should ask for users gender", function (done) {
        var user = {
            current_state: 'reg_date_of_birth',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "11091980",
            next_state: "reg_gender",
            response: "^What is your gender\\?[^]" +
            "1. Female[^]" +
            "2. Male$"
        });
        p.then(done, done);
    });

    it("entering invalid date of birth should error", function (done) {
        var user = {
            current_state: 'reg_date_of_birth',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "11 Sep 1980",
            next_state: "reg_date_of_birth",
            response: "^Please enter your date of birth formatted DDMMYYYY$"
        });
        p.then(done, done);
    });

    it("entering gender should ask for school classrooms number", function (done) {
        var user = {
            current_state: 'reg_gender',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "reg_school_classrooms",
            response: "^How many classrooms do you have in your school\\?$"
        });
        p.then(done, done);
    });

    it("entering school classrooms should ask for teachers number", function (done) {
        var user = {
            current_state: 'reg_school_classrooms',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "5",
            next_state: "reg_school_teachers",
            response: "^How many teachers in total do you have in your school\\?$"
        });
        p.then(done, done);
    });

    it("entering invalid school classrooms number should error", function (done) {
        var user = {
            current_state: 'reg_school_classrooms',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "five",
            next_state: "reg_school_classrooms",
            response: "^Please provide a number value for how many classrooms you have in your school$"
        });
        p.then(done, done);
    });

    it("entering teachers number should ask for G1 teachers number", function (done) {
        var user = {
            current_state: 'reg_school_teachers',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "5",
            next_state: "reg_school_teachers_g1",
            response: "^How many teachers teach G1 local language literacy\\?$"
        });
        p.then(done, done);
    });

    it("entering invalid teachers number should error", function (done) {
        var user = {
            current_state: 'reg_school_teachers',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "five",
            next_state: "reg_school_teachers",
            response: "^Please provide a number value for how many teachers in total do you have in your school$"
        });
        p.then(done, done);
    });

    it("entering teachers G1 number should ask for G2 teachers number", function (done) {
        var user = {
            current_state: 'reg_school_teachers_g1',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "reg_school_teachers_g2",
            response: "^How many teachers teach G2 local language literacy\\?$"
        });
        p.then(done, done);
    });

    it("entering invalid teachers G1 number should error", function (done) {
        var user = {
            current_state: 'reg_school_teachers_g1',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "two",
            next_state: "reg_school_teachers_g1",
            response: "^Please provide a number value for how many teachers teach G1 local language literacy$"
        });
        p.then(done, done);
    });

    it("entering teachers G2 number should ask for G2 boys number", function (done) {
        var user = {
            current_state: 'reg_school_teachers_g2',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "reg_school_students_g2_boys",
            response: "^Total number of G2 boys registered/enrolled\\?$"
        });
        p.then(done, done);
    });

    it("entering invalid teachers G2 number should error", function (done) {
        var user = {
            current_state: 'reg_school_teachers_g2',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "two",
            next_state: "reg_school_teachers_g2",
            response: "^Please provide a number value for how many teachers teach G2 local language literacy$"
        });
        p.then(done, done);
    });

    it("entering student boys G2 number should ask for G2 girls number", function (done) {
        var user = {
            current_state: 'reg_school_students_g2_boys',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "10",
            next_state: "reg_school_students_g2_girls",
            response: "^Total number of G2 girls registered/enrolled\\?$"
        });
        p.then(done, done);
    });

    it("entering invalid student boys G2 number should error", function (done) {
        var user = {
            current_state: 'reg_school_students_g2_boys',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "ten",
            next_state: "reg_school_students_g2_boys",
            response: "^Please provide a number value for total number of G2 boys registered/enrolled$"
        });
        p.then(done, done);
    });

    it("entering student girls G2 number should ask for zonal head", function (done) {
        var user = {
            current_state: 'reg_school_students_g2_girls',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2',
                reg_school_students_g2_boys: '10'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "11",
            next_state: "reg_zonal_head",
            response: "^Are you a Zonal Head\\?[^]" +
                    "1. Yes[^]" +
                    "2. No$"
        });
        p.then(done, done);
    });

    it("entering invalid student girls G2 number should error", function (done) {
        var user = {
            current_state: 'reg_school_students_g2_girls',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2',
                reg_school_students_g2_boys: '10'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "eleven",
            next_state: "reg_school_students_g2_girls",
            response: "^Please provide a number value for total number of G2 girls registered/enrolled$"
        });
        p.then(done, done);
    });

    it("saying not zonal head should ask for zonal head name", function (done) {
        var user = {
            current_state: 'reg_zonal_head',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2',
                reg_school_students_g2_boys: '10',
                reg_school_students_g2_girls: '11'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "reg_zonal_head_name",
            response: "^What is the name and surname of your Zonal Head\\?$"
        });
        p.then(done, done);
    });

    it("saying are zonal head should thank long and close", function (done) {
        var user = {
            current_state: 'reg_zonal_head',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2',
                reg_school_students_g2_boys: '10',
                reg_school_students_g2_girls: '11'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "reg_thanks_zonal_head",
            response: "^Thank you for registering! When you are ready you can " +
            "dial in again to start reporting. You will also start receiving the " +
            "monthly SMS's from your Headteachers.$",
            continue_session: false
        });
        p.then(done, done);
    });

    it("entering name of zonal head should thank and close", function (done) {
        var user = {
            current_state: 'reg_zonal_head_name',
            answers: {
                initial_state: 'reg_emis',
                reg_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2',
                reg_school_students_g2_boys: '10',
                reg_school_students_g2_girls: '11',
                reg_zonal_head: 'reg_zonal_head_name'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "Jim Carey",
            next_state: "reg_thanks_head_teacher",
            response: "^Thank you for registering! When you are ready you can dial " +
            "in again to start reporting.$",
            continue_session: false
        });
        p.then(done, done);
    });

    it("selecting to change primary number should ask for EMIS", function (done) {
        var user = {
            current_state: 'initial_state'
        };
        var p = tester.check_state({
            user: user,
            content: "3",
            next_state: "manage_change_msisdn_emis_lookup",
            response: "^What is your school EMIS number\\?$"
        });
        p.then(done, done);
    });

    it("entering valid EMIS should thank the user and exit", function (done) {
        var user = {
            current_state: 'manage_change_msisdn_emis_lookup',
            answers: {
                initial_state: 'manage_change_msisdn_emis_lookup'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "0001",
            next_state: "manage_change_msisdn_confirm",
            response: "^Thank you! We have now allocated your new contact mobile number " +
            "to your current school.$",
            continue_session: false
        });
        p.then(done, done);
    });

    it("entering invalid EMIS should ask for reenter or exit", function (done) {
        var user = {
            current_state: 'manage_change_msisdn_emis_lookup',
            answers: {
                initial_state: 'manage_change_msisdn_emis_lookup'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "000A",
            next_state: "manage_change_msisdn_emis_error",
            response: "^Sorry![^]That is not a EMIS we recognise. Make sure " +
                "you have entered the number correctly.[^]" +
                "1. Try again[^]" +
                "2. Exit$"
        });
        p.then(done, done);
    });

    it("entering invalid EMIS and choosing to exit should tell send SMS", function (done) {
        var user = {
            current_state: 'manage_change_msisdn_emis_error',
            answers: {
                initial_state: 'manage_change_msisdn_confirm',
                manage_change_msisdn_emis_lookup: '000A'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "reg_exit_emis",
            response: "^There seems to be a problem with the EMIS number. " +
                "Please send a SMS with the code EMIS ERROR to 1234 " +
                "and your district officer will be in touch.$",
            continue_session: false
        });
        p.then(done, done);
    });

    it("entering invalid EMIS and choosing to reenter should ask EMIS", function (done) {
        var user = {
            current_state: 'manage_change_msisdn_emis_error',
            answers: {
                initial_state: 'manage_change_msisdn_emis_lookup',
                manage_change_msisdn_emis_lookup: '000A'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "manage_change_msisdn_emis_lookup",
            response: "^What is your school EMIS number\\?$"
        });
        p.then(done, done);
    });

    it("selecting to change school should ask for EMIS", function (done) {
        var user = {
            current_state: 'initial_state'
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "manage_change_emis",
            response: "^What is your school EMIS number\\?$"
        });
        p.then(done, done);
    });

    it("entering valid EMIS should disassociate current and ask for School Name", function (done) {
        var user = {
            current_state: 'reg_emis',
            answers: {
                initial_state: 'manage_change_emis'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "0001",
            next_state: "reg_school_name",
            response: "^What is your school name\\?$"
        });
        p.then(done, done);
    });

    it("saying are zonal head after disassociate should thank long and close", function (done) {
        var user = {
            current_state: 'reg_zonal_head',
            answers: {
                initial_state: 'manage_change_emis',
                manage_change_emis: '0001',
                reg_school_name: 'School One',
                reg_first_name: 'Jack',
                reg_surname: 'Black',
                reg_date_of_birth: '11091980',
                reg_gender: 'male',
                reg_school_classrooms: '5',
                reg_school_teachers: '5',
                reg_school_teachers_g1: '2',
                reg_school_teachers_g2: '2',
                reg_school_students_g2_boys: '10',
                reg_school_students_g2_girls: '11'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "reg_thanks_zonal_head",
            response: "^Thank you for registering! When you are ready you can " +
            "dial in again to start reporting. You will also start receiving the " +
            "monthly SMS's from your Headteachers.$",
            continue_session: false
        });
        p.then(done, done);
    });

});

describe("When using the USSD line as an recognised MSISDN to report on teachers", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = test_fixtures_full;
    beforeEach(function() {
        tester = new vumigo.test_utils.ImTester(app.api, {
            custom_setup: function (api) {
                api.config_store.config = JSON.stringify({
                    sms_short_code: "1234",
                    cms_api_root: 'http://qa/api/'
                });

                var dummy_contact = {
                    key: "f953710a2472447591bd59e906dc2c26",
                    surname: "Trotter",
                    user_account: "test-0-user",
                    bbm_pin: null,
                    msisdn: "+1234567",
                    created_at: "2013-04-24 14:01:41.803693",
                    gtalk_id: null,
                    dob: null,
                    groups: null,
                    facebook_id: null,
                    twitter_handle: null,
                    email_address: null,
                    name: "Rodney"
                };

                api.add_contact(dummy_contact);
                api.update_contact_extras(dummy_contact, {
                    "rts_id": 2,
                    "rts_emis": 1
                });

                fixtures.forEach(function (f) {
                    api.load_http_fixture(f);
                });
            },
            async: true
        });
    });

    // first test should always start 'null, null' because we haven't
    // started interacting yet
    it("first display navigation menu", function (done) {
        var p = tester.check_state({
            user: null,
            content: null,
            next_state: "initial_state",
            response: "^Welcome to SPERT. What would you like to do\\?[^]" +
                    "1. Add a classroom observation report[^]" +
                    "2. Add a learner performance report[^]" +
                    "3. Change my school$"
        });
        p.then(done, done);
    });

    it("selecting to report on teacher performance should ask for teacher TS number", function (done) {
        var user = {
            current_state: 'initial_state'
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "perf_teacher_ts_number",
            response: "^Please enter the teacher's TS number$"
        });
        p.then(done, done);
    });

    it("entering teacher TS number incorrectly should ask for teacher TS number again", function (done) {
        var user = {
            current_state: 'perf_teacher_ts_number',
            answers: {
                initial_state: 'perf_teacher_ts_number'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "One Hundred and Six",
            next_state: "perf_teacher_ts_number",
            response: "^Please provide a number value for the teacher's TS number$"
        });
        p.then(done, done);
    });

    it("entering teacher TS number should ask for gender", function (done) {
        var user = {
            current_state: 'perf_teacher_ts_number',
            answers: {
                initial_state: 'perf_teacher_ts_number'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "106",
            next_state: "perf_teacher_gender",
            response: "^Please enter 1 if the teacher is a man or 2 if she is a woman[^]" +
            "1. Male[^]" +
            "2. Female$"
        });
        p.then(done, done);
    });

    it("entering teacher gender should ask for age", function (done) {
        var user = {
            current_state: 'perf_teacher_gender',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "perf_teacher_age",
            response: "^Please enter the teacher's age in years e.g. 26$"
        });
        p.then(done, done);
    });

    it("entering teacher age incorrectly should ask for age again", function (done) {
        var user = {
            current_state: 'perf_teacher_age',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "One",
            next_state: "perf_teacher_age",
            response: "^Please provide a number value for the teachers age$"
        });
        p.then(done, done);
    });

    it("entering teacher age should ask for academic achievement", function (done) {
        var user = {
            current_state: 'perf_teacher_age',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "30",
            next_state: "perf_teacher_academic_level",
            response: "^What is the teacher's highest education level\\?[^]" +
            "1. Gr 7[^]" +
            "2. Gr 9[^]" +
            "3. Gr 12[^]" +
            "4. PTC[^]" +
            "5. PTD[^]" +
            "6. Dip Ed[^]" +
            "7. Other diploma[^]" +
            "8. BA Degree[^]" +
            "9. MA Degree[^]" +
            "10. Other$"
        });
        p.then(done, done);
    });

    it("entering academic achievement should ask for years experience", function (done) {
        var user = {
            current_state: 'perf_teacher_academic_level',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "3",
            next_state: "perf_teacher_years_experience",
            response: "^How many years of teaching experience does this teacher have\\?[^]" +
                "1. 0 - 3 years[^]" +
                "2. 4 - 8 years[^]" +
                "3. 9 - 12 years[^]" +
                "4. 13 years or more$"
        });
        p.then(done, done);
    });

    it("entering years experience should ask G2 pupils present", function (done) {
        var user = {
            current_state: 'perf_teacher_years_experience',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "perf_teacher_g2_pupils_present",
            response: "^How many children were PRESENT during the observed lesson\\?$"
        });
        p.then(done, done);
    });


    it("entering G2 pupils present incorrectly should ask G2 pupils present again", function (done) {
        var user = {
            current_state: 'perf_teacher_g2_pupils_present',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "forty",
            next_state: "perf_teacher_g2_pupils_present",
            response: "^Please provide a number value for pupils present$"
        });
        p.then(done, done);
    });

    it("entering G2 pupils present should ask G2 pupils registered", function (done) {
        var user = {
            current_state: 'perf_teacher_g2_pupils_present',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "40",
            next_state: "perf_teacher_g2_pupils_registered",
            response: "^How many children are ENROLLED in the Grade 2 class that was observed\\?$"
        });
        p.then(done, done);
    });

    it("entering G2 pupils registered incorrectly should ask G2 pupils registered again", function (done) {
        var user = {
            current_state: 'perf_teacher_g2_pupils_registered',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "fifty",
            next_state: "perf_teacher_g2_pupils_registered",
            response: "^Please provide a number value for pupils enrolled$"
        });
        p.then(done, done);
    });

    it("entering G2 pupils registered should ask classroom environment score", function (done) {
        var user = {
            current_state: 'perf_teacher_g2_pupils_registered',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "50",
            next_state: "perf_teacher_classroom_environment_score",
            response: "^Enter the subtotal that the teacher achieved during the classroom observation for Section 2 \\(Classroom Environment\\)$"
        });
        p.then(done, done);
    });

    it("entering classroom environment score incorrectly should ask classroom environment score again", function (done) {
        var user = {
            current_state: 'perf_teacher_classroom_environment_score',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "great",
            next_state: "perf_teacher_classroom_environment_score",
            response: "^Please provide a number value for classroom environment$"
        });
        p.then(done, done);
    });

    it("entering classroom environment score should ask T&L Materials Score", function (done) {
        var user = {
            current_state: 'perf_teacher_classroom_environment_score',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "10",
            next_state: "perf_teacher_t_l_materials",
            response: "^Enter the subtotal that the teacher achieved during the classroom " +
                "observation for Section 3 \\(Teaching and Learning Materials\\)$"
        });
        p.then(done, done);
    });

    it("entering T&L Materials Score incorrectly should ask T&L Materials Score again", function (done) {
        var user = {
            current_state: 'perf_teacher_t_l_materials',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "rubbish",
            next_state: "perf_teacher_t_l_materials",
            response: "^Please provide a number value for Teaching and Learning Materials$"
        });
        p.then(done, done);
    });

    it("entering T&L Materials Score should ask Pupil Books Number", function (done) {
        var user = {
            current_state: 'perf_teacher_t_l_materials',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "5",
            next_state: "perf_teacher_pupils_books_number",
            response: "^Enter the number of learners' books \\(text books\\) for literacy that " +
                "were available in the classroom during the lesson observation.$"
        });
        p.then(done, done);
    });

    it("entering Pupil Books Number incorrectly should ask Pupil Books Number again", function (done) {
        var user = {
            current_state: 'perf_teacher_pupils_books_number',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "fab",
            next_state: "perf_teacher_pupils_books_number",
            response: "^Please provide a number value for number of learners' books$"
        });
        p.then(done, done);
    });

    it("entering Pupil Books Number should ask Learner Materials number", function (done) {
        var user = {
            current_state: 'perf_teacher_pupils_books_number',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "90",
            next_state: "perf_teacher_pupils_materials_score",
            response: "^Enter the subtotal that the teacher achieved during the classroom observation " +
            "for Section 4 \\(Learner Materials\\)$"
        });
        p.then(done, done);
    });

    it("entering Learner Materials number incorrectly should ask Learner Materials number again", function (done) {
        var user = {
            current_state: 'perf_teacher_pupils_materials_score',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "score is seventy five",
            next_state: "perf_teacher_pupils_materials_score",
            response: "^Please provide a number value for learner materials subtotal$"
        });
        p.then(done, done);
    });

    it("entering Learner Materials number should ask Time on Task", function (done) {
        var user = {
            current_state: 'perf_teacher_pupils_materials_score',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "75",
            next_state: "perf_teacher_reading_lesson",
            response: "^Enter the subtotal that the teacher achieved during the classroom " +
                "observation for Section 5 \\(Time on Task and Reading Practice\\)$"
        });
        p.then(done, done);
    });

    it("entering Time on Task subtotal incorrectly should ask Time on Task again", function (done) {
        var user = {
            current_state: 'perf_teacher_reading_lesson',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "forty five mins",
            next_state: "perf_teacher_reading_lesson",
            response: "^Please provide a number value for time on task subtotal$"
        });
        p.then(done, done);
    });

    it("entering Time on Task subtotal should ask pupil engagement score", function (done) {
        var user = {
            current_state: 'perf_teacher_reading_lesson',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "45",
            next_state: "perf_teacher_pupil_engagement_score",
            response: "^Enter the subtotal that the teacher achieved during the " +
                "classroom observation for Section 6 \\(Learner Engagement\\)$"
        });
        p.then(done, done);
    });

it("entering pupil engagement score subtotal incorrectly should ask pupil engagement score again", function (done) {
        var user = {
            current_state: 'perf_teacher_pupil_engagement_score',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "low",
            next_state: "perf_teacher_pupil_engagement_score",
            response: "^Please provide a number value for learner engagement subtotal$"
        });
        p.then(done, done);
    });

    it("entering pupil engagement score subtotal should ask attitudes and beliefs", function (done) {
        var user = {
            current_state: 'perf_teacher_pupil_engagement_score',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "22",
            next_state: "perf_teacher_attitudes_and_beliefs",
            response: "^Enter the subtotal that the teacher achieved during the interview " +
                "on Section 7.1. \\(Teacher Attitudes and Beliefs\\)$"
        });
        p.then(done, done);
    });

    it("entering attitudes and beliefs subtotal incorrectly should ask attitudes and beliefs again", function (done) {
        var user = {
            current_state: 'perf_teacher_attitudes_and_beliefs',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "great",
            next_state: "perf_teacher_attitudes_and_beliefs",
            response: "^Please provide a number value for teacher attitudes and beliefs subtotal$"
        });
        p.then(done, done);
    });

    it("entering attitudes and beliefs subtotal should ask teacher training subtotal", function (done) {
        var user = {
            current_state: 'perf_teacher_attitudes_and_beliefs',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "17",
            next_state: "perf_teacher_training_subtotal",
            response: "^Enter the subtotal that the teacher achieved during the interview on " +
                "Section 7.2. \\(Teacher Training\\)$"
        });
        p.then(done, done);
    });

    it("entering teacher training subtotal incorrectly should ask teacher training subtotal again", function (done) {
        var user = {
            current_state: 'perf_teacher_training_subtotal',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22',
                perf_teacher_attitudes_and_beliefs: '17'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "five",
            next_state: "perf_teacher_training_subtotal",
            response: "^Please provide a number value for teacher training interview subtotal$"
        });
        p.then(done, done);
    });

    it("entering teacher training subtotal should ask show success and options", function (done) {
        var user = {
            current_state: 'perf_teacher_training_subtotal',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22',
                perf_teacher_attitudes_and_beliefs: '17'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "5",
            next_state: "perf_teacher_completed",
            response: "^You have successfully added and assessed this teacher. " +
                "What would you like to do now\\?[^]" +
                "1. Add another teacher[^]" +
                "2. Go back to the main menu[^]" +
                "3. Exit$"
        });
        p.then(done, done);
    });
});

describe("When using the USSD line as an recognised MSISDN - completed Teacher review", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = test_fixtures_full;
    beforeEach(function() {
        tester = new vumigo.test_utils.ImTester(app.api, {
            custom_setup: function (api) {
                api.config_store.config = JSON.stringify({
                    sms_short_code: "1234",
                    cms_api_root: 'http://qa/api/'
                });

                var dummy_contact = {
                    key: "f953710a2472447591bd59e906dc2c26",
                    surname: "Trotter",
                    user_account: "test-0-user",
                    bbm_pin: null,
                    msisdn: "+1234567",
                    created_at: "2013-04-24 14:01:41.803693",
                    gtalk_id: null,
                    dob: null,
                    groups: null,
                    facebook_id: null,
                    twitter_handle: null,
                    email_address: null,
                    name: "Rodney"
                };

                api.add_contact(dummy_contact);
                api.update_contact_extras(dummy_contact, {
                    "rts_id": 2,
                    "rts_emis": 1,
                    "rts_last_save_performance_teacher": "106"
                });

                fixtures.forEach(function (f) {
                    api.load_http_fixture(f);
                });
            },
            async: true
        });
    });

    it("selecting to report on another teacher performance should ask for teacher TS number", function (done) {
        var user = {
            current_state: 'perf_teacher_completed',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22',
                perf_teacher_attitudes_and_beliefs: '17'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "perf_teacher_ts_number",
            response: "^Please enter the teacher's TS number$"
        });
        p.then(done, done);
    });

    it("selecting to go to main menu should show it", function (done) {
        var user = {
            current_state: 'perf_teacher_completed',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22',
                perf_teacher_attitudes_and_beliefs: '17'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "initial_state",
            response: "^Welcome to SPERT. What would you like to do\\?[^]" +
                    "1. Add a classroom observation report[^]" +
                    "2. Add a learner performance report[^]" +
                    "3. Change my school$"
        });
        p.then(done, done);
    });

    it("selecting to go to exit should thank and close", function (done) {
        var user = {
            current_state: 'perf_teacher_completed',
            answers: {
                initial_state: 'perf_teacher_ts_number',
                perf_teacher_ts_number: '106',
                perf_teacher_gender: 'female',
                perf_teacher_age: '30',
                perf_teacher_academic_level: '3',
                perf_teacher_years_experience: '0-3',
                perf_teacher_g2_pupils_present: '40',
                perf_teacher_g2_pupils_registered: '50',
                perf_teacher_classroom_environment_score: '10',
                perf_teacher_t_l_materials: '5',
                perf_teacher_pupils_books_number: '90',
                perf_teacher_pupils_materials_score: '75',
                perf_teacher_reading_lesson: '45',
                perf_teacher_pupil_engagement_score: '22',
                perf_teacher_attitudes_and_beliefs: '17'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "3",
            next_state: "end_state",
            response: "^Goodbye! Thank you for using SPERT.$",
            continue_session: false
        });
        p.then(done, done);
    });

});

describe("When using the USSD line as an recognised MSISDN to report on learners", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = test_fixtures_full;
    beforeEach(function() {
        tester = new vumigo.test_utils.ImTester(app.api, {
            custom_setup: function (api) {
                api.config_store.config = JSON.stringify({
                    sms_short_code: "1234",
                    cms_api_root: 'http://qa/api/'
                });

                var dummy_contact = {
                    key: "f953710a2472447591bd59e906dc2c26",
                    surname: "Trotter",
                    user_account: "test-0-user",
                    bbm_pin: null,
                    msisdn: "+1234567",
                    created_at: "2013-04-24 14:01:41.803693",
                    gtalk_id: null,
                    dob: null,
                    groups: null,
                    facebook_id: null,
                    twitter_handle: null,
                    email_address: null,
                    name: "Rodney"
                };

                api.add_contact(dummy_contact);
                api.update_contact_extras(dummy_contact, {
                    "rts_id": 2,
                    "rts_emis": 1
                });

                fixtures.forEach(function (f) {
                    api.load_http_fixture(f);
                });
            },
            async: true
        });
    });

    // first test should always start 'null, null' because we haven't
    // started interacting yet
    it("first display navigation menu", function (done) {
        var p = tester.check_state({
            user: null,
            content: null,
            next_state: "initial_state",
            response: "^Welcome to SPERT. What would you like to do\\?[^]" +
                    "1. Add a classroom observation report[^]" +
                    "2. Add a learner performance report[^]" +
                    "3. Change my school$"
        });
        p.then(done, done);
    });

    it("selecting to report on learner performance should ask for total boys", function (done) {
        var user = {
            current_state: 'initial_state'
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "perf_learner_boys_total",
            response: "^How many boys took part in the learner assessment\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys incorrectly should ask for total boys again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_total',
            answers: {
                initial_state: 'perf_learner_boys_total'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "Fifty two",
            next_state: "perf_learner_boys_total",
            response: "^Please provide a number value for total boys assessed$"
        });
        p.then(done, done);
    });

    it("entering total boys should ask for total girls", function (done) {
        var user = {
            current_state: 'perf_learner_boys_total',
            answers: {
                initial_state: 'perf_learner_boys_total'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "52",
            next_state: "perf_learner_girls_total",
            response: "^How many girls took part in the learner assessment\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls incorrectly should ask for total girls again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_total',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "forty two",
            next_state: "perf_learner_girls_total",
            response: "^Please provide a number value for total girls assessed$"
        });
        p.then(done, done);
    });

    it("entering total girls should ask for boys phonics", function (done) {
        var user = {
            current_state: 'perf_learner_girls_total',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: "52"
            }
        };
        var p = tester.check_state({
            user: user,
            content: "42",
            next_state: "perf_learner_boys_phonetic_awareness",
            response: "^How many boys achieved at least 4 out of 6 correct answers " +
                "for Section 1 \\(Phonics and Phonemic Awareness\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering boys phonics incorrectly should ask for total boys phonics again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_phonetic_awareness',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "lots",
            next_state: "perf_learner_boys_phonetic_awareness",
            response: "^Please provide a number value for total boys achieving 4 out of 6 correct answers$"
        });
        p.then(done, done);
    });

    it("entering boys phonics should ask for total girls phonics", function (done) {
        var user = {
            current_state: 'perf_learner_boys_phonetic_awareness',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "31",
            next_state: "perf_learner_girls_phonetic_awareness",
            response: "^How many girls achieved at least 4 out of 6 correct answers " +
                "for Section 1 \\(Phonics and Phonemic Awareness\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering girls phonics incorrectly should ask for total girls phonics again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_phonetic_awareness',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "loads",
            next_state: "perf_learner_girls_phonetic_awareness",
            response: "^Please provide a number value for total girls achieving 4 out of 6 correct answers$"
        });
        p.then(done, done);
    });

    it("entering girls phonics should ask for total boys vocabulary", function (done) {
        var user = {
            current_state: 'perf_learner_girls_phonetic_awareness',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "32",
            next_state: "perf_learner_boys_vocabulary",
            response: "^How many boys achieved at least 3 out of 6 correct " +
                "answers for Section 2 \\(Vocabulary\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys vocabulary incorrectly should ask for total boys vocabulary again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_vocabulary',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "less",
            next_state: "perf_learner_boys_vocabulary",
            response: "^Please provide a number value for total boys achieving 3 out of 6 correct answers$"
        });
        p.then(done, done);
    });

    it("entering total boys vocabulary should ask for total girls vocabulary", function (done) {
        var user = {
            current_state: 'perf_learner_boys_vocabulary',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "33",
            next_state: "perf_learner_girls_vocabulary",
            response: "^How many girls achieved at least 3 out of 6 correct " +
                "answers for Section 2 \\(Vocabulary\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls vocabulary incorrectly should ask for total girls vocabulary again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_vocabulary',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "lesser",
            next_state: "perf_learner_girls_vocabulary",
            response: "^Please provide a number value for total girls achieving 3 out of 6 correct answers$"
        });
        p.then(done, done);
    });

    it("entering girls vocabulary should ask for total boys comprehension", function (done) {
        var user = {
            current_state: 'perf_learner_girls_vocabulary',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "34",
            next_state: "perf_learner_boys_reading_comprehension",
            response: "^How many boys achieved at least 2 out of 4 correct answers " +
                "for Section 3 \\(Comprehension\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys comprehension incorrectly should ask for total boys comprehension again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_reading_comprehension',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "lessly",
            next_state: "perf_learner_boys_reading_comprehension",
            response: "^Please provide a number value for total boys achieving 2 out of 4 correct answers$"
        });
        p.then(done, done);
    });

    it("entering total boys comprehension should ask for total girls comprehension", function (done) {
        var user = {
            current_state: 'perf_learner_boys_reading_comprehension',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "35",
            next_state: "perf_learner_girls_reading_comprehension",
            response: "^How many girls achieved at least 2 out of 4 correct answers " +
                "for Section 3 \\(Comprehension\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls comprehension incorrectly should ask for total girls comprehension again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_reading_comprehension',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "lesser",
            next_state: "perf_learner_girls_reading_comprehension",
            response: "^Please provide a number value for total girls achieving 2 out of 4 correct answers$"
        });
        p.then(done, done);
    });

    it("entering total girls comprehension should ask for total boys writing", function (done) {
        var user = {
            current_state: 'perf_learner_girls_reading_comprehension',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "36",
            next_state: "perf_learner_boys_writing_diction",
            response: "^How many boys achieved at least 2 out of 4 correct answers " +
                "for Section 4 \\(Writing\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys writing incorrectly should ask for total boys writing again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_writing_diction',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greater",
            next_state: "perf_learner_boys_writing_diction",
            response: "^Please provide a number value for total boys achieving 2 out of 4 correct answers$"
        });
        p.then(done, done);
    });

    it("entering total boys writing should ask for total girls writing", function (done) {
        var user = {
            current_state: 'perf_learner_boys_writing_diction',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "37",
            next_state: "perf_learner_girls_writing_diction",
            response: "^How many girls achieved at least 2 out of 4 correct answers " +
                "for Section 4 \\(Writing\\)\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls writing incorrectly should ask for total girls writing again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_writing_diction',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greatest",
            next_state: "perf_learner_girls_writing_diction",
            response: "^Please provide a number value for total girls achieving 2 out of 4 correct answers$"
        });
        p.then(done, done);
    });

    it("entering total girls comprehension should ask for total boys outstanding results", function (done) {
        var user = {
            current_state: 'perf_learner_girls_writing_diction',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "38",
            next_state: "perf_learner_boys_outstanding_results",
            response: "^In total, how many boys achieved 16 out of 20 or more\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys outstanding results incorrectly should ask for total boys outstanding results again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_outstanding_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greater",
            next_state: "perf_learner_boys_outstanding_results",
            response: "^Please provide a number value for total boys achieving 16 out of 20 or more$"
        });
        p.then(done, done);
    });

    it("entering total boys outstanding results should ask for total girls outstanding results", function (done) {
        var user = {
            current_state: 'perf_learner_boys_outstanding_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "39",
            next_state: "perf_learner_girls_outstanding_results",
            response: "^In total, how many girls achieved 16 out of 20 or more\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls outstanding results incorrectly should ask for total girls outstanding results again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_outstanding_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greatest",
            next_state: "perf_learner_girls_outstanding_results",
            response: "^Please provide a number value for total girls achieving 16 out of 20 or more$"
        });
        p.then(done, done);
    });

    it("entering total girls outstanding results should ask for total boys desirable results", function (done) {
        var user = {
            current_state: 'perf_learner_girls_outstanding_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
            }
        };
        var p = tester.check_state({
            user: user,
            content: "40",
            next_state: "perf_learner_boys_desirable_results",
            response: "^In total, how many boys achieved between 12 and 15 out of 20\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys desirable results incorrectly should ask for total boys desirable results again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_desirable_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greater",
            next_state: "perf_learner_boys_desirable_results",
            response: "^Please provide a number value for total boys achieving between 12 and 15 out of 20$"
        });
        p.then(done, done);
    });

    it("entering total boys desirable results should ask for total girls desirable results", function (done) {
        var user = {
            current_state: 'perf_learner_boys_desirable_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
            }
        };
        var p = tester.check_state({
            user: user,
            content: "41",
            next_state: "perf_learner_girls_desirable_results",
            response: "^In total, how many girls achieved between 12 and 15 out of 20\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls desirable results incorrectly should ask for total girls desirable results again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_desirable_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greatest",
            next_state: "perf_learner_girls_desirable_results",
            response: "^Please provide a number value for total girls achieving between 12 and 15 out of 20$"
        });
        p.then(done, done);
    });

    it("entering total girls desirable results should ask for total boys minimum results", function (done) {
        var user = {
            current_state: 'perf_learner_girls_desirable_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "42",
            next_state: "perf_learner_boys_minimum_results",
            response: "^In total, how many boys achieved between 8 and 11 out of 20\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys minimum results incorrectly should ask for total boys minimum results again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42'

            }
        };
        var p = tester.check_state({
            user: user,
            content: "greater",
            next_state: "perf_learner_boys_minimum_results",
            response: "^Please provide a number value for total boys achieving between 8 and 11 out of 20$"
        });
        p.then(done, done);
    });

    it("entering total boys desirable results should ask for total girls desirable results", function (done) {
        var user = {
            current_state: 'perf_learner_boys_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "43",
            next_state: "perf_learner_girls_minimum_results",
            response: "^In total, how many girls achieved between 8 and 11 out of 20\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls minimum results incorrectly should ask for total girls minimum results again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greatest",
            next_state: "perf_learner_girls_minimum_results",
            response: "^Please provide a number value for total girls achieving between 8 and 11 out of 20$"
        });
        p.then(done, done);
    });

    

    it("entering total girls minimum results should ask for total boys below minimum results", function (done) {
        var user = {
            current_state: 'perf_learner_girls_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "44",
            next_state: "perf_learner_boys_below_minimum_results",
            response: "^In total, how many boys achieved between 0 and 7 out of 20\\?$"
        });
        p.then(done, done);
    });

    it("entering total boys below minimum results incorrectly should ask for total boys below minimum results again", function (done) {
        var user = {
            current_state: 'perf_learner_boys_below_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43',
                perf_learner_girls_minimum_results: '44'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greatering",
            next_state: "perf_learner_boys_below_minimum_results",
            response: "^Please provide a number value for total boys achieving between 0 and 7 out of 20$"
        });
        p.then(done, done);
    });

    it("entering total boys below minimum results should ask for total girls below minimum results", function (done) {
        var user = {
            current_state: 'perf_learner_boys_below_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43',
                perf_learner_girls_minimum_results: '44'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "45",
            next_state: "perf_learner_girls_below_minimum_results",
            response: "^In total, how many girls achieved between 0 and 7 out of 20\\?$"
        });
        p.then(done, done);
    });

    it("entering total girls below minimum results incorrectly should ask for total girls below minimum results again", function (done) {
        var user = {
            current_state: 'perf_learner_girls_below_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43',
                perf_learner_girls_minimum_results: '44',
                perf_learner_boys_below_minimum_results: '45'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "greating",
            next_state: "perf_learner_girls_below_minimum_results",
            response: "^Please provide a number value for total girls achieving between 0 and 7 out of 20$"
        });
        p.then(done, done);
    });

    it("entering teacher training subtotal should ask show success and options", function (done) {
        var user = {
            current_state: 'perf_learner_girls_below_minimum_results',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43',
                perf_learner_girls_minimum_results: '44',
                perf_learner_boys_below_minimum_results: '45'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "46",
            next_state: "perf_learner_completed",
            response: "^Congratulations. You have finished reporting on the learner assessment.[^]" +
                "1. Go back to the main menu[^]" +
                "2. Exit$"
        });
        p.then(done, done);
    });
});

describe("When using the USSD line as an recognised MSISDN - completed Learner review", function() {

    // These are used to mock API reponses
    // EXAMPLE: Response from google maps API
    var fixtures = test_fixtures_full;
    beforeEach(function() {
        tester = new vumigo.test_utils.ImTester(app.api, {
            custom_setup: function (api) {
                api.config_store.config = JSON.stringify({
                    sms_short_code: "1234",
                    cms_api_root: 'http://qa/api/'
                });

                var dummy_contact = {
                    key: "f953710a2472447591bd59e906dc2c26",
                    surname: "Trotter",
                    user_account: "test-0-user",
                    bbm_pin: null,
                    msisdn: "+1234567",
                    created_at: "2013-04-24 14:01:41.803693",
                    gtalk_id: null,
                    dob: null,
                    groups: null,
                    facebook_id: null,
                    twitter_handle: null,
                    email_address: null,
                    name: "Rodney"
                };

                api.add_contact(dummy_contact);
                api.update_contact_extras(dummy_contact, {
                    "rts_id": 2,
                    "rts_emis": 1,
                    "rts_last_save_performance_teacher": "106",
                    "rts_last_save_performance_learner": "true"
                });

                fixtures.forEach(function (f) {
                    api.load_http_fixture(f);
                });
            },
            async: true
        });
    });

    it("selecting to go to main menu should show it", function (done) {
        var user = {
            current_state: 'perf_learner_completed',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43',
                perf_learner_girls_minimum_results: '44',
                perf_learner_boys_below_minimum_results: '45',
                perf_learner_girls_below_minimum_results: '46'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "1",
            next_state: "initial_state",
            response: "^Welcome to SPERT. What would you like to do\\?[^]" +
                    "1. Add a classroom observation report[^]" +
                    "2. Add a learner performance report[^]" +
                    "3. Change my school$"
        });
        p.then(done, done);
    });

    it("selecting to go to exit should thank and close", function (done) {
        var user = {
            current_state: 'perf_learner_completed',
            answers: {
                initial_state: 'perf_learner_boys_total',
                perf_learner_boys_total: '52',
                perf_learner_girls_total: '42',
                perf_learner_boys_phonetic_awareness: '31',
                perf_learner_girls_phonetic_awareness: '32',
                perf_learner_boys_vocabulary: '33',
                perf_learner_girls_vocabulary: '34',
                perf_learner_boys_reading_comprehension: '35',
                perf_learner_girls_reading_comprehension: '36',
                perf_learner_boys_writing_diction: '37',
                perf_learner_girls_writing_diction: '38',
                perf_learner_boys_outstanding_results: '39',
                perf_learner_girls_outstanding_results: '40',
                perf_learner_boys_desirable_results: '41',
                perf_learner_girls_desirable_results: '42',
                perf_learner_boys_minimum_results: '43',
                perf_learner_girls_minimum_results: '44',
                perf_learner_boys_below_minimum_results: '45',
                perf_learner_girls_below_minimum_results: '46'
            }
        };
        var p = tester.check_state({
            user: user,
            content: "2",
            next_state: "end_state",
            response: "^Goodbye! Thank you for using SPERT.$",
            continue_session: false
        });
        p.then(done, done);
    });
});
