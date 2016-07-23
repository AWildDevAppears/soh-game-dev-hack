var Ball = function (game, options, name, asset) {
    var ball = game.add.sprite(options.x, options.y, name, asset);

    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    if (options.animations) {
           ball.animations.add(options.animations.type, options.animations.frames, options.animations.frameRate, options.animations.loop, false);
    }

    return ball;
}
