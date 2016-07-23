
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    game.load.atlas('breakout', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
    game.load.image('starfield', 'assets/misc/starfield.jpg');

}

var ball;
var paddle1;
var paddle2;
var bricks;

var ballOnPaddle = true;

var score = 0;

var scoreTextBlue;
var scoreTextRed;
var introText;

var lastToucher;
var lastEnhancement = Date.now();

var s;

var teamBlueColor = '#00ccff';
var teamRedColor = '#ff0000';

var controller1;
var controller2;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;

    s = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var brick;

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 15; x++)
        {
            brick = new Brick(bricks, 120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_' + (y+1) + '_1.png');
        }
    }

    paddle1 = new Paddle(game, 'paddle_blue_big.png', { x: 0.5, y: 0.5, name: 'blue' });
    paddle2 = new Paddle(game, 'paddle_red_big.png', { x: 0.5, y: 0.5, name: 'red' });

    controller1 = game.input.keyboard.addKeys({
        left: Phaser.Keyboard.LEFT,
        right: Phaser.Keyboard.RIGHT,
        up: Phaser.Keyboard.UP,
        down: Phaser.Keyboard.DOWN,

    });
    controller2 = game.input.keyboard.addKeys({
        left: Phaser.Keyboard.A,
        right: Phaser.Keyboard.D,
        up: Phaser.Keyboard.W,
        down: Phaser.Keyboard.S,
        jump: Phaser.Keyboard.E,
    });

    ball = new Ball(game, {
        x: game.world.centerX,
        y: paddle1.y - 16,
        animations: {
            type: 'spin',
            frames: [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ],
            frameRate: 50,
            loop: true
        }
    }, 'breakout', 'ball_1.png');

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreTextBlue = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: teamBlueColor, align: "left" });
    scoreTextRed = game.add.text(680, 550, 'score: 0', { font: "20px Arial", fill: teamRedColor, align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- press spacebar to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    var spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spacebar.onDown.add(releaseBall, this);

}

function update () {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    s.tilePosition.x ++;

if (controller2.left.isDown) {
        paddle2.x = paddle2.x - paddle2.moveRate;
    }
    else if (controller2.right.isDown) {
        paddle2.x = paddle2.x + paddle2.moveRate;
    }
    else if (controller2.up.isDown) {
        paddle2.angle += 10;
    }
    else if (controller2.down.isDown) {
        paddle2.angle -= 10;
    }


    if (controller1.left.isDown) {
        paddle1.x = paddle1.x - paddle1.moveRate;
    }
    else if (controller1.right.isDown) {
        paddle1.x = paddle1.x + paddle1.moveRate;
    }
     else if (controller1.up.isDown) {
        paddle1.angle += 10;
    }
    else if (controller1.down.isDown) {
        paddle1.angle -= 10;
    }

    // if (controller2.jump.isDown) {

    if (!lastToucher) {
        lastToucher = paddle2;
    }

    _.map([paddle1, paddle2], function(paddle) {
        if (paddle.x < 24) {
            paddle.x = 24;
        }
        else if (paddle.x > game.width - 24) {
            paddle.x = game.width - 24;
        }

        if (ballOnPaddle) {
            ball.body.x = lastToucher.x;
        } else {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
        }
    });

    game.physics.arcade.collide(paddle1, paddle2, PaddleCollisionHandler, null, this);
}

function lastToucherIsPaddle1() {
    return lastToucher.name === paddle1.name;
}

function notLastToucher() {
    return lastToucherIsPaddle1() ? paddle2 : paddle1;
}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
    }

}

function ballLost () {

    ballOnPaddle = true;

    ball.reset(lastToucher.body.x + 16, lastToucher.y - 16);

    ball.animations.stop();

}

function ballHitBrick (_ball, _brick) {

    _brick.kill();

    if (Math.floor(Math.random() * 100) > 80) {
        if (lastEnhancement + 10000 >= Date.now()) {
            lastEnhancement = Date.now();
            new Enhancement().trigger(
                lastToucher,
                notLastToucher()
            );
        }
    }

    lastToucher.score += 10;

    var scoreStr = 'score: ' + lastToucher.score;
    lastToucherIsPaddle1() ? scoreTextBlue.text = scoreStr : scoreTextRed.text = scoreStr;

    //  Are they any bricks left?
    //  TODO remove this and show who wins
    if (bricks.countLiving() == 0)
    {
        var scoreText;
        if (paddle1.score > paddle2.score) {
            scoreText = 'Blue wins!';
        }
        else if (paddle1.score == paddle2.score) {
            scoreText = "It's a draw!";
        }
        else {
            scoreText = 'Red wins!';
        }

        var winText = game.add.text(game.world.centerX, 400, winText, { font: "40px Arial", fill: "#ffffff", align: "center" });
        winText.anchor.setTo(0.5, 0.5);
    }

}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;
    lastToucher = _paddle;

    if (_ball.x < _paddle.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

}
