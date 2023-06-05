class World {
  constructor(canvas, getParamsCallback) {
    let ctx = canvas.getContext('2d', { desynchronized: true });
    this.view = {
      ctx: ctx,
      width: canvas.clientWidth,
      height: canvas.clientHeight
    };
    this.initialized = false;
    this.paused = true;
    this.animationFrameId = 0;
    this.lastTimeStamp = undefined;
    this.getParamsCallback = getParamsCallback;

    ctx.font = '20px Courier New';
    ctx.fillStyle = '#000000';
    ctx.fillText('Space Invaders', this.view.width / 2 - 100, this.view.height / 2);
  }

  updateSettings(params) {
    cancelAnimationFrame(this.animationFrameId);
    this.initialized = true;
    this.paused = false;

    this.background = new Background(this.view);
    this.playerTracker = new PlayerTracker(
      this.view, params.humanImgSrc, params.opponent1ImgSrc, params.opponent2ImgSrc);

    let humanScore = 0;
    let opponentScore = 0;
    this.updateScores = () => {
      this.view.ctx.fillStyle = '#FFFFFF';
      this.view.ctx.fillText('Player   : ' + humanScore, 10, this.view.height - 50);
      this.view.ctx.fillText('Opponents: ' + opponentScore, 10, this.view.height - 30);      
    };
  
    let scoreCallback = player => player.isCpu ? humanScore++ : opponentScore++;
    let captionCallback = player => Math.random() > 0.66 && (player.isCpu ? params.captionDown : params.captionUp);
    this.missileTracker = new MissileTracker(
      this.view, this.playerTracker.players, scoreCallback.bind(this), captionCallback.bind(this));
  }

  animate(timeStamp) {
    if (this.paused) return;

    let timeElapsed = Math.trunc(Math.max(timeStamp - this.lastTimeStamp, 0));
    this.lastTimeStamp = timeStamp;

    this.background.update(timeElapsed); // must be called first
    this.playerTracker.update(timeElapsed);
    this.missileTracker.update(timeElapsed);
    this.updateScores();

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  keydown(e) {
    if (!this.initialized && e.which != 78) return;

    switch (e.which) {
      case 37: // left
      case 39: // right
        this.playerTracker.dirKeysPressed.add(e.which);
        break;
      case 38: // up
        this.missileTracker.humanFire();
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
      this.playerTracker.dirKeysPressed.delete(e.which);      
    }
  }
}