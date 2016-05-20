window.Game = {
    init: _ => {},
    start: _ => {},
    pause: _ => {},
    reset: _ => {},

    keydown: dir => {},
    keyup: dir => {}
};


window.PubSub.sub('game-started', e => {


// window.PubSub.sub('game-started', e => { console.log('started'); });


var el = document.querySelector('#game-canvas');
var game = new Phaser.Game(el.clientWidth, el.clientHeight, Phaser.AUTO, el, { preload: preload, create: create, update: update  });

// game.pause();

function preload() {
    game.load.image('road', 'assets/tunnel_road.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('oil', 'assets/oil.png');
    game.load.image('beer', 'assets/beer.png');
    game.load.image('obstacle', 'assets/obstacle.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('car', 'assets/car_blue.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);

}

var player;
var cursors;
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

    // The player and its settings
    player = game.add.sprite(25, game.height, 'car');
    var carScaleFactor = (game.width / 10) / 26;

    player.scale.setTo(carScaleFactor, carScaleFactor);

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.gravity.y = 0;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0], 0, true);
    player.animations.add('right', [0], 0, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
        maxBgSpeed = 7;
        currentBgSpeed = 0;
        maxObstacleSpeed = 400;
        window.setInterval(function() {
            if(currentBgSpeed < maxBgSpeed) {
                currentBgSpeed++;
            }
    }, 300);
}

function createRoadObject() {
    var roadObjectRnd = Math.random();
    var roadObject;
    var scaleFactor = 1;

    if(roadObjectRnd < 0.3) {
        roadObject = oilPuddles.create(Math.random() * (game.width - 48) | 0, 0, 'oil');
        scaleFactor = (game.width / 10) / 48;
    }
    else if (roadObjectRnd < 0.6) {
        roadObject = beerGlasses.create(Math.random() * (game.width - 48) | 0, 0, 'beer');
        scaleFactor = (game.width / 10) / 48;
    }
    else if (roadObjectRnd < 0.8) {
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
    // Removes the star from the screen
    star.kill();
}

var log = x => console.log(x);

function update(game) {

    log(game);
    log = x => x;

    road.tilePosition.y += currentBgSpeed;
    player.angle = 0;
    //  Collide the player and the stars with the platforms
    //game.physics.arcade.collide(player, obstacles);

    if(currentBgSpeed == maxBgSpeed && Math.random() > 0.985)
        createRoadObject();

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, oilPuddles, setSlideAround, null, this);
    game.physics.arcade.overlap(player, beerGlasses, setInvertControls, null, this);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, obstacles, function() {
        var explosions = game.add.group();
        var explosion = explosions.create(player.position.x, player.position.y, 'kaboom');
        explosion.animations.add('kaboom');
        explosion.play('kaboom', 30, false, true);

        player.kill();
        //game.destroy();
    }, null, this);


    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    var laneOffset = game.width;
    if(slidingAround){
        player.body.velocity.x = Math.random() > 0.5  ? (laneOffset /2) : -(laneOffset/2);
        return;
    }
    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = invertedControls ? laneOffset : -laneOffset;
        player.angle = invertedControls ? 10 : -10;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = invertedControls ? -laneOffset : laneOffset;
        player.angle = invertedControls ? -10 : 10;
    }
}

 });
