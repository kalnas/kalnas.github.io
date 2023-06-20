class Background {
  constructor(view) {
    this.gameCtx = view.ctx;
    this.bgCanvas = new OffscreenCanvas(view.width, view.height);
    this.bgCtx = this.bgCanvas.getContext('2d', { willReadFrequently: true });
    this.update(this.bgCanvas.height / SPACE_SPEED + 1); // initialize sky
  }

  update(timeElapsed) {
    let shift = Math.ceil(SPACE_SPEED * timeElapsed);
    let imageData = this.bgCtx.getImageData( // Copy the shifted region
      0, shift, this.bgCanvas.width, this.bgCanvas.height - shift);

    this.bgCtx.fillStyle = '#000000'; // Clear the board
    this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    
    this.bgCtx.putImageData(imageData, 0, 0); // Paste the shifted region

    this.bgCtx.fillStyle = '#FFFFFF'; // Create new stars in the remaining region
    for (let row = this.bgCanvas.height - shift + 1; row <= this.bgCanvas.height; row++) {
      for (let col = 0; col < this.bgCanvas.width; col++) {      
        if (Math.random() > 0.9996) {
          this.bgCtx.fillRect(col, row, 2, 1);
        }
      }
    }

    // Paste the new sky
    this.gameCtx.drawImage(this.bgCanvas, 0, 0, this.bgCanvas.width, this.bgCanvas.height);
  }
}