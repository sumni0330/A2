let mycelium = [];
let synth, noise;
let playing = false;
let rotationOffset = 0;
let initialized = false;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noiseDetail(4, 0.5);
  noStroke();
  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));
}

function draw() {
  background(0);
  rotateY(rotationOffset);
  rotateX(rotationOffset * 0.5);
  rotationOffset += 0.003;

  ambientLight(60);
  pointLight(255, 255, 255, 200, -200, 300);

  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }
}

function mousePressed() {
  if (!initialized) {
    Tone.start().then(() => {
      console.log("🔊 Tone.js started");

      // 사운드 초기화
      synth = new Tone.MembraneSynth().toDestination();
      noise = new Tone.Noise("brown").toDestination();
      noise.volume.value = -40;

      playSound();
      initialized = true;
    });
  } else {
    playSound();
  }
}

function playSound() {
  playing = !playing;
  if (playing) {
    noise.start();
    synth.triggerAttackRelease("C2", "8n");
  } else {
    noise.stop();
  }
}

class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.pos = createVector(x, y, z);
    this.r = r;
    this.depth = depth;
    this.angle = p5.Vector.random3D();
    this.life = 0;
    this.col = color(
      100 + noise(x * 0.01, y * 0.01) * 155,
      100 + sin(depth) * 155,
      255,
      200
    );
  }

  update() {
    this.life++;
    this.pos.add(p5.Vector.mult(this.angle, 0.5));
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    ambientMaterial(this.col);
    sphere(this.r * 0.1 + noise(this.life * 0.01) * 5, 6, 4);
    pop();
  }

  shouldSpawn() {
    return this.r > 10 && this.life > 30 && random() < 0.01;
  }

  spawn() {
    let branches = int(random(1, 3));
    for (let i = 0; i < branches; i++) {
      let child = new MyceliumNode(
        this.pos.x,
        this.pos.y,
        this.pos.z,
        this.r * 0.7,
        this.depth + 1
      );
      child.angle = p5.Vector.random3D();
      mycelium.push(child);
    }

    if (random() < 0.3 && synth) {
      synth.triggerAttackRelease(random(["C3", "E3", "G3"]), "16n");
    }
  }
}
