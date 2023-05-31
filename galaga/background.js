class Background {
  constructor(view) {
    this.view = view;
    this.stars = Array.from(
      Array(view.height), _ => Array(view.width));
    this.scroll(view.height);
  }

  scroll(numRows) {
    if (numRows == 0) return; // no shift
    // Shift all star rows up, and add new rows at the bottom.
    let shift = this.view.height - numRows;
    for (let row = 0; row < this.view.height; row++) {
      for (let col = 0; col < this.view.width; col++) {
        this.stars[row][col] = row < shift
          ? this.stars[row + numRows][col]
          : Math.random() > 0.9998;
      }
    }
  }

  update(timeElapsed) {
    this.scroll(Math.ceil(SPACE_SPEED * timeElapsed));
    this.view.ctx.fillStyle = "black";
    this.view.ctx.fillRect(0, 0, this.view.width, this.view.height);    
    this.view.ctx.fillStyle = "white";
    for (let row = 0; row < this.view.height; row++) {
      for (let col = 0; col < this.view.width; col++) {      
        if (this.stars[row][col]) {
          this.view.ctx.fillRect(col, row, 2, 1);
        }
      }
    }
  }
}