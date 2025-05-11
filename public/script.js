import * as Tone from "https://esm.sh/tone";

let mycelium = [];
let synth, noise, autoFilter;
let playing = false;
let rotationOffset = 0;

window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noStroke();
  noiseDetail(4, 0.5);

  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));
};

window.draw = function () {
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
};

window.mousePressed = async function () {
  await Tone.start(); // 사용자 제스처 이후 오디오 컨텍스트 시작

  if (!noise) {
    // 처음 클릭 시 사운드 구성
    synth = new Tone.MembraneSynth().toDestination();
    noise = new Tone.Noise("brown");
    autoFilter = new Tone.AutoFilter("8n").toDestination().start();
    noise.connect(autoFilter);
    noise.volume.value = -40;
  }

  playing = !playing;

  if (playing) {
    noise.start();
    synth.triggerAttackRelease("C2", "8n");
  } else {
    noise.stop();
  }
};

// 균사체 클래스
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
    rotateX(noise(this.life) * PI);
    rotateY(noise(this.life * 0.5) * PI);
    torus(
      this.r * 0.05 + noise(this.life * 0.01) * 4,
      1.5 + noise(this.life) * 2,
      4,
      5
    );
    pop();
  }

  shouldSpawn() {
    return this.r > 10 && this.life > 30 && random() < 0.015;
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

    if (synth && random() < 0.3) {
      synth.triggerAttackRelease(random(["C3", "E3", "G3"]), "16n");
    }
  }
}
