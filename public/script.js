// Mycelium Chaos - A response to "What Is It Like to Be A Fungus?" by Merlin Sheldrake
// This code explores the networked, decentralized intelligence of fungi through
// recursive growth patterns, emergent behaviors, and chaotic systems

// Global variables
let mycelium = [];
let playing = false;
let rotationOffset = 0;
let glitchEffect = false;
let moirePatternActive = false;

// Sound variables using only p5.sound built-in generators
let osc1, osc2, noise1;
let env1, env2, noiseEnv;
let soundsReady = false;

// p5 preload function
function preload() {
  // No preloading needed anymore
}

// Setup function
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noiseDetail(4, 0.5);
  noStroke();

  // Set up sound objects
  setupSounds();

  // Create initial mycelium node
  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));

  // Create initial fractal structure
  createFractalStructure(0, 0, 0, 100, 3);
}

// Setup sound objects
function setupSounds() {
  try {
    // Create oscillators for tonal sounds
    osc1 = new p5.Oscillator("sine");
    osc1.amp(0);
    osc1.freq(60);
    osc1.start();

    osc2 = new p5.Oscillator("triangle");
    osc2.amp(0);
    osc2.start();

    // Create noise for textural sounds
    noise1 = new p5.Noise("pink");
    noise1.amp(0);
    noise1.start();

    // Create envelopes for sound shaping
    env1 = new p5.Envelope();
    env1.setADSR(0.01, 0.1, 0.2, 0.5);
    env1.setRange(0.05, 0);

    env2 = new p5.Envelope();
    env2.setADSR(0.01, 0.05, 0, 0.1);
    env2.setRange(0.05, 0);

    noiseEnv = new p5.Envelope();
    noiseEnv.setADSR(0.1, 0.2, 0.1, 0.5);
    noiseEnv.setRange(0.05, 0);

    soundsReady = true;
    console.log("Sound setup successful");
  } catch (error) {
    console.error("Error setting up sounds:", error);
  }
}

// Draw function - runs continuously
function draw() {
  background(0);

  // Apply moiré pattern effect if active
  if (moirePatternActive) {
    drawMoirePattern();
  }

  // Camera rotation
  rotateY(rotationOffset);
  rotateX(rotationOffset * 0.5);
  rotationOffset += 0.003;

  // Set up lighting
  ambientLight(60);
  pointLight(255, 255, 255, 200, -200, 300);

  // Update and display all mycelium nodes
  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();

    // Check if the node should spawn new nodes
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }

  // Update background sound frequency based on mycelium size
  if (playing && soundsReady && frameCount % 30 === 0) {
    let freq = map(mycelium.length, 10, 500, 50, 100);
    osc1.freq(freq);
  }

  // Random sound events
  if (playing && soundsReady && random() < 0.003) {
    playRandomSound();
  }

  // Apply random glitch effects
  if (glitchEffect && random() < 0.05) {
    applyGlitchEffect();
  }
}

// Play a node spawn sound
function playSpawnSound(frequency) {
  if (!soundsReady || !playing) return;

  try {
    osc2.freq(frequency);
    env2.play(osc2);
  } catch (error) {
    console.error("Error playing spawn sound:", error);
  }
}

// Play random ambient sound
function playRandomSound() {
  if (!soundsReady || !playing) return;

  try {
    let freq = random([200, 300, 400, 500, 600]);
    osc2.freq(freq);
    env2.play(osc2);
  } catch (error) {
    console.error("Error playing random sound:", error);
  }
}

// Handle mouse press event
function mousePressed() {
  // Toggle playing state
  playing = !playing;

  if (soundsReady) {
    if (playing) {
      // Start background sounds
      noise1.amp(0.03, 0.5);
      env1.play(osc1);

      // Play an initialization sound
      osc2.freq(300);
      env2.play(osc2);
    } else {
      // Fade out sounds
      noise1.amp(0, 0.5);
      osc1.amp(0, 0.5);
    }
  }

  return false; // Prevent default
}

// Handle key press event
function keyPressed() {
  // Toggle glitch effect with G key
  if (key === "g" || key === "G") {
    glitchEffect = !glitchEffect;
    console.log("Glitch effect:", glitchEffect ? "ON" : "OFF");

    // Play glitch sound
    if (soundsReady && playing) {
      noiseEnv.play(noise1);
    }
  }

  // Toggle moiré pattern with M key
  if (key === "m" || key === "M") {
    moirePatternActive = !moirePatternActive;
    console.log("Moiré pattern:", moirePatternActive ? "ON" : "OFF");

    // Play mode change sound
    if (soundsReady && playing) {
      osc2.freq(440);
      env2.play(osc2);
    }
  }

  return false; // Prevent default
}

