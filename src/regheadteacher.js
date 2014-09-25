var vumigo = require('vumigo_v02');
var FreeText = vumigo.states.FreeText;
var EndState = vumigo.states.EndState;
var ChoiceState = vumigo.states.ChoiceState;
var Choice = vumigo.states.Choice;


go.rht = {
    // Registration of Head Teacher States

    reg_emis: function(name) {
        return new FreeText(name, {
            question: 
                "Please enter your school's EMIS number. " +
                "This should have 4-6 digits e.g. 4351.",

            next: "reg_emis_validates"
        });
    },

    reg_emis_validates: function(name) {
        return new ChoiceState(name, {
            question: 
                "Thanks for claiming this EMIS. Redial this number if you ever " +
                "change cellphone number to reclaim the EMIS and continue to receive " +
                "SMS updates.",

            choices: [
                new Choice('continue', "Continue")
            ],

            next: "reg_school_name"
        });
    },

    reg_school_name: function(name) {
        return new FreeText(name, {
            question: "Please enter the name of your school, e.g. Kapililonga",

            next: "reg_first_name"
        });
    },

    reg_first_name: function(name) {
        return new FreeText(name, {
            question: "Please enter your FIRST name.",

            next: "reg_surname"
        });
    },

    reg_surname: function(name) {
        return new FreeText(name, {
            question: "Please enter your SURNAME.",

            next: "reg_date_of_birth"
        });
    },

    reg_date_of_birth: function(name) {
        var error = "Please enter your date of birth formatted DDMMYYYY";

        var question = "Please enter your date of birth. Start with the day, followed by " +
                        "the month and year, e.g. 27111980";

        return new FreeText(name, {
            question: question,

            check: function(content) {
                if (go.utils.check_and_parse_date(content) === false) {
                    return error;
                }
            },

            next: "reg_gender"
        });
    },

    reg_gender: function(name) {
        return new ChoiceState(name, {
            question: "What is your gender?",

            choices: [
                new Choice('female', 'Female'),
                new Choice('male', 'Male')
            ],

            next: "reg_school_boys"
        });
    },

    reg_school_boys: function(name) {
        return new FreeText(name, {
            question: "How many boys do you have in your school?",

            next: "reg_school_girls"
        });
    },

    reg_school_girls: function(name) {
        return new FreeText(name, {
            question: "How many girls do you have in your school?",

            next: "reg_school_classrooms"
        });
    },

    reg_school_classrooms: function(name) {
        return new FreeText(name, {
            question: "How many classrooms do you have in your school?",

            next: "reg_school_teachers"
        });
    },

    reg_school_teachers: function(name) {
        return new FreeText(name, {
            question:
                "How many teachers are presently working in your school, " +
                "including the head teacher?",

            next: "reg_school_teachers_g1"
        });
    },

    reg_school_teachers_g1: function(name) {
        return new FreeText(name, {
            question: "How many teachers teach Grade 1 local language?",

            next: "reg_school_teachers_g2"
        });
    },

    reg_school_teachers_g2: function(name) {
        return new FreeText(name, {
            question: "How many teachers teach Grade 2 local language?",

            next: "reg_school_students_g2_boys"
        });
    },

    reg_school_students_g2_boys: function(name) {
        return new FreeText(name, {
            question: "How many boys are ENROLLED in Grade 2 at your school?",

            next: "reg_school_students_g2_girls"
        });
    },

    reg_school_students_g2_girls: function(name) {
        return new FreeText(name, {
            question: "How many girls are ENROLLED in Grade 2 at your school?",

            next: "reg_zonal_head"
        });
    },

    reg_zonal_head: function(name) {
        return new ChoiceState(name, {
            question: "Are you a Zonal Head Teacher?",

            choices: [
                new Choice('reg_thanks_zonal_head', 'Yes'),
                new Choice('reg_zonal_head_name', 'No')
            ],

            next: function(choice) {
                return choice.value;
            }
        });
    },

    reg_thanks_zonal_head: function(name) {
        return new EndState(name, {
            text:
                "Well done! You are now registered as a Zonal Head " +
                "Teacher. When you are ready, dial in to start " +
                "reporting. You will also receive monthly SMS's from " +
                "your zone.",

            next: "initial_state"
        });
    },

    reg_zonal_head_name: function(name) {
        return new FreeText(name, {
            question: "Please enter the name and surname of your ZONAL HEAD TEACHER.",

            next: "reg_thanks_head_teacher"
        });
    },

    reg_thanks_head_teacher: function(name) {
        return new EndState(name, {
            text:
                "Congratulations! You are now registered as a user of " +
                "the Gateway! Please dial in again when you are ready to " +
                "start reporting on teacher and learner performance.",

            next: "initial_state"
        });
    }

};
