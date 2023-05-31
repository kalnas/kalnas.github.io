class View {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }
}

class World {
  constructor(canvas, getParamsCallback) {
    let ctx = canvas.getContext("2d", { desynchronized: true });
    this.view = new View(ctx, canvas.clientWidth, canvas.clientHeight);
    this.view.ctx.font = "20px Courier New";
    this.view.ctx.fillStyle = "black";
    this.view.ctx.fillText("Space Invaders", this.view.width / 2 - 100, this.view.height / 2);
    this.initialized = false;
    this.paused = true;
    this.animationFrameId = 0;
    this.humanScore = 0;
    this.opponentScore = 0;
    this.lastTimeStamp = undefined;
    this.getParamsCallback = getParamsCallback;
  }

  updateSettings(params) {
    cancelAnimationFrame(this.animationFrameId);

    const {humanImgSrc, opponent1ImgSrc, opponent2ImgSrc, captionUp, captionDown} = params;
    this.humanScore = 0;
    this.opponentScore = 0;
    this.background = new Background(this.view);
    this.playerTracker = new PlayerTracker(
      this.view, humanImgSrc, opponent1ImgSrc, opponent2ImgSrc);
    let scoreCallback = missile => missile.direction == 1 ? this.opponentScore++ : this.humanScore++;
    let captionCallback = player => Math.random() > 0.66 && (player.isCpu ? captionDown : captionUp);
    this.missileTracker = new MissileTracker(
      this.view, this.playerTracker.players, scoreCallback.bind(this), captionCallback.bind(this));
    this.initialized = true;
    this.paused = false;
  }

  animate(timeStamp) {
    if (this.paused) return;

    let timeElapsed = Math.trunc(Math.max(timeStamp - this.lastTimeStamp, 0));
    this.lastTimeStamp = timeStamp;

    for (let opponent of this.playerTracker.opponents) {
      this.missileTracker.newMissile(opponent);
    }

    this.background.update(timeElapsed); // must be called first
    this.playerTracker.update(timeElapsed);
    this.missileTracker.update(timeElapsed);

    this.view.ctx.fillStyle = "white";
    this.view.ctx.fillText("Player   : " + this.humanScore, 10, this.view.height - 50);
    this.view.ctx.fillText("Opponents: " + this.opponentScore, 10, this.view.height - 30);

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  keydown(e) {
    if (!this.initialized && e.which != 78) return;

    switch (e.which) {
      case 37: // left
      case 39: // right
        this.playerTracker.directionKeysPressed.add(e.which);
        break;
      case 38: // up
        this.missileTracker.newMissile(this.playerTracker.human);
        break;
      case 78: // [n]ew
      case 32: // space key
        if (e.which == 78 || this.paused) { // new or resume
          if (e.which == 78) {
            this.updateSettings(this.getParamsCallback());
          }
          this.paused = false;
          this.lastTimeStamp = performance.now();
          this.animate(this.lastTimeStamp);
        } else {
          this.paused = true;
        }        
        break;
    }
  }

  keyup(e) {
    if (!this.initialized) return;
    if (e.which == 37 || e.which == 39) {
      this.playerTracker.directionKeysPressed.delete(e.which);      
    }
  }
}