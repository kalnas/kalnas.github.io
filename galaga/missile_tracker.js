class Missile {
  constructor(view, player, players, reportHitCallback, captionCallback) {
    this.view = view;
    this.radius = 15;
    this.left = player.left + player.image.width / 2;
    this.top = player.isCpu
      ? player.top + player.image.height + this.radius + 1
      : player.top - this.radius  - 1;
    this.speed = player.isCpu ? MISSILE_SPEED : -MISSILE_SPEED;
    this.hasCollided = false;
    this.players = players;
    this.reportHitCallback = reportHitCallback;
    this.caption = captionCallback(player);
    this.collidedPlayer = undefined;
  }

  collided(character) {
    return (this.top + this.radius >= character.top)
      && (this.top - this.radius <= character.top + character.image.height)
      && (this.left + this.radius >= character.left)
      && (this.left - this.radius <= character.left + character.image.width);
  }

  update(timeElapsed) {
    this.top += (timeElapsed * this.speed);

    // Reaching board's borders
    if (this.top <= 0 || this.top + this.radius >= this.view.height) {
      return false;
    }

    if (!this.collidedPlayer) {
      this.collidedPlayer = this.players.find(player => this.collided(player));
      if (this.collidedPlayer) {
        this.reportHitCallback(this.collidedPlayer);
        this.radius *= 3;
      }
    }

    this.draw();
    return true;
  }

  draw() {
    this.view.ctx.beginPath();
    if (this.collidedPlayer) {
      let grd = this.view.ctx.createRadialGradient(
        this.left, this.top, this.radius / 2, // inner circle top/left/radius
        this.left, this.top, this.radius); // outer circle
      grd.addColorStop(0, '#990000');
      grd.addColorStop(1, '#FFA500');
      this.view.ctx.fillStyle = grd;
    } else {
      this.view.ctx.fillStyle = '#FF0000';
    }
    this.view.ctx.arc(this.left, this.top, this.radius, 0, /*Tau*/ 6.28);    
    this.view.ctx.fill();
    this.view.ctx.stroke();

    if (this.caption) {
      this.view.ctx.fillStyle = '#FFFFFF';
      this.view.ctx.fillText(this.caption, this.left - 10, this.top + 30);
    }
  }
}

class MissileTracker {
  constructor(view, players, scoreCallback, captionCallback) {
    this.opponentMissiles = [];
    this.humanMissiles = [];
    this.players = players;
    this.upArrowPressed = false;
    this.human = players.find(player => !player.isCpu);

    this.newMissile = (missilesArray, player) => {
      missilesArray.push(new Missile(
        view, player, this.players, scoreCallback, captionCallback));        
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