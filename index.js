Vue.filter('time', val => {
    return `0:${val}`;
});

var vm = new Vue({
    data: {
        time: 48,
        score: 15000,

        running: false
    },

    computed: {
        startScreenVisible: function() {
            return !this.running;
        }
    },

    methods: {
        start: function() {
            console.log('start game');
            this.running = true;
            console.log(this.startScreenVisible)
        },

        left: function() {
            console.log('left');
        },

        keypress: function(dir) {
            console.log('!!', dir);
        }
    },

    el: 'main'
});

document.addEventListener('keydown', e => {
    switch (e.keyCode) {
        case 40:
            return vm.keypress('brake');
        case 37:
            return vm.keypress('left');
        case 39:
            return vm.keypress('right');
        // default:
        //     console.log(e.keyCode);
    }
})
