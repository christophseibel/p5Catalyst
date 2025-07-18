// generator.js - temporary manual version
export class Generator {
  static name = "p5Catalyst Generator";

  constructor(p5Instance) {
    this.p = p5Instance;

    this.palette = [
      color("#7685F7"),
      color("#BFFB50"),
      color("#000000"),
      color("#FFFFFF"),
    ];

    // Set initial color from palette
    this.col = this.palette[0];
  }

  setup() {
    // You can write normal p5 code here
    colorMode(this.p.HSB);
    noStroke();
  }

  draw(doSVGToo = false) {
    // Manual instance calls for now
    background(255);

    let t = millis() * 0.001;
    let x = width / 2 + sin(t) * 100;
    let y = height / 2 + cos(t * 0.7) * 50;

    fill(this.col);
    circle(x, y, min(width, height) / 10);
  }
}
