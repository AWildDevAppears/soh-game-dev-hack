var Brick = function (parent, pos, name, asset) {
    var brick = parent.create(pos, name, asset);
    brick.body.bounce.set(1);
    brick.body.immovable = true;

    return brick;
}
