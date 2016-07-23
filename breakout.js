
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

var lives = 3;
var score = 0;

var scoreTextBlue;
var scoreTextRed;
var livesTextBlue;
var livesTextRed;
var introText;

var lastToucher;
var lastEnhancement = Date.now();

var s;

var teamBlueColor = '#00ccff';
var teamRedColor = '#ff0000';

var cursors;
var wasd;

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

    cursors = game.input.keyboard.createCursorKeys();
    wasd = game.input.keyboard.addKeys({
        left: Phaser.Keyboard.A,
        right: Phaser.Keyboard.D,
    })

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
    livesTextBlue = game.add.text(32, 32, 'lives: 3', { font: "20px Arial", fill: teamBlueColor, align: "left" });
    livesTextRed = game.add.text(680, 32, 'lives: 3', { font: "20px Arial", fill: teamRedColor, align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- press spacebar to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    var spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spacebar.onDown.add(releaseBall, this);

}

function update () {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    // s.tilePosition.x += (game.input.speed.x / 2);

    if (wasd.left.isDown) {
        paddle2.x = paddle2.x - paddle2.moveRate;
    }
    else if (wasd.right.isDown) {
        paddle2.x = paddle2.x + paddle2.moveRate;
    }

    if (cursors.left.isDown) {
        paddle1.x = paddle1.x - paddle1.moveRate;
    }
    else if (cursors.right.isDown) {
        paddle1.x = paddle1.x + paddle1.moveRate;
    }

    _.map([paddle1, paddle2], function(paddle) {
        if (paddle.x < 24) {
            paddle.x = 24;
        }
        else if (paddle.x > game.width - 24) {
            paddle.x = game.width - 24;
        }

        if (ballOnPaddle) {
            ball.body.x = paddle.x;
        } else {
            game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
            game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
        }
    });

    game.physics.arcade.collide(paddle1, paddle2, PaddleCollisionHandler, null, this);
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

    lives--;
    livesTextBlue.text = 'lives: ' + lives;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle1.body.x + 16, paddle1.y - 16);

        ball.animations.stop();
    }

}

function gameOver () {

    ball.body.velocity.setTo(0, 0);

    introText.text = 'Game Over!';
    introText.visible = true;

}

function ballHitBrick (_ball, _brick) {
    if (!lastToucher) {
        // Player 2 starts with the ball currently, so hack that in.
        lastToucher = paddle2;
    }

    _brick.kill();

    var lastToucherIsPaddle1 = lastToucher.name === paddle1.name;
    var notLastToucher = lastToucherIsPaddle1 ? paddle2 : paddle1;

    if (Math.floor(Math.random() * 100) > 80) {
        if (lastEnhancement + 10000 >= Date.now()) {
            lastEnhancement = Date.now();
            new Enhancement().trigger(
                lastToucher,
                notLastToucher
            );
        }
    }

    lastToucher.score += 10;

    var scoreStr = 'score: ' + lastToucher.score;
    console.log(scoreStr) // eslint-disable-line no-console
    lastToucherIsPaddle1 ? scoreTextBlue.text = scoreStr : scoreTextRed.text = scoreStr;

    //  Are they any bricks left?
    //  TODO remove this and show who wins
    if (bricks.countLiving() == 0)
    {
        //  New level starts
        score += 1000;
        scoreTextBlue.text = 'score: ' + score;
        introText.text = '- Next Level -';

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle1.x + 16;
        ball.y = paddle1.y - 16;
        ball.animations.stop();

        //  And bring the bricks back from the dead :)
        bricks.callAll('revive');
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
