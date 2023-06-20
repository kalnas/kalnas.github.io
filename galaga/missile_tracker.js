class Missile {
  constructor(img, explodedMissileImg, view, player, players, caption, reportHitCallback) {
    this.img = img;
    this.explodedMissileImg = explodedMissileImg;
    this.view = view;
    this.left = player.left + player.image.width / 2;
    this.top = player.isCpu
      ? player.top + player.image.height + 1
      : player.top - this.img.height - 1;
    this.right = this.left + this.img.width;
    this.bottom = this.top + this.img.height;
    this.speed = player.isCpu ? MISSILE_SPEED : -MISSILE_SPEED;
    this.players = players;
    this.reportHitCallback = reportHitCallback;
    this.caption = caption;
  }

  collided(character) {
    let fudge = 3;
    let no_overlap = this.right < character.left + fudge
      || this.left > character.right - fudge
      || this.top > character.bottom - fudge
      || this.bottom < character.top + fudge;
    return !no_overlap;
  }

  update(timeElapsed) {
    this.top += (timeElapsed * this.speed);
    this.bottom = this.top + this.img.height;

    // Reaching board's borders
    if (this.top <= 0 || this.bottom >= this.view.height) {
      return false;
    }

    if (this.img != this.explodedMissileImg) {
      let collidedPlayer = this.players.find(player => this.collided(player));
      if (collidedPlayer) {
        this.reportHitCallback(collidedPlayer);
        this.img = this.explodedMissileImg;
      }
    }

    this.draw();
    return true;
  }

  draw() {
    this.view.ctx.beginPath();
    this.view.ctx.drawImage(this.img, this.left, this.top);
    if (this.caption) {
      this.view.ctx.fillStyle = '#FFFFFF';
      this.view.ctx.fillText(this.caption, this.left, this.bottom + 25);
    }
  }
}

class MissileTracker {
  constructor(view, players, upMissile, downMissile, explodedMissile, captionUp, captionDown, scoreCallback) {
    this.opponentMissiles = [];
    this.humanMissiles = [];
    this.players = players;
    this.upArrowPressed = false;
    this.human = players.find(player => !player.isCpu);

    this.newMissile = (missilesArray, player) => {
      let caption = Math.random() > 0.66 && (player.isCpu ? captionDown : captionUp);
      let img = player.isCpu ? downMissile : upMissile;
      missilesArray.push(new Missile(
        img, explodedMissile, view, player, this.players, caption, scoreCallback));
    };
  }

  humanFire() {
    if (this.humanMissiles.length < 2) {
      this.newMissile(this.humanMissiles, this.human);
    }
  }

  update(timeElapsed) {
    for (let player of this.players) {
      if (player.isCpu && Math.random() > 0.95) {
        this.newMissile(this.opponentMissiles, player);
      }
    }

    // Remove any missiles that go out of scope
    this.opponentMissiles = this.opponentMissiles.filter(missile => missile.update(timeElapsed));
    this.humanMissiles = this.humanMissiles.filter(missile => missile.update(timeElapsed));
  }
}