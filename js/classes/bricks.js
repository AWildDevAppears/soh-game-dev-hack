var Brick = function (parent, posx, posy,  name, asset) {
    console.log(name) // eslint-disable-line no-console
    var brick = parent.create(posx, posy, name, asset);
    brick.body.bounce.set(1);
    brick.body.immovable = true;

    return brick;
}
