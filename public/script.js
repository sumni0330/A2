let mycelium = [];
let osc,
  noise,
  playing = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  console.log("✅ setup 시작됨");

  // 균사체 초기화
  mycelium.push(new MyceliumNode(width / 2, height / 2, 10, 0));

  // p5.sound로 대체한 사운드 설정
  osc = new p5.Oscillator("sine");
  osc.freq(120);
  osc.amp(0);
  osc.start();

  noise = new p5.Noise("pink");
  noise.amp(0);
  noise.start();
}

function draw() {
  noFill();
  strokeWeight(1);
  stroke(255, 100);

  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }

  fill(255);
  noStroke();
  textSize(16);
  text("Nodes: " + mycelium.length, 10, 20);
}

function mousePressed() {
  playing = !playing;

  if (playing) {
    osc.amp(0.3, 0.05);
    noise.amp(0.2, 0.1);
    osc.freq(random([130, 200, 260]));
  } else {
    osc.amp(0, 0.3);
    noise.amp(0, 0.3);
  }

  console.log("🎵 sound " + (playing ? "on" : "off"));
}

class MyceliumNode {
  constructor(x, y, r, depth) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.depth = depth;
    this.angle = random(TWO_PI);
    this.life = 0;
  }

  update() {
    this.life++;
    this.x += cos(this.angle) * 0.5;
    this.y += sin(this.angle) * 0.5;
  }

  display() {
    let col = color(200 + this.depth * 10, 100, 255, 70);
    stroke(col);
    ellipse(this.x, this.y, this.r);
  }

  shouldSpawn() {
    return this.r > 1 && this.life > 30 && random() < 0.01;
  }

  spawn() {
    let branches = int(random(1, 3));
    for (let i = 0; i < branches; i++) {
      let offset = random(-PI / 3, PI / 3);
      let child = new MyceliumNode(
        this.x,
        this.y,
        this.r * 0.7,
        this.depth + 1
      );
      child.angle = this.angle + offset;
      mycelium.push(child);
    }

    if (random() < 0.5) {
      osc.freq(random([200, 300, 400]));
    }
  }
}
햣;
