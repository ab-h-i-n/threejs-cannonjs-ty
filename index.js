const container = document.getElementById('scene-container');

// Movement variables
const moveSpeed = 5;
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xa2c4c9); 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Three.js ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10), 
  new THREE.MeshStandardMaterial({ color: 0x38761d, roughness: 10 })
);
ground.position.y = 0;
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.castShadow = true;
scene.add(ground);

// Cannon.js physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Physics ground
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({
  mass: 0,
  shape: groundShape,
  material: new CANNON.Material({ restitution: 0.3 })
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Three.js cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1), 
  new THREE.MeshStandardMaterial({ color: 0xa64d79, roughness: 0.5, metalness: 0.5 })
);
cube.castShadow = true;
cube.position.y = 0;
scene.add(cube);

// Physics cube
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const cubeBody = new CANNON.Body({
  mass: 5,
  shape: cubeShape,
  position: new CANNON.Vec3(0, 0, 0),
  material: new CANNON.Material({ restitution: 0.3 })
});
world.addBody(cubeBody);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Space':
      cubeBody.velocity.y = 5; // Jump
      break;
    case 'KeyW':
      keys.w = true;
      break;
    case 'KeyA':
      keys.a = true;
      break;
    case 'KeyS':
      keys.s = true;
      break;
    case 'KeyD':
      keys.d = true;
      break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
      keys.w = false;
      break;
    case 'KeyA':
      keys.a = false;
      break;
    case 'KeyS':
      keys.s = false;
      break;
    case 'KeyD':
      keys.d = false;
      break;
  }
});

// Update physics
function updatePhysics() {
  // Handle movement
  const velocity = new CANNON.Vec3();
  
  if (keys.w) velocity.z = -moveSpeed;
  if (keys.s) velocity.z = moveSpeed;
  if (keys.a) velocity.x = -moveSpeed;
  if (keys.d) velocity.x = moveSpeed;
  
  // Apply velocity to the cube
  cubeBody.velocity.x = velocity.x;
  cubeBody.velocity.z = velocity.z;
  
  // Step the physics world
  world.step(1/60);
  
  // Update Three.js cube
  cube.position.copy(cubeBody.position);
  cube.quaternion.copy(cubeBody.quaternion);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updatePhysics();
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});