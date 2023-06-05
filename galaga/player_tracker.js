class Player {
  constructor(view, image, isCpu) {
    this.view = view;
    this.image = image;
    this.left = Math.trunc(Math.random() * this.view.width);
    this.top = isCpu ? 0 : this.view.height - image.height - 30;
    this.direction = isCpu ? (Math.random() > 0.5 ? 1 : -1) : 0;
    this.speed = isCpu ? OPPONENT_SPEED : HUMAN_SPEED;
    this.isCpu = isCpu;
    this.rightBorder = this.view.width - this.image.width;
  }

  update(timeElapsed) {
    this.left += (this.direction * this.speed * timeElapsed);
    this.left = Math.min(Math.max(this.left, 0), this.rightBorder);
    // If CPU and reached border, or randomly any other time, switch direction
    if (this.isCpu &&
      ((this.left == 0 || this.left == this.rightBorder) ||
        Math.random() > 0.99)) {
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
    };
    this.human = getPlayer(playerImageSrc, false);
    this.opponents = [getPlayer(opponent1ImageSrc, true), getPlayer(opponent2ImageSrc, true)];
    this.players = [this.human, ...this.opponents];
    this.dirKeysPressed = new Set();
  }

  update(timeElapsed) {
    // if key pressed is 37, direction is -1; for 39 direction is 1; otherwise direction is 0;
    this.human.direction = (this.dirKeysPressed.values().next().value || 38) - 38;
    this.players.forEach(player => player.update(timeElapsed));
  }
}
