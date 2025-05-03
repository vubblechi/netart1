// Enhanced "Noise Becomes Signal" sketch
// Exploring information emerging from noise through particle systems
// Added fractal patterns, moiré effects, glitch visuals, 3D elements, and chaotic sound

// Core variables
let particles = [];      // Array for particle system
let chaosLevel = 0.5;    // How chaotic the system behaves
let informationLevel = 0; // How organized the system is
let quotes = [];         // Array for Serres' concepts
let fractalDepth = 3;    // Depth of fractal recursion
let glitchIntensity = 0; // Level of glitch effect
let showMoire = false;   // Toggle for moiré patterns
let show3D = false;      // Toggle for 3D view
let rotationX = 0;       // 3D rotation X
let rotationY = 0;       // 3D rotation Y
let canvas3D;            // WEBGL canvas for 3D

// Sound variables
let soundEnabled = false;  // Toggle for sound
let oscillators = [];      // Array of sound oscillators
let noiseGen;              // Noise generator
let soundFilter;           // Filter for sound
let soundEnvelope;         // Sound envelope
let lastSoundTime = 0;     // Time tracking for sound events

function setup() {
  createCanvas(windowWidth, windowHeight);
  canvas3D = createGraphics(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Create initial particles
  for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
  }
  
  // Initialize sound system
  initSoundSystem();
  
  // Initialize philosophical concepts from Serres
  quotes = [
    "Information is born out of noise",
    "Thinking means filtering noise",
    "Communication is never perfect",
    "Innovation comes from disorder",
    "Chaos is creative",
    "Fractals bridge order and chaos",
    "Interference patterns reveal hidden structures",
    "Glitches expose the system's architecture",
    "Sound and data are twin manifestations of vibration"
  ];
}

// Initialize the sound system with oscillators and noise
function initSoundSystem() {
  // Create a filter for the noise
  soundFilter = new p5.BandPass();
  soundFilter.res(1);
  
  // Create a noise generator
  noiseGen = new p5.Noise('pink');
  noiseGen.disconnect();
  noiseGen.connect(soundFilter);
  
  // Create envelope for noise bursts
  soundEnvelope = new p5.Env();
  soundEnvelope.setADSR(0.001, 0.1, 0.2, 0.5);
  soundEnvelope.setRange(0.5, 0);
  
  // Create oscillators for tones
  for (let i = 0; i < 5; i++) {
    let osc = new p5.Oscillator();
    osc.setType(['sine', 'triangle', 'sawtooth'][i % 3]);
    osc.freq(midiToFreq(36 + i * 12)); // Base frequencies
    osc.amp(0);
    oscillators.push(osc);
  }
}

