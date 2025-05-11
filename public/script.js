// Mycelium Chaos - A response to "What Is It Like to Be A Fungus?" by Merlin Sheldrake
// This code explores the networked, decentralized intelligence of fungi through
// recursive growth patterns, emergent behaviors, and chaotic systems

let mycelium = [];
let playing = false;
let rotationOffset = 0;

// Audio variables
let backgroundSound;
let growthSound;
let interactionSound;
let soundsLoaded = false;

// Preload function to load sounds
window.preload = function () {
  // Load sound files

  try {
    // Load audio files from URLs (can be paths to local files in your project)
    backgroundSound = loadSound(
      "https://freesound.org/data/previews/167/167073_3118803-lq.mp3"
    );
    growthSound = loadSound(
      "https://freesound.org/data/previews/445/445978_6142149-lq.mp3"
    );
    interactionSound = loadSound(
      "https://freesound.org/data/previews/151/151232_2730796-lq.mp3"
    );

    // Set properties
    backgroundSound.setVolume(0.2);
    growthSound.setVolume(0.3);
    interactionSound.setVolume(0.5);

    soundsLoaded = true;
    console.log("Sounds loaded successfully");
  } catch (e) {
    console.error("Error loading sounds:", e);
    soundsLoaded = false;
  }
};

window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noiseDetail(4, 0.5);
  noStroke();

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

window.mousePressed = function () {
  // Toggle sound
  playing = !playing;

  if (soundsLoaded) {
    if (playing) {
      // Start background sound with loop
      if (!backgroundSound.isPlaying()) {
        backgroundSound.loop();
      }
      // Play interaction sound
      interactionSound.play();
    } else {
      // Stop background sound
      if (backgroundSound.isPlaying()) {
        backgroundSound.stop();
      }
    }
  } else {
    console.log("Sounds not loaded yet or failed to load");
  }
};

// MyceliumNode class - represents a fungal node in the network
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

    // Play growth sound when spawning (randomly, not every time)
    if (playing && soundsLoaded && random() < 0.3) {
      // Play growth sound with random rate for variety
      growthSound.rate(random(0.8, 1.2));
      growthSound.play();
    }
  }
}

// to incorporate recursive fractal structures
function createFractalStructure(x, y, z, size, depth) {
  // Base case for recursion
  if (depth <= 0 || size < 5) return;

  // Create a node at this position
  let node = new MyceliumNode(x, y, z, size, 5 - depth);
  mycelium.push(node);

  // Create branches in different directions
  let branchCount = 3; // Number of branches
  for (let i = 0; i < branchCount; i++) {
    // Calculate angle for this branch
    let angle = (TWO_PI / branchCount) * i;

    // Calculate new position
    let newX = x + cos(angle) * size;
    let newY = y + sin(angle) * size;
    let newZ = z + sin(angle * 0.5) * size * 0.5;

    // Recursive call to create sub-branch
    createFractalStructure(newX, newY, newZ, size * 0.7, depth - 1);
  }
}
