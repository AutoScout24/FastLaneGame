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

        keydown: dir => {
            window.PubSub.pub('keydown', dir);
        },

        keyup: dir => {
            window.PubSub.pub('keyup', dir);
        }
    },

    el: 'main'
});

window.PubSub.sub('score', score => vm.score += score);

document.addEventListener('keydown', e => {
    switch (e.keyCode) {
        case 37:
            window.PubSub.pub('keydown', 'left');
            return;
        case 39:
            window.PubSub.pub('keydown', 'right');
            return;
    }
});

document.addEventListener('keyup', e => {
    switch (e.keyCode) {
        case 37:
            window.PubSub.pub('keyup', 'left');
            return;
        case 39:
            window.PubSub.pub('keyup', 'right');
            return;
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