function draw() {
  // Set background based on chaos level
  background(220, 30, 10);
  
  // Update chaos level based on mouse position
  chaosLevel = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
  
  // Update information level based on particle system
  if (frameCount % 30 === 0) {
    informationLevel = calculateInformationLevel();
  }
  
  // Update glitch intensity - peaks occasionally
  glitchIntensity = max(0, glitchIntensity - 0.01);
  if (random(100) < 2) {
    glitchIntensity = random(0.3, 0.8);
  }
  
  // Apply glitch effect to canvas
  if (glitchIntensity > 0.1) {
    applyGlitchEffect();
  }
  
  // Draw moiré patterns if enabled
  if (showMoire) {
    drawMoirePatterns();
  }
  
  // Handle 3D visualization
  if (show3D) {
    draw3DSystem();
  }
  
  // Update sound system
  if (soundEnabled) {
    updateSound();
  }
  
  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    
    // Create connections between particles based on proximity
    if (informationLevel > 0.3) {
      for (let j = i + 1; j < particles.length; j++) {
        let d = dist(
          particles[i].pos.x, particles[i].pos.y,
          particles[j].pos.x, particles[j].pos.y
        );
        
        if (d < 80) {
          stroke(210, 70, 90, map(d, 0, 80, 30, 5));
          line(
            particles[i].pos.x, particles[i].pos.y,
            particles[j].pos.x, particles[j].pos.y
          );
        }
      }
    }
    
    // Remove dead particles
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
  
  // Draw fractal structures based on information level
  if (informationLevel > 0.4) {
    push();
    translate(width/2, height/2);
    drawFractalBranch(100, fractalDepth);
    pop();
  }
  
  // Add new particles occasionally
  if (frameCount % 20 === 0 && particles.length < 100) {
    particles.push(new Particle());
  }
  
  // Display interface
  drawInterface();
  
  // Display a quote based on current chaos/information levels
  displayQuote();
  
  // Display the 3D canvas if active
  if (show3D) {
    image(canvas3D, 0, 0);
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x || random(width), y || random(height));
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.acc = createVector(0, 0);
    this.size = random(3, 8);
    this.life = 255;
    this.color = color(random(360), 70, 90);
    this.id = particles.length;
    this.z = random(-100, 100); // Z position for 3D
  }
  
  update() {
    // Apply forces based on chaos level
    if (chaosLevel < 0.3) {
      // More ordered movement - circular pattern
      let angle = frameCount * 0.02 + this.id * 0.1;
      this.acc.x = sin(angle) * 0.1;
      this.acc.y = cos(angle) * 0.1;
    } else if (chaosLevel < 0.7) {
      // Medium chaos - wave patterns
      this.acc.x = sin(frameCount * 0.02 + this.pos.y * 0.01) * 0.1;
      this.acc.y = cos(frameCount * 0.02 + this.pos.x * 0.01) * 0.1;
    } else {
      // High chaos - noise-based movement
      this.acc.x = random(-0.5, 0.5);
      this.acc.y = random(-0.5, 0.5);
    }
    
    // Apply physics
    this.vel.add(this.acc);
    this.vel.limit(2 + chaosLevel * 3); // Speed increases with chaos
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Wrap around edges
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
    
    // Update Z position for 3D effect
    this.z += random(-2, 2) * chaosLevel;
    this.z = constrain(this.z, -200, 200);
    
    // Reduce life
    this.life -= 0.5;
  }
  
  display() {
    // Display particle with color based on its position
    let hue = (this.pos.x + this.pos.y) % 360;
    fill(hue, 70, 90, this.life/255 * 100);
    noStroke();
    
    // Add subtle variation based on information level
    let sizeVariation = sin(frameCount * 0.05 + this.id) * 2 * informationLevel;
    
    ellipse(this.pos.x, this.pos.y, this.size + sizeVariation, this.size + sizeVariation);
  }
}

function calculateInformationLevel() {
  // Calculate how organized the system is based on:
  // 1. Distribution of particles (clustering)
  // 2. Similarity of velocities
  
  // Sample particles for performance
  let sample = min(particles.length, 15);
  let sampledParticles = [];
  
  for (let i = 0; i < sample; i++) {
    sampledParticles.push(particles[floor(random(particles.length))]);
  }
  
  // Calculate average distance between particles
  let totalDist = 0;
  let count = 0;
  
  for (let i = 0; i < sampledParticles.length; i++) {
    for (let j = i + 1; j < sampledParticles.length; j++) {
      let d = dist(
        sampledParticles[i].pos.x, sampledParticles[i].pos.y,
        sampledParticles[j].pos.x, sampledParticles[j].pos.y
      );
      totalDist += d;
      count++;
    }
  }
  
  let avgDist = count > 0 ? totalDist / count : width/2;
  let clusterFactor = constrain(map(avgDist, 0, width/2, 1, 0), 0, 1);
  
  // Calculate similarity of velocities
  let avgVelAngle = 0;
  let velCount = 0;
  
  for (let i = 0; i < sampledParticles.length; i++) {
    for (let j = i + 1; j < sampledParticles.length; j++) {
      let p1 = sampledParticles[i];
      let p2 = sampledParticles[j];
      
      if (p1.vel.mag() > 0 && p2.vel.mag() > 0) {
        let dot = p1.vel.dot(p2.vel) / (p1.vel.mag() * p2.vel.mag());
        avgVelAngle += abs(dot);
        velCount++;
      }
    }
  }
  
  let directionFactor = velCount > 0 ? avgVelAngle / velCount : 0;
  
  // Combine factors
  return clusterFactor * 0.6 + directionFactor * 0.4;
}

