// Global Variables
let globalBgColor;
let circleBasePalette;
let patternPalette;
let circles;
let connectedNodes;

// WINDOW RESIZE
function windowResized() {
  let size = min(windowWidth, windowHeight);
  resizeCanvas(size, size);
  createFixedLayout();
}

// LAYOUT & BACKGROUND & NETWORK 
function createFixedLayout() {
  circles = [];
  connectedNodes = [];

  let r = width / 8;

  // Add Lines
  addCirclesOnLine(5, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r); 
  addCirclesOnLine(5, width / 2, height / 10, width / 4.8, height / 4.8, r);      
  addCirclesOnLine(5, width * 0.8, 0, width / 4.8, height / 4.8, r);               
  addCirclesOnLine(5, width / 20, height / 2.2, width / 4.8, height / 4.8, r);     
  addCirclesOnLine(5, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
}

function addCirclesOnLine(count, startX, startY, stepX, stepY, r) {
  for (let i = 0; i < count; i++) {
    let x = startX + stepX * i;
    let y = startY + stepY * i;
    let c = new Circle(x, y, r);
    circles.push(c);
    if (random(1) < 0.7) connectedNodes.push(c);
  }
}

function drawNetworkLines() {
  push();
  stroke(color(240, 230, 200, 180));
  strokeWeight(10);
  strokeCap(ROUND);

  for (let i = 0; i < connectedNodes.length; i++) {
    for (let j = i + 1; j < connectedNodes.length; j++) {
      let c1 = connectedNodes[i];
      let c2 = connectedNodes[j];
      let d = dist(c1.x, c1.y, c2.x, c2.y);
      if (d < width / 2.8) line(c1.x, c1.y, c2.x, c2.y);
    }
  }
  pop();
}

// BACKGROUND TEXTURE (STAR DUST)
function drawBackgroundDots() {
  push();
  noStroke();
  let density = 0.004;
  let numDots = floor(width * height * density);

  for (let i = 0; i < numDots; i++) {
    fill(255, random(100, 200));
    ellipse(random(width), random(height), random(width * 0.002, width * 0.005));
  }
  pop();
}

// CIRCLE CLASS
class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;

    // Animation timing
    this.startTime = millis();
    this.innerDuration = 800;
    this.middleDuration = 1200;
    this.outerDuration = 1500;

    // stable colors for each circle
    this.innerBaseColor = random(circleBasePalette);
    this.innerColor = random(patternPalette);
    this.middleColor = random(patternPalette);
    this.outerColor = random(patternPalette);
  }

  getElapsed() {
    return millis() - this.startTime;
  }

  // MAIN DISPLAY

  display() {
    push();
    translate(this.x, this.y);

    
    this.drawHandDrawnCircle(this.r * 1.05, globalBgColor, null, 0);

    let t = this.getElapsed();

    // PHASE 1 — inner grows
    if (t < this.innerDuration) {
      this.displayInnerAnimated(constrain(t / this.innerDuration, 0, 1));
      pop();
      return;
    }

    // PHASE 2 — middle grows
    if (t < this.innerDuration + this.middleDuration) {
      this.displayInnerAnimated(1);
      this.displayMiddleAnimated(
        constrain((t - this.innerDuration) / this.middleDuration, 0, 1)
      );
      pop();
      return;
    }

    // PHASE 3 — outer grows
    this.displayInnerAnimated(1);
    this.displayMiddleAnimated(1);
    this.displayOuterAnimated(
      constrain(
        (t - (this.innerDuration + this.middleDuration)) / this.outerDuration,
        0,
        1
      )
    );

    pop();
  }

  // HAND-DRAWN SHAPE HELPERS
  drawIrregularBlob(rOffset, angle, size, col) {
    fill(col);
    noStroke();

    let x = cos(angle) * rOffset;
    let y = sin(angle) * rOffset;

    push();
    translate(x, y);
    beginShape();
    for (let i = 0; i < 8; i++) {
      let a = (TWO_PI / 8) * i;
      let rr = size * 0.5 * random(0.85, 1.15);
      curveVertex(cos(a) * rr, sin(a) * rr);
    }
    endShape(CLOSE);
    pop();
  }

  drawHandDrawnCircle(r, fillCol, strokeCol, strokeW) {
    if (fillCol) fill(fillCol);
    else noFill();
    if (strokeCol) stroke(strokeCol);
    else noStroke();
    if (strokeW) strokeWeight(strokeW);

    beginShape();
    for (let i = 0; i <= 50; i++) {
      let angle = (TWO_PI / 50) * i;
      let jitter = random(-r * 0.01, r * 0.01);
      curveVertex(cos(angle) * (r + jitter), sin(angle) * (r + jitter));
    }
    endShape(CLOSE);
  }

  // INNER PATTERN 
  displayInnerAnimated(p) {
    // inner base circle
    this.drawHandDrawnCircle(this.r * 0.25 * p, this.innerBaseColor, null, 0);

    noFill();
    stroke(this.innerColor);
    strokeWeight(this.r * 0.015);

    beginShape();
    let total = floor(50 * p);
    for (let i = 0; i < total; i++) {
      let rr = map(i, 0, 50, 0, this.r * 0.2 * p);
      let angle = i * 0.4;
      curveVertex(cos(angle) * rr, sin(angle) * rr);
    }
    endShape();
  }

 
  // MIDDLE PATTERN
  displayMiddleAnimated(p) {
    noFill();
    stroke(this.middleColor);

    let numRings = 5;
    for (let j = 0; j < numRings; j++) {
      let r = map(j, 0, numRings - 1, this.r * 0.3, this.r * 0.55 * p);
      strokeWeight(this.r * 0.01 * random(0.8, 1.2));

      beginShape();
      for (let i = 0; i <= 25; i++) {
        let angle = (TWO_PI / 25) * i;
        let jitter = random(-this.r * 0.02, this.r * 0.02);
        curveVertex(cos(angle) * (r + jitter), sin(angle) * (r + jitter));
      }
      endShape(CLOSE);
    }
  }

  // OUTER PATTERN
  displayOuterAnimated(p) {
    let dotSize = this.r * 0.07;
    let startR = this.r * 0.65;
    let endR = this.r * 0.95 * p;

    for (let radius = startR; radius < endR; radius += dotSize * 0.8) {
      let count = floor((TWO_PI * radius) / (dotSize * 1.4));
      for (let i = 0; i < count; i++) {
        let angle = (TWO_PI / count) * i;
        this.drawIrregularBlob(radius, angle, dotSize, this.outerColor);
      }
    }
  }
}

// SETUP / DRAW
function setup() {
  let size = min(windowWidth, windowHeight);
  createCanvas(size, size);
  pixelDensity(2);

  globalBgColor = color(30, 20, 15);

  circleBasePalette = [
    color(90, 40, 20),
    color(60, 30, 15),
    color(40, 45, 35),
    color(110, 60, 30),
    color(20, 20, 20)
  ];

  patternPalette = [
    color(255),
    color(255, 240, 200),
    color(255, 215, 0),
    color(255, 140, 80),
    color(200, 200, 210)
  ];

  createFixedLayout();
}

function draw() {
  background(globalBgColor);
  drawBackgroundDots();
  drawNetworkLines();
  for (let c of circles) c.display();
}
