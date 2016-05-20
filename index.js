Vue.filter('time', val => {
    return `${Math.round(val)} sec`;
});

var vm = new Vue({
    data: {
        time: 0,
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
            vm.score = 0;
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

window.PubSub.sub('time', time => vm.time = time);

window.PubSub.sub('game-over', _ => {
    vm.running = false;
    vm.time = 0;
});

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
