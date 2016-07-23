var Brick = function (parent, posx, posy,  name, asset) {
    var brick = parent.create(posx, posy, name, asset);
    brick.body.bounce.set(1);
    brick.body.immovable = true;

    return brick;
}
