var el = document.querySelector('#game-canvas');
var game = new Phaser.Game(el.clientWidth, el.clientHeight, Phaser.AUTO, el, { preload: preload, create: create, update: update  });

function preload() {
    game.load.image('road', 'assets/tunnel_road.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('oil', 'assets/oil.png');
    game.load.image('beer', 'assets/beer.png');
    game.load.image('obstacle', 'assets/obstacle.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('car', 'assets/car_blue.png', 32, 48);

}

var player;
var cursors;

var stars;
var score = 0;
var scoreText;

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
    // player = game.add.sprite(25, (window.innerHeight -  parseInt(window.innerHeight / 5, 10)), 'car');
    // player = game.add.sprite(25, game.height, 'car');
    player = game.add.sprite(25, game.height, 'car');
    // player.scale.setTo(scaleFactor * 3, scaleFactor * 3);
    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.gravity.y = 0;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 0, true);
    player.animations.add('right', [5, 6, 7, 8], 0, true);

    //  Finally some stars to collect
    //stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    //stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    /*for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
*/
    //  The score
    scoreText = game.add.text(24, 24, 'score: 0', { fontSize: '48px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

}

function createRoadObject() {
    var roadObjectRnd = Math.random();
    var roadObject;
    if(roadObjectRnd < 0.3) {
        roadObject = oilPuddles.create(Math.random() * game.width | 0, 0, 'oil');
        // roadObject.scale.setTo(2.5,2.5);
    }
    else if (roadObjectRnd < 0.6) {
        roadObject = beerGlasses.create(Math.random() * game.width | 0, 0, 'beer');
        // roadObject.scale.setTo(2.5,2.5);
    }
    else if (roadObjectRnd < 0.8) {
        roadObject = stars.create(Math.random() * game.width | 0, 0, 'star');
        // roadObject.scale.setTo(3.5,3.5);
    }
    else {
        var positionX = Math.random() * game.width | 0;
        positionX = positionX > (0.75 * game.width) ?  (0.75 * game.width) : positionX;
        roadObject = obstacles.create(positionX, 0, 'obstacle');
        // roadObject.scale.setTo(2,2);
    }
    roadObject.enableBody = true;
    roadObject.body.gravity.y = 500;
    setTimeout(function() {roadObject.kill();roadObject.destroy();}, 4000);
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
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
}

var log = x => console.log(x);

function update(game) {

    log(game);
    log = x => x;

    road.tilePosition.y += 10;
    //  Collide the player and the stars with the platforms
    //game.physics.arcade.collide(player, obstacles);

    if(Math.random() > 0.985)
        createRoadObject();

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, oilPuddles, setSlideAround, null, this);
    game.physics.arcade.overlap(player, beerGlasses, setInvertControls, null, this);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, obstacles, function() {
        player.kill();
        game.destroy();
        setTimeout(function(){}, 5000);
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
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = invertedControls ? -laneOffset : laneOffset;
    }
}
