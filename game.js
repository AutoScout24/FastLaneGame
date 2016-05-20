'use strict';

window.PhaserGlobal = { disableWebAudio: true };

const gameLength = 10;

window.PubSub.sub('game-started', e => {

    var el = document.querySelector('#game-canvas');

    if (window.game) {
        window.game.destroy();
    }

    window.game = new Phaser.Game(el.clientWidth, el.clientHeight, Phaser.AUTO, el, { preload: preload, create: create, update: update  });

    const started = Date.now();
    const interval = setInterval(_ => {
        const timeToGo = gameLength - (Date.now() - started) / 1000;
        window.PubSub.pub('time', timeToGo);

        if (timeToGo <= 0) {
            window.PubSub.pub('game-over');
            showExplosion();
        }
    });

    window.PubSub.sub('game-over', _ => clearInterval(interval));


    function preload() {
        game.load.image('road', 'assets/tunnel_road.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('oil', 'assets/oil.png');
        game.load.image('beer', 'assets/beer.png');
        game.load.image('obstacle', 'assets/obstacle.png');
        game.load.image('star', 'assets/star.png');

        game.load.image('car_traffic', 'assets/car_traffic.png');
        game.load.image('motorcycle', 'assets/motorcycle.png');


        game.load.image('car_jan', 'assets/car_jan.png');
        game.load.image('car_shenaz', 'assets/car_shenaz.png');
        game.load.image('car_johanna', 'assets/car_johanna.png');
        game.load.image('car_volker', 'assets/car_volker.png');

        game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
        game.load.audio('pickup-coin', 'assets/pickup-coin.wav');
        game.load.audio('explosion', 'assets/explosion.wav');
    }


    var player;
    var road;
    var scaleFactor;
    var maxBgSpeed;
    var oilPuddles;
    var beerGlasses;
    var motorcycles;
    var traffic;
    var obstacles;
    var currentBgSpeed;
    var maxObstacleSpeed;
    var scoreBonus;

    var cursors = { left: false, right: false };

    window.PubSub.sub('keydown', dir => {
        cursors[dir] = true;
    });

    window.PubSub.sub('keyup', dir => {
        cursors[dir] = false;
    });

    var stars;

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        road = game.add.tileSprite(0, 0, game.width, game.height, 'road');
        scaleFactor = game.width / game.height;

        // road.scale.setTo(scaleFactor, scaleFactor);

        // Here we create the ground.
        oilPuddles = game.add.group();
        oilPuddles.enableBody = true;

        beerGlasses = game.add.group();
        beerGlasses.enableBody = true;

        obstacles = game.add.group();
        obstacles.enableBody = true;

        stars = game.add.group();
        stars.enableBody = true;


        traffic = game.add.group();
        traffic.enableBody = true;

        motorcycles = game.add.group();
        motorcycles.enableBody = true;

        // The player and its settings
        player = game.add.sprite(game.width / 2, game.height - 50, 'car_' + e.persona);
        var carScaleFactor = (game.width / 10) / 65;
        player.anchor.setTo(0.5,0.5);
        player.scale.setTo(carScaleFactor, carScaleFactor);

        //  We need to enable physics on the player
        game.physics.arcade.enable(player);

        //  Player physics properties. Give the little guy a slight bounce.
        player.body.gravity.y = 0;
        player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        player.animations.add('left', [0], 0, true);
        player.animations.add('right', [0], 0, true);

        maxBgSpeed = getMaxBgSpeed(e.persona);;
        currentBgSpeed = 0;
        maxObstacleSpeed = getMaxObstacleSpeed(e.persona);
        scoreBonus = getScoreBonus(e.persona);

        /*window.setInterval(function() {
            if(currentBgSpeed < maxBgSpeed) {
                currentBgSpeed++;
            }
        }, 300);*/
    }

    function getScoreBonus(hero) {
        if(hero == 'jan') {
            return 20;
        } else if(hero == 'volker') {
            return 5;
        }
        return 10;
    };

    function getMaxBgSpeed(hero) {
        if(hero == 'jan') {
            return 10;
        } else if(hero == 'volker') {
            return 5;
        }
        return 7;
    };

    function getMaxObstacleSpeed(hero) {
        if(hero == 'jan') {
            return 580;
        } else if(hero == 'volker') {
            return 300;
        }
        return 400;
    };

    function createRoadObject() {
        var roadObjectRnd = Math.random();
        var roadObject;
        var scaleFactor = 1;

        if(roadObjectRnd < 0.18) {
            roadObject = oilPuddles.create(Math.random() * (game.width - 48) | 0, 0, 'oil');
            scaleFactor = (game.width / 10) / 48;
        }
        else if (roadObjectRnd < 0.36) {
            roadObject = beerGlasses.create(Math.random() * (game.width - 48) | 0, 0, 'beer');
            scaleFactor = (game.width / 10) / 48;
        }
        else if (roadObjectRnd < 0.9) {
            roadObject = stars.create(Math.random() * (game.width - 30) | 0, 0, 'star');
            scaleFactor = (game.width / 10) / 30;
        }
        else {
            var positionX = Math.random() * game.width | 0;
            positionX = positionX > (0.75 * game.width) ?  (0.75 * game.width) : positionX;
            roadObject = obstacles.create(positionX, 0, 'obstacle');
            scaleFactor = (game.width / 6) / 100;
        }

        roadObject.scale.setTo(scaleFactor, scaleFactor);
        roadObject.enableBody = true;
        roadObject.body.velocity.y = maxObstacleSpeed;
        setTimeout(function() {
             roadObject.kill();
             roadObject.destroy();
        }, 4000);


        if(roadObjectRnd < 0.075) {
            var carScaleFactor = (game.width / 10) / 65;
            var enemycar = traffic.create(Math.random() * (game.width - 48) | 0, -50, 'car_traffic');
            enemycar.scale.setTo(carScaleFactor, carScaleFactor);
            enemycar.enableBody = true;
            enemycar.body.gravity.y = maxObstacleSpeed / 3;
            //enemycar.body.immovable = true;
            setTimeout(function() {
                enemycar.kill();
                enemycar.destroy();
            }, 10000);
        } else if(roadObjectRnd > 0.925) {
            var motoScaleFactor = (game.width / 10) / 60;
            var motorcycle = motorcycles.create(Math.random() * (game.width - 48) | 0, -50, 'motorcycle');
            motorcycle.scale.setTo(motoScaleFactor, motoScaleFactor);
            motorcycle.enableBody = true;
            motorcycle.body.gravity.y = maxObstacleSpeed / 3;
            //motorcycle.body.immovable = true;
            setTimeout(function() {
                motorcycle.kill();
                motorcycle.destroy();
            }, 10000);
        }
    };

    var invertedControls = false;
    var slidingAround = false;
    function setInvertControls(player, beer) {
        invertedControls = true;
        beer.kill();
        beer.destroy();
        setTimeout(function() {invertedControls = false;}, 3000);
    };

    function setSlideAround(player, puddle) {
        slidingAround = true;
        puddle.kill();
        puddle.destroy();
        setTimeout(function() {slidingAround = false;}, 1600);
    };

    function collectStar (player, star) {
        window.PubSub.pub('score', 10);
        game.sound.play('pickup-coin', 0.5);
        // Removes the star from the screen
        star.kill();
    }

    function showExplosion() {
        var explosions = game.add.group();
        var explosion = explosions.create(player.position.x, player.position.y - 60, 'kaboom');
        explosion.animations.add('kaboom');
        explosion.play('kaboom', 30, false, true);
        game.sound.play('explosion', 1);
        player.kill();
        //game.destroy();

        window.PubSub.pub('game-over');
    }

    function update(game) {
        road.tilePosition.y += maxBgSpeed;
        if(!slidingAround)
            player.angle = 0;

        //  Collide the player and the stars with the platforms
        //game.physics.arcade.collide(player, obstacles);

        if(Math.random() > 0.985)
            createRoadObject();

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        game.physics.arcade.overlap(player, oilPuddles, setSlideAround, null, this);
        game.physics.arcade.overlap(player, beerGlasses, setInvertControls, null, this);
        game.physics.arcade.overlap(player, stars, collectStar, null, this);
        game.physics.arcade.overlap(player, obstacles, showExplosion, null, this);
        game.physics.arcade.collide(player, motorcycles);
        game.physics.arcade.collide(player, traffic);

        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;
        var laneOffset = game.width;
        if(slidingAround){
            player.body.velocity.x = Math.random() > 0.5  ? (laneOffset /10) : -(laneOffset/10);
            var angle = parseInt(Math.random() * 180);
            player.angle = player.angle + 10;
            return;
        }
        if (cursors.left)
        {
            //  Move to the left
            player.body.velocity.x = invertedControls ? laneOffset : -laneOffset;
            player.angle = invertedControls ? 10 : -10;
        }
        else if (cursors.right)
        {
            //  Move to the right
            player.body.velocity.x = invertedControls ? -laneOffset : laneOffset;
            player.angle = invertedControls ? -10 : 10;
        }
    }
});
