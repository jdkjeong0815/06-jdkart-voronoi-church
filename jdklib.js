
function keyPressed() {
    if (key === 's' || key === 'S') {
      let timestamp = nf(year(), 2) + nf(month(), 2) + nf(day(), 2) + "-" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
      saveCanvas(saveFileName + "-" + timestamp, "jpg");
    }
  }
  
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
  }
  
  function noScroll() {
    document.body.style.overflow = 'hidden';
  }