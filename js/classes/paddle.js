var Paddle = function (game, asset, options) {
    var paddle = game.add.sprite(game.world.centerX, 500, 'breakout', asset);
    paddle.anchor.setTo(options.x, options.y);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;
    paddle.moveRate = 10;

    paddle.name = options.name;

    return paddle;
}