function drawInterface() {
  // Display chaos and information levels
  fill(0, 0, 95);
  noStroke();
  textSize(14);
  textAlign(LEFT);
  text("CHAOS: " + nf(chaosLevel, 1, 2), 10, height - 100);
  text("INFORMATION: " + nf(informationLevel, 1, 2), 10, height - 80);
  text("GLITCH: " + nf(glitchIntensity, 1, 2), 10, height - 60);
  
  // Display visual indicators
  // Chaos bar
  noStroke();
  fill(0, 80, 90, 70);
  rect(150, height - 105, map(chaosLevel, 0, 1, 0, 100), 15);
  
  // Information bar
  fill(210, 80, 90, 70);
  rect(150, height - 85, map(informationLevel, 0, 1, 0, 100), 15);
  
  // Glitch bar
  fill(300, 80, 90, 70);
  rect(150, height - 65, map(glitchIntensity, 0, 1, 0, 100), 15);
  
  // Toggle buttons
  drawToggleButton("MOIRÉ", width - 120, height - 90, showMoire);
  drawToggleButton("3D VIEW", width - 120, height - 60, show3D);
  drawToggleButton("SOUND", width - 120, height - 30, soundEnabled);
  
  // Instructions
  textAlign(RIGHT);
  text("Move mouse to adjust chaos level", width - 10, height - 120);
  text("Click to create particles", width - 10, height - 140);
  text("Press 'M' for moiré, '3' for 3D, 'S' for sound", width - 10, height - 160);
}

function drawToggleButton(label, x, y, active) {
  stroke(0, 0, 90);
  if (active) {
    fill(120, 70, 90);
  } else {
    fill(0, 0, 30);
  }
  rect(x, y, 100, 20, 5);
  
  fill(0, 0, 95);
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x + 50, y + 10);
}

function displayQuote() {
  // Select and display a quote based on the current state
  let quoteIndex;
  
  if (chaosLevel > 0.7 && informationLevel < 0.3) {
    quoteIndex = 4; // "Chaos is creative"
  } else if (chaosLevel < 0.3 && informationLevel > 0.5) {
    quoteIndex = 0; // "Information is born out of noise"
  } else if (chaosLevel > 0.5 && informationLevel > 0.5) {
    quoteIndex = 3; // "Innovation comes from disorder"
  } else if (showMoire) {
    quoteIndex = 6; // "Interference patterns reveal hidden structures"
  } else if (glitchIntensity > 0.5) {
    quoteIndex = 7; // "Glitches expose the system's architecture"
  } else if (informationLevel > 0.6) {
    quoteIndex = 5; // "Fractals bridge order and chaos"
  } else {
    quoteIndex = 1; // "Thinking means filtering noise"
  }
  
  // Display selected quote
  textAlign(CENTER);
  textSize(16);
  fill(210, 30, 95);
  text(quotes[quoteIndex], width/2, 30);
}

function mousePressed() {
  // Add particles at mouse position
  for (let i = 0; i < 5; i++) {
    particles.push(new Particle(mouseX, mouseY));
  }
  
  // Check if toggle buttons were clicked
  if (mouseX > width - 120 && mouseX < width - 20) {
    if (mouseY > height - 90 && mouseY < height - 70) {
      showMoire = !showMoire;
    } else if (mouseY > height - 60 && mouseY < height - 40) {
      show3D = !show3D;
    } else if (mouseY > height - 30 && mouseY < height - 10) {
      toggleSound();
    }
  }
  
  // Trigger sound event on click if sound is enabled
  if (soundEnabled) {
    triggerSoundEvent(true);
  }
}

