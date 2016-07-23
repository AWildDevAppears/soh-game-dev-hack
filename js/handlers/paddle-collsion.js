function PaddleCollisionHandler (paddle1, paddle2) {
    if (paddle1.x > paddle2.x) {
        paddle1.x += 20;
        paddle2.x -= 20;
    } else {
        paddle1.x -= 20;
        paddle2.x += 20;
    }
}
