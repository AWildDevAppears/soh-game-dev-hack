var Paddle = function (game, asset, anchors) {
    var paddle = game.add.sprite(game.world.centerX, 500, 'breakout', asset);
    paddle.anchor.setTo(anchors.x, anchors.y);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;
    paddle.moveRate = 10;

    return paddle;
}
