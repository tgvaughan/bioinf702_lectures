$(document).ready(function() {
    $("#HMMsim").click(function(e) {
        e.preventDefault();
        var res = HMM.sim();
        $("#HMMsim_output").text(HMM.getSimString(res[0], res[1]));
    });

    $("#HMMviterbi").click(function(e) {
        e.preventDefault();
        var res = HMM.sim();
        $("#HMMviterbi_output").text(HMM.getSimString(res[0], res[1])
                                + "\n"
                                + HMM.getViterbiString(HMM.viterbi(res[1])));
    });
});

HMM = (function() {

    states = ["F", "U"];
    obs = ["H", "T"];

    var M = [
        [ 0.95, 0.05 ],
        [ 0.1,  0.9  ]
    ];

    var e = [
        [0.5, 0.5],
        [0.9, 0.1]
    ];

    var N = 90;

    function sim() {
        function toss(state) {
            if (Math.random()<e[state][0])
                return 0;
            else
                return 1;
        }

        function propagate(state) {
            if (Math.random()<M[state][state])
                return state;
            else
                return 1-state;
        }

        var state_sequence = [0];
        var obs_sequence = [toss(state_sequence[0])];

        var i;
        for (i=1; i<N; i++) {
            state_sequence[i] = propagate(state_sequence[i-1]);
            obs_sequence[i] = toss(state_sequence[i]);
        }

        return [state_sequence, obs_sequence];
    }

    function getSimString(state_sequence, obs_sequence) {
        var statesString = "States: ";
        var obsString =    "   Obs: ";
        for (i=0; i<N; i++) {
            statesString += states[state_sequence[i]];
            obsString += obs[obs_sequence[i]];
        }

        return statesString + "\n" + obsString;
    }

    function getViterbiString(obs_sequence) {
        var obsString =    "Viterb: ";
        for (i=0; i<N; i++) {
            obsString += states[obs_sequence[i]];
        }

        return obsString;
    }


    function viterbi(obs_sequence) {
        var v = [[e[0][obs_sequence[0]]*M[0][0], e[1][obs_sequence[0]]*M[0][1]]];
        var ptr = [[0, 0]];

        var i;
        for (i=1; i<N; i++) {
            v[i] = [];
            ptr[i] = [];
            var x = obs_sequence[i];
            for (var l=0; l<=1; l++) {
                var q = Number.NEGATIVE_INFINITY;
                var kmax = undefined;
                for (var k=0; k<=1; k++) {
                    var newq = v[i-1][k]*M[k][l];
                    if (newq > q) {
                        q = newq;
                        kmax = k;
                    }
                }
                v[i][l] = e[l][x]*q;
                ptr[i][l] = kmax;
            }
        }

        var path = Array(N);
        if (v[N-1][0] > v[N-1][1])
            path[N-1] = [0];
        else
            path[N-1] = [1];

        for (i=N-2; i>=0; i--) {
            path[i] = ptr[i+1][path[i+1]];
        }

        return path;
    }

    return {
        sim: sim,
        getSimString: getSimString,
        viterbi: viterbi,
        getViterbiString: getViterbiString
    }
})();
