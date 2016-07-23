var Enhancement = function () {
    var rand = Math.floor(Math.random() * _enhancements.length);

    this.name = _enhancements[rand];

};

Enhancement.prototype.trigger = function (paddle1, paddle2) {
    switch (this.name) {
        case 'elongate':
            // do stuff
            break;
        case 'slow-other':
            paddle2.moveRate -= 1;
            break;
        case 'speed-up':
            paddle1.moveRate += 1;
            break;
        default:
            // do nothing;
    }
};


var _enhancements = [
    'elongate',
    'slow-other',
    'speed-up'
];