function keyPressed() {
  if (key === 'm' || key === 'M') {
    showMoire = !showMoire;
  } else if (key === '3') {
    show3D = !show3D;
  } else if (key === 'f' || key === 'F') {
    fractalDepth = (fractalDepth % 5) + 1; // Cycle between 1-5
  } else if (key === 'g' || key === 'G') {
    glitchIntensity = random(0.5, 1);
  } else if (key === 's' || key === 'S') {
    toggleSound();
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  
  if (soundEnabled) {
    // Start all oscillators
    for (let osc of oscillators) {
      osc.start();
    }
    noiseGen.start();
    
    // Set initial parameters
    updateSound();
  } else {
    // Stop all sound
    for (let osc of oscillators) {
      osc.amp(0, 0.1);
    }
    noiseGen.amp(0, 0.1);
  }
}

// FRACTAL FUNCTIONS
function drawFractalBranch(len, depth) {
  if (depth <= 0) return;
  
  // Calculate branch properties based on system state
  let branchAngle = map(chaosLevel, 0, 1, PI/8, PI/3);
  let branchRatio = map(informationLevel, 0, 1, 0.5, 0.8);
  
  // Draw the main branch
  stroke(120 + depth * 40, 70, 90, 70);
  strokeWeight(depth);
  line(0, 0, 0, -len);
  
  // Recursive branching
  push();
  translate(0, -len);
  
  // Left branch
  push();
  rotate(-branchAngle * (1 + sin(frameCount * 0.02) * 0.2));
  drawFractalBranch(len * branchRatio, depth - 1);
  pop();
  
  // Right branch
  push();
  rotate(branchAngle * (1 + cos(frameCount * 0.02) * 0.2));
  drawFractalBranch(len * branchRatio, depth - 1);
  pop();
  
  // Optional middle branch
  if (informationLevel > 0.7) {
    push();
    rotate(sin(frameCount * 0.01) * 0.3);
    drawFractalBranch(len * branchRatio * 0.8, depth - 1);
    pop();
  }
  
  pop();
}

// MOIRÉ PATTERN FUNCTIONS
function drawMoirePatterns() {
  push();
  blendMode(MULTIPLY);
  
  // First pattern
  stroke(30, 70, 90, 30);
  strokeWeight(1);
  let spacing = map(informationLevel, 0, 1, 10, 20);
  
  for (let i = 0; i < width + height; i += spacing) {
    line(0, i, i, 0);
  }
  
  // Second pattern with rotation based on chaos
  push();
  translate(width/2, height/2);
  rotate(chaosLevel * PI/8);
  translate(-width/2, -height/2);
  
  stroke(210, 70, 90, 30);
  for (let i = 0; i < width + height; i += spacing) {
    line(0, i, i, 0);
  }
  pop();
  
  pop();
}

// GLITCH EFFECT FUNCTIONS
function applyGlitchEffect() {
  loadPixels();
  
  // Only process some sections of the screen for performance
  let numGlitches = floor(glitchIntensity * 10);
  
  for (let g = 0; g < numGlitches; g++) {
    // Select a random strip to glitch
    let startY = floor(random(height));
    let glitchHeight = floor(random(5, 20));
    let displacement = floor(random(-20, 20) * glitchIntensity);
    
    for (let y = startY; y < startY + glitchHeight && y < height; y++) {
      // Skip some rows
      if (random() > 0.7) continue;
      
      for (let x = 0; x < width; x++) {
        // Calculate source and destination positions
        let srcX = (x + displacement + width) % width;
        let srcPos = (y * width + srcX) * 4;
        let destPos = (y * width + x) * 4;
        
        // Copy pixels with a color shift
        pixels[destPos] = pixels[srcPos] + random(-20, 20) * glitchIntensity;     // R
        pixels[destPos + 1] = pixels[srcPos + 1];                                 // G
        pixels[destPos + 2] = pixels[srcPos + 2] + random(-20, 20) * glitchIntensity; // B
        pixels[destPos + 3] = pixels[srcPos + 3];                                 // A
      }
    }
  }
  
  updatePixels();
}

// 3D VISUALIZATION FUNCTIONS
function draw3DSystem() {
  canvas3D.clear();
  canvas3D.background(220, 30, 10, 0);
  
  // Set up lights
  canvas3D.ambientLight(60, 60, 60);
  canvas3D.pointLight(255, 255, 255, 0, 0, 300);
  
  // Set rotation based on mouse position when in 3D mode
  rotationY = map(mouseX, 0, width, -PI/4, PI/4);
  rotationX = map(mouseY, 0, height, -PI/4, PI/4);
  
  canvas3D.push();
  canvas3D.translate(0, 0, -200);
  canvas3D.rotateX(rotationX);
  canvas3D.rotateY(rotationY);
  
  // Draw particles in 3D
  for (let particle of particles) {
    canvas3D.push();
    canvas3D.translate(
      particle.pos.x - width/2, 
      particle.pos.y - height/2,
      particle.z
    );
    
    // Get color from particle
    let col = particle.color;
    canvas3D.fill(hue(col), saturation(col), brightness(col), particle.life/255 * 100);
    canvas3D.noStroke();
    canvas3D.sphere(particle.size * 0.7);
    
    canvas3D.pop();
  }
  
  // Draw connections between particles in 3D if information level is high
  if (informationLevel > 0.3) {
    canvas3D.stroke(210, 70, 90, 50);
    canvas3D.strokeWeight(1);
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let p1 = particles[i];
        let p2 = particles[j];
        
        // Calculate 3D distance
        let d = dist(
          p1.pos.x, p1.pos.y, p1.z,
          p2.pos.x, p2.pos.y, p2.z
        );
        
        if (d < 120) {
          canvas3D.line(
            p1.pos.x - width/2, p1.pos.y - height/2, p1.z,
            p2.pos.x - width/2, p2.pos.y - height/2, p2.z
          );
        }
      }
    }
  }
  
  canvas3D.pop();
}