// Handle window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Draw moiré pattern effect
function drawMoirePattern() {
  push();
  noLights();
  strokeWeight(0.5);
  stroke(255, 40);

  // Two overlapping patterns creating moiré effect
  let spacing1 = 10 + sin(frameCount * 0.01) * 2;
  let spacing2 = 10 + cos(frameCount * 0.01) * 2;
  let angle1 = frameCount * 0.001;
  let angle2 = frameCount * 0.002;

  // Reset camera transform for screen coordinates
  camera();

  // Draw first grid
  push();
  translate(width / 2, height / 2);
  rotate(angle1);
  for (let x = -width; x < width; x += spacing1) {
    line(x, -height, x, height);
  }
  pop();

  // Draw second grid
  push();
  translate(width / 2, height / 2);
  rotate(angle2);
  for (let x = -width; x < width; x += spacing2) {
    line(x, -height, x, height);
  }
  pop();

  pop();
}

// Apply glitch effect
function applyGlitchEffect() {
  push();

  // Visual glitch - temporary displacement
  translate(random(-10, 10), random(-10, 10));

  // Apply visual noise/static
  stroke(255, 50);
  strokeWeight(1);
  for (let i = 0; i < 20; i++) {
    let x1 = random(-width / 2, width / 2);
    let y1 = random(-height / 2, height / 2);
    let x2 = x1 + random(-50, 50);
    let y2 = y1 + random(-50, 50);
    line(x1, y1, 0, x2, y2, 0);
  }

  // Audio glitch effect
  if (playing && soundsReady && random() < 0.3) {
    try {
      noiseEnv.play(noise1);
    } catch (error) {
      console.error("Error playing glitch sound:", error);
    }
  }

  pop();
}

// Create a fractal structure recursively
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

    // Recursive call to create sub-branch (this demonstrates recursion)
    createFractalStructure(newX, newY, newZ, size * 0.7, depth - 1);
  }
}

// MyceliumNode class - represents a fungal node in the network
class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.pos = createVector(x, y, z);
    this.r = r;
    this.depth = depth;
    this.angle = p5.Vector.random3D();
    this.life = 0;
    this.maxLife = random(200, 500);
    this.connections = [];

    // Color with noise-based variation
    this.col = color(
      100 + noise(x * 0.01, y * 0.01) * 155,
      100 + sin(depth) * 155,
      255,
      200
    );
  }

  update() {
    // Age the node
    this.life++;

    // Move based on growth direction
    this.pos.add(p5.Vector.mult(this.angle, 0.5));

    // Slightly adjust angle randomly over time for organic movement
    if (frameCount % 10 === 0) {
      this.angle.rotate(random(-0.1, 0.1));
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    // Apply material
    ambientMaterial(this.col);

    // Size fluctuation based on noise for organic feel
    let sizeFluctuation = noise(this.life * 0.01) * 5;
    sphere(this.r * 0.1 + sizeFluctuation, 6, 4);

    pop();

    // Draw connections to other nodes
    this.drawConnections();
  }

  shouldSpawn() {
    // Spawn new nodes based on conditions
    return (
      this.r > 10 &&
      this.life > 30 &&
      this.life < this.maxLife * 0.7 &&
      random() < 0.01
    );
  }

  spawn() {
    // Create between 1-3 new branches
    let branches = int(random(1, 3));

    for (let i = 0; i < branches; i++) {
      // Create a new node
      let child = new MyceliumNode(
        this.pos.x,
        this.pos.y,
        this.pos.z,
        this.r * 0.7,
        this.depth + 1
      );

      // Randomize direction
      child.angle = p5.Vector.random3D();

      // Add to mycelium array
      mycelium.push(child);

      // Create connection
      this.connections.push(mycelium.length - 1);
    }

    // Play sound for spawning if audio is active
    if (playing && soundsReady && random() < 0.3) {
      // Play different frequencies based on depth
      let freq = map(this.depth, 0, 10, 300, 800);
      playSpawnSound(freq);
    }
  }

  drawConnections() {
    // Draw connections to other nodes
    push();
    stroke(red(this.col), green(this.col), blue(this.col), 100);
    strokeWeight(1);

    for (let i = 0; i < this.connections.length; i++) {
      let connectedIndex = this.connections[i];
      if (connectedIndex < mycelium.length) {
        let otherNode = mycelium[connectedIndex];
        line(
          this.pos.x,
          this.pos.y,
          this.pos.z,
          otherNode.pos.x,
          otherNode.pos.y,
          otherNode.pos.z
        );
      }
    }
    pop();
  }
}
