go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;

    var GoApp = App.extend(function(self) {
        App.call(self, 'state_lp_start');



        // REGISTER HEAD TEACHER STATES
        // ----------------------------

        self.states.add('state_rht_start', function(name) {
            return go.rht.state_rht_start(name);
        });

        self.states.add('state_rht_exit', function(name) {
            return go.rht.state_rht_exit(name);
        });



        // REGISTER DISTRICT OFFICIAL STATES
        // ---------------------------------

        self.states.add('state_rdo_start', function(name) {
            return go.rdo.state_rdo_start(name);
        });

        self.states.add('state_rdo_exit', function(name) {
            return go.rdo.state_rdo_exit(name);
        });



        // CHANGE MANAGEMENT STATES
        // ------------------------

        self.states.add('state_cm_start', function(name) {
            return go.cm.state_cm_start(name);
        });

        self.states.add('state_cm_exit', function(name) {
            return go.cm.state_cm_exit(name);
        });



        // LEARNER PERFORMANCE STATES
        // --------------------------

        self.states.add('state_lp_start', function(name) {
            return go.lp.state_lp_start(name);
        });

        self.states.add('state_lp_next', function(name) {
            return go.lp.state_lp_next(name);
        });

        self.states.add('state_lp_exit', function(name) {
            return go.lp.state_lp_exit(name);
        });



        // TEACHER PERFORMANCE STATES
        // --------------------------

        self.states.add('state_tp_start', function(name) {
            return go.tp.state_tp_start(name);
        });

        self.states.add('state_tp_next', function(name) {
            return go.tp.state_tp_next(name);
        });

        self.states.add('state_tp_exit', function(name) {
            return go.tp.state_tp_exit(name);
        });



        // SCHOOL PERFORMANCE STATES
        // --------------------------

        self.states.add('state_sp_start', function(name) {
            return go.sp.state_sp_start(name);
        });

        self.states.add('state_sp_next', function(name) {
            return go.sp.state_sp_next(name);
        });

        self.states.add('state_sp_exit', function(name) {
            return go.sp.state_sp_exit(name);
        });

    });

    return {
        GoApp: GoApp
    };
}();
