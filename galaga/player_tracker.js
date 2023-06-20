class Player {
  constructor(view, image, isCpu) {
    this.view = view;
    this.image = image;
    this.left = Math.trunc(Math.random() * this.view.width);
    this.top = isCpu ? 0 : this.view.height - image.height - 30;
    this.right = this.left + image.width;
    this.bottom = this.top + image.height;
    this.direction = isCpu ? (Math.random() > 0.5 ? 1 : -1) : 0;
    this.speed = isCpu ? OPPONENT_SPEED : HUMAN_SPEED;
    this.isCpu = isCpu;
    this.rightBorder = this.view.width - this.image.width;
  }

  update(timeElapsed) {
    this.left += (this.direction * this.speed * timeElapsed);
    this.left = Math.min(Math.max(this.left, 0), this.rightBorder);  
    this.right = this.left + this.image.width;  
    if (this.isCpu) {
      // If CPU reached border, or randomly otherwise, switch direction
      if (this.left == 0 || this.left == this.rightBorder || Math.random() > 0.99) {
        this.direction *= -1;
      }
    }

    this.view.ctx.drawImage(this.image, this.left, this.top, this.image.width, this.image.height);
  }
}

class PlayerTracker {
  constructor(view, playerImg, opponent1Img, opponent2Img) {
    let getPlayer = (img, isCpu) => {
      return new Player(view, img, isCpu);
    };
    this.human = getPlayer(playerImg, false);
    this.opponents = [getPlayer(opponent1Img, true), getPlayer(opponent2Img, true)];
    this.players = [this.human, ...this.opponents];
    this.dirKeysPressed = new Set();
  }

  update(timeElapsed) {
    // if key pressed is 37, direction is -1; for 39 direction is 1; otherwise direction is 0;
    this.human.direction = (this.dirKeysPressed.values().next().value || 38) - 38;
    this.players.forEach(player => player.update(timeElapsed));
  }
}