// SOUND FUNCTIONS
function updateSound() {
  // Update filter frequency based on chaos level
  let filterFreq = map(chaosLevel, 0, 1, 500, 5000);
  soundFilter.freq(filterFreq);
  
  // Update noise volume based on chaos
  let noiseLevel = map(chaosLevel, 0, 1, 0.1, 0.4);
  noiseGen.amp(noiseLevel);
  
  // Update oscillator parameters based on information level
  for (let i = 0; i < oscillators.length; i++) {
    // Base frequency determined by position in scale
    let baseFreq = midiToFreq(36 + (i * (chaosLevel < 0.5 ? 7 : 5)));
    
    // Add slight detuning for chaos
    let detune = map(chaosLevel, 0, 1, 0, 15);
    let freq = baseFreq * (1 + random(-detune, detune) / 1000);
    
    oscillators[i].freq(freq);
    
    // Oscillator amplitude based on information level and position
    let oscAmp = 0;
    if (informationLevel > 0.2) {
      // With higher information, create more harmonic structure
      oscAmp = map(informationLevel, 0, 1, 0.01, 0.15) * (1 / (i + 1));
    }
    oscillators[i].amp(oscAmp, 0.1);
  }
  
  // Randomly trigger sound events
  if (millis() - lastSoundTime > map(chaosLevel, 0, 1, 2000, 200)) {
    if (random() < chaosLevel) {
      triggerSoundEvent();
    }
    lastSoundTime = millis();
  }
}

function triggerSoundEvent(isClick = false) {
  // Different types of sound events
  let eventType = floor(random(3));
  
  if (isClick) {
    // Click-triggered events are special
    soundEnvelope.setADSR(0.01, 0.1, 0.2, 0.5);
    soundEnvelope.setRange(0.6, 0);
    soundFilter.freq(random(500, 3000));
    soundEnvelope.play(noiseGen);
    return;
  }
  
  switch(eventType) {
    case 0: // Short noise burst
      soundEnvelope.setADSR(0.01, 0.05, 0.1, 0.2);
      soundEnvelope.setRange(map(chaosLevel, 0, 1, 0.2, 0.5), 0);
      soundFilter.freq(random(200, 2000));
      soundFilter.res(random(1, 5));
      soundEnvelope.play(noiseGen);
      break;
      
    case 1: // Pitch bend on random oscillator
      let oscIndex = floor(random(oscillators.length));
      let currentFreq = oscillators[oscIndex].getFreq();
      let targetFreq = currentFreq * random(0.95, 1.05);
      oscillators[oscIndex].freq(targetFreq, random(0.1, 0.3));
      break;
      
    case 2: // Volume pulse on oscillators
      for (let i = 0; i < oscillators.length; i++) {
        if (random() < 0.5) continue;
        let currentAmp = oscillators[i].getAmp();
        oscillators[i].amp(currentAmp * 2, 0.05);
        oscillators[i].amp(currentAmp, 0.2);
      }
      break;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvas3D = createGraphics(windowWidth, windowHeight, WEBGL);
}