import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene, Camera, Renderer 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Orbit Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Load Skybox 
const skybox = new THREE.CubeTextureLoader()
  // .setPath('assets/skybox/')
  .load([
    'px.jpg', 'nx.jpg',
    'py.jpg', 'ny.jpg',
    'pz.jpg', 'nz.jpg'
  ]);
scene.background = skybox; 

// Lights 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.6, 100);
pointLight.position.set(5, 10, 5);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.5);
spotLight.position.set(-10, 15, 10);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
scene.add(spotLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
scene.add(dirLight);

// Debug Directional Light
const debugLight = new THREE.DirectionalLight(0xffffff, 0.8);
debugLight.position.set(5, 10, -5);
debugLight.castShadow = true;
debugLight.shadow.mapSize.set(2048, 2048);
debugLight.shadow.bias = -0.001;
debugLight.target.position.set(0, 0, 0);
scene.add(debugLight);
scene.add(debugLight.target);

// Ground Plane
const debugGround = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
debugGround.rotation.x = -Math.PI / 2;
debugGround.position.y = -2;
debugGround.receiveShadow = true;
scene.add(debugGround);

// Debug Cube
const debugCube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x00ffcc })
);
debugCube.position.set(-3, 0, 0);
debugCube.castShadow = true;
scene.add(debugCube);

// Textured Rotating Cubes
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.jpg');
const cubeMaterial = new THREE.MeshStandardMaterial({ map: texture });

const cubes = [];
for (let i = 0; i < 5; i++) {
  const cube = new THREE.Mesh(new THREE.BoxGeometry(), cubeMaterial);
  cube.position.set(i * 2 - 4, 0, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);
  cubes.push(cube);
}

// Load .glb Model 
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  'model.glb',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, -3);
    model.scale.set(1, 1, 1);
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Error loading GLB model:', error);
  }
);

// 20+ Extra Shapes 
const shapes = [];
const shapeGeometries = [
  new THREE.BoxGeometry(),
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.ConeGeometry(0.4, 1, 32),
  new THREE.CylinderGeometry(0.3, 0.3, 1, 32),
  new THREE.TorusGeometry(0.4, 0.15, 16, 100)
];
const shapeMaterials = [
  new THREE.MeshStandardMaterial({ color: 0xff6347 }),
  new THREE.MeshStandardMaterial({ color: 0x87ceeb }),
  new THREE.MeshStandardMaterial({ color: 0x8a2be2 }),
  new THREE.MeshStandardMaterial({ color: 0x228b22 }),
  new THREE.MeshStandardMaterial({ color: 0xffff00 })
];
for (let i = 0; i < 20; i++) {
  const geometry = shapeGeometries[i % shapeGeometries.length];
  const material = shapeMaterials[i % shapeMaterials.length].clone();
  const shape = new THREE.Mesh(geometry, material);
  shape.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 20
  );
  shape.castShadow = true;
  shape.receiveShadow = true;
  scene.add(shape);
  shapes.push(shape);
}

// Click to Change Color
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(shapes);
  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    clicked.material.color.set(Math.random() * 0xffffff);
  }
});

// Day/Night Mode 
let isDay = true;

function setDayMode() {
  isDay = true;
  ambientLight.intensity = 0.2;
  dirLight.intensity = 0.8;
  pointLight.intensity = 0.6;
  spotLight.intensity = 0.5;
  debugLight.intensity = 0.8;
  scene.background = skybox;
  document.getElementById('mode-label').textContent = 'Day Mode';
}

function setNightMode() {
  isDay = false;
  ambientLight.intensity = 0.05;
  dirLight.intensity = 0.3;
  pointLight.intensity = 0.3;
  spotLight.intensity = 0.25;
  debugLight.intensity = 0.4;
  scene.background = new THREE.Color(0x0d1b2a); 
  document.getElementById('mode-label').textContent = 'Night Mode';
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'd' || event.key === 'D') {
    setDayMode();
  }
  if (event.key === 'n' || event.key === 'N') {
    setNightMode();
  }
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  cubes.forEach(cube => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  });
  debugCube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
