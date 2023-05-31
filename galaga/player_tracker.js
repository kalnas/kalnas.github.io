class Player {
  constructor(view, image, isCpu) {
    this.view = view;
    this.image = image;
    this.left = Math.trunc(Math.random() * this.view.width);
    this.top = isCpu ? 0 : this.view.height - image.height - 30;
    this.direction = isCpu ? (Math.random() > 0.5 ? 1 : -1) : 0;
    this.speed = isCpu ? OPPONENT_SPEED : HUMAN_SPEED;
    this.isCpu = isCpu;
  }

  update(timeElapsed) {
    this.left += (this.direction * this.speed * timeElapsed);
    let reachedBorder = this.left < 0 || this.left + this.image.width > this.view.width;
    // Correct position if reached border
    if (reachedBorder) {
      this.left = this.left < 0 ? 0 : this.view.width - this.image.width;
    }
    // If CPU and reached border, or randomly any other time, switch direction
    if (this.isCpu && (reachedBorder || Math.random() > 0.99)) {
      this.direction *= -1;
    }

    this.view.ctx.drawImage(this.image, this.left, this.top);
  }
}

class PlayerTracker {
  constructor(view, playerImageSrc, opponent1ImageSrc, opponent2ImageSrc) {
    let getPlayer = (imageSource, isCpu) => {
      let img = new Image(100, 100);
      img.src = imageSource;
      return new Player(view, img, isCpu);
    }
    this.players = [ // all players
      (this.human = getPlayer(playerImageSrc, false)),
      getPlayer(opponent1ImageSrc, true),
      getPlayer(opponent2ImageSrc, true)];
    this.opponents = this.players.filter(player => player.isCpu);

    this.directionKeysPressed = new Set();
  }

  update(timeElapsed) {
    // if key pressed is 37, direction is -1; for 39 direction is 1; otherwise direction is 0;
    this.human.direction = (this.directionKeysPressed.values().next().value || 38) - 38;
    this.players.forEach(player => player.update(timeElapsed));
  }
}
