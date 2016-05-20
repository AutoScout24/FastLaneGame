Vue.filter('time', val => {
    return `${Math.round(val)} sec`;
});

var vm = new Vue({
    data: {
        time: 48,
        score: 0,
        running: false,
        persona: ''
    },

    computed: {
        startScreenVisible: function() {
            return !this.running;
        }
    },

    methods: {
        start: function(persona) {
            this.running = true;
            this.persona = persona;
            window.PubSub.pub('game-started', { persona });
        },

        keypress: function(dir) {
            console.log('Key pressed:', dir);
            // Game[dir]();
        }
    },

    el: 'main'
});

window.PubSub.sub('score', score => vm.score += score);

document.addEventListener('keydown', e => {
    switch (e.keyCode) {
        case 40:
            return vm.keypress('brake');
        case 37:
            return vm.keypress('left');
        case 39:
            return vm.keypress('right');
    }
});


const started = Date.now();

setInterval(_ => {
    vm.time = 60 - (Date.now() - started) / 1000;
});


// Game.onTimeChange(time => vm.time = time);
// Game.onScoreChange(score => vm.score = score);
// Game.onFinish(result => {
//     vm.time = 0;
//     vm.score = result.score;
//     ...
// });
