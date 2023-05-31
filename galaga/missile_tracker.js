class Missile {
  constructor(view, player, players, reportHitCallback, captionCallback) {
    this.view = view;
    this.left = player.isCpu ? player.left + player.image.width / 2 : player.left + 50;
    this.top = player.isCpu ? player.top + player.image.height : player.top;
    this.direction = player.isCpu ? 1 : -1;
    this.has_collided = false;
    this.players = players;
    this.reportHitCallback = reportHitCallback;
    this.caption = captionCallback(player);
  }

  collided(character) {
    return (this.top >= character.top)
      && (this.top <= character.top + character.image.height)
      && (this.left >= character.left)
      && (this.left <= character.left + character.image.width);
  }

  update(timeElapsed) {
    this.top += (this.direction * timeElapsed * MISSILE_SPEED);

    // Reaching board's borders
    if (this.top < 1 || this.top + 16 > this.view.height) {
      return false;
    }

    if (!this.has_collided && this.players.some(player => this.collided(player))) {
      this.has_collided = true;
      this.reportHitCallback(this);
    }

    this.draw();
    return true;
  }

  draw() {
    this.view.ctx.beginPath();
    if (!this.has_collided) {
      this.view.ctx.fillStyle = "red";
      this.view.ctx.arc(this.left, this.top, 15, 0, 2 * Math.PI);
    } else {
      let grd = this.view.ctx.createRadialGradient(this.left, this.top, 20, this.left, this.top, 70);
      grd.addColorStop(0, "red");
      grd.addColorStop(0.8, "orange");
      grd.addColorStop(1, "yellow");
      this.view.ctx.fillStyle = grd;
      this.view.ctx.arc(this.left, this.top, 50, 0, 2 * Math.PI);
    }
    this.view.ctx.fill();
    this.view.ctx.stroke();

    if (this.caption) {
      this.view.ctx.fillStyle = "white";
      this.view.ctx.fillText(this.caption, this.left - 10, this.top + 30);
    }
  }
}

class MissileTracker {
  constructor(view, players, scoreCallback, captionCallback) {
    this.missiles = [];
    this.humanMissiles = 0;

    this.newMissile = player => {
      if (player.isCpu && Math.random() < 0.95) return;
      if (!player.isCpu && this.humanMissiles >= 2) return;

      this.missiles.push(new Missile(
        view, player, players, scoreCallback, captionCallback));

      if (!player.isCpu) this.humanMissiles++;
    }
  }

  update(timeElapsed) {
    // Remove any missiles that go out of scope, and update their count
    this.missiles = this.missiles.filter(missile => {
      let keepMissile = missile.update(timeElapsed);
      if (!keepMissile && missile.direction == -1) {
        this.humanMissiles--;
      }
      return keepMissile;
    });
  }
}