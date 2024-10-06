import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import mercuryTexture from '/images/mercury.jpg';
import mercuryBump from '/images/mercurybump.jpg';
import venusTexture from '/images/venusmap.jpg';
import venusBump from '/images/venusmap.jpg';
import venusAtmosphere from '/images/venus_atmosphere.jpg';
import earthTexture from '/images/earth_daymap.jpg';
import earthNightTexture from '/images/earth_nightmap.jpg';
import earthAtmosphere from '/images/earth_atmosphere.jpg';
import earthMoonTexture from '/images/moonmap.jpg';
import earthMoonBump from '/images/moonbump.jpg';
import marsTexture from '/images/marsmap.jpg';
import marsBump from '/images/marsbump.jpg';
import jupiterTexture from '/images/jupiter.jpg';
import ioTexture from '/images/jupiterIo.jpg';
import europaTexture from '/images/jupiterEuropa.jpg';
import ganymedeTexture from '/images/jupiterGanymede.jpg';
import callistoTexture from '/images/jupiterCallisto.jpg';
import saturnTexture from '/images/saturnmap.jpg';
import satRingTexture from '/images/saturn_ring.png';
import uranusTexture from '/images/uranus.jpg';
import uraRingTexture from '/images/uranus_ring.png';
import neptuneTexture from '/images/neptune.jpg';
import plutoTexture from '/images/plutomap.jpg';
import { createPlanet, showPlanetInfo } from './funcions/planets';
import { loadAsteroids } from './funcions/asteroids';

// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();

// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6);
scene.add(lightAmbient);

// ******  Star background  ******
scene.background = cubeTextureLoader.load([

  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ******  CONTROLS  ******
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container');
customContainer.appendChild(gui.domElement);

// ****** SETTINGS FOR INTERACTIVE CONTROLS  ******
const settings = {
  accelerationOrbit: 1,
  acceleration: 1,
  sunIntensity: 1.9
};

gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {
});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {
});
gui.add(settings, 'sunIntensity', 1, 10).onChange(value => {
  sunMat.emissiveIntensity = value;
});

// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;

function onDocumentMouseDown(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();

      settings.accelerationOrbit = 0; // Stop orbital movement

      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet

      targetCameraPosition.copy(planetPosition).add(camera.position.clone().sub(planetPosition).normalize().multiplyScalar(offset));
      isMovingTowardsPlanet = true;
    }
  }
}

function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
  if (clickedObject.material === mercury.planet.material) {
    offset = 10;
    return mercury;
  } else if (clickedObject.material === venus.Atmosphere.material) {
    offset = 25;
    return venus;
  } else if (clickedObject.material === earth.Atmosphere.material) {
    offset = 25;
    return earth;
  } else if (clickedObject.material === mars.planet.material) {
    offset = 15;
    return mars;
  } else if (clickedObject.material === jupiter.planet.material) {
    offset = 50;
    return jupiter;
  } else if (clickedObject.material === saturn.planet.material) {
    offset = 50;
    return saturn;
  } else if (clickedObject.material === uranus.planet.material) {
    offset = 25;
    return uranus;
  } else if (clickedObject.material === neptune.planet.material) {
    offset = 20;
    return neptune;
  } else if (clickedObject.material === pluto.planet.material) {
    offset = 10;
    return pluto;
  }

  return null;
}


let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(-175, 115, 5);
// close 'x' button function
function closeInfo() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
}
window.closeInfo = closeInfo;
// close info when clicking another planet
function closeInfoNoZoomOut() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  settings.accelerationOrbit = 1;
}
// ******  SUN  ******
let sunMat;

const sunSize = 697 / 40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xFFF88F,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity
});
const sun = new THREE.Mesh(sunGeom, sunMat);
let foco = 1*(0.0167 + Math.cos(0));
sun.position.x = foco*90;
//sun.position.x = 40;
//scene.add(sun);

//point light in the sun
const pointLight = new THREE.PointLight(0xFDFFD3, 12000, 4000, 1.4);
pointLight.position.x = foco*90;
pointLight.position.y = 150;
scene.add(pointLight);


// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();

  loader.load(path, function (gltf) {
    const obj = gltf.scene;
    obj.position.set(position, 0, 0);
    obj.scale.set(scale, scale, scale);
    scene.add(obj);
    if (callback) {
      callback(obj);
    }
  }, undefined, function (error) {
    console.error('An error happened', error);
  });
}

// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    uniform vec3 sunPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});


// ******  MOONS  ******
// Earth
const earthMoon = [{
  size: 1.6,
  texture: earthMoonTexture,
  bump: earthMoonBump,
  orbitSpeed: 0.001 * settings.accelerationOrbit,
  orbitRadius: 10
}]

// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    scale: 0.1,
    orbitRadius: 5,
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100,
    mesh: null
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];

// Jupiter
const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];

// ******  PLANET CREATIONS  ******
const mercury = new createPlanet('Mercury', 2.4, 40, 0, mercuryTexture, mercuryBump);
scene.add(mercury.planet3d);
scene.add(mercury.planetOrbit3d);
const venus = new createPlanet('Venus', 6.1, 65, 3, venusTexture, venusBump, null, venusAtmosphere);
scene.add(venus.planet3d);
scene.add(venus.planetOrbit3d);
const earth = new createPlanet('Earth', 6.4, 90, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
scene.add(earth.planet3d);
scene.add(earth.planetOrbit3d);
const mars = new createPlanet('Mars', 3.4, 115, 25, marsTexture, marsBump);
scene.add(mars.planet3d);
scene.add(mars.planetOrbit3d);
// Load Mars moons
marsMoons.forEach(moon => {
  loadObject(moon.modelPath, moon.position, moon.scale, function (loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet('Jupiter', 69 / 4, 200, 3, jupiterTexture, null, null, null, jupiterMoons, loadTexture);
scene.add(jupiter.planet3d);
scene.add(jupiter.planetOrbit3d);
const saturn = new createPlanet('Saturn', 58 / 4, 270, 26, saturnTexture, null, {
  innerRadius: 18,
  outerRadius: 29,
  texture: satRingTexture
});
scene.add(saturn.planet3d);
scene.add(saturn.planetOrbit3d);
const uranus = new createPlanet('Uranus', 25 / 4, 320, 82, uranusTexture, null, {
  innerRadius: 6,
  outerRadius: 8,
  texture: uraRingTexture
});
scene.add(uranus.planet3d);
scene.add(uranus.planetOrbit3d);
const neptune = new createPlanet('Neptune', 24 / 4, 340, 28, neptuneTexture);
scene.add(neptune.planet3d);
scene.add(neptune.planetOrbit3d);
const pluto = new createPlanet('Pluto', 1, 350, 57, plutoTexture);
scene.add(pluto.planet3d);
scene.add(pluto.planetOrbit3d);

// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere,
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
];

// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;

//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;

//casting and receiving shadows
earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
});
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;



// Variables para la animación
let time = 0; // El tiempo, para avanzar sobre la órbita
let angle = 0;

function animate() {

  //rotating planets around the sun and itself
  sun.rotateY(0.001 * settings.acceleration);
  mercury.planet.rotateY(0.001 * settings.acceleration);
  //mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
  venus.planet.rotateY(0.0005 * settings.acceleration)
  venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
  venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
  
  earth.planet.rotateY(0.005 * settings.acceleration);
  earth.Atmosphere.rotateY(0.001 * settings.acceleration);
  
  //earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);

  // Incrementamos el tiempo para avanzar en la órbita
  time += 0.001 * settings.accelerationOrbit;

  // Obtener la posición en la órbita usando el tiempo
  const orbitPosition = earth.orbitPath.getPoint(time % 1); // "time % 1" asegura que se reinicie al completar la órbita

  // Aplicar las coordenadas de la elipse a la posición del planeta
  //earth.planet3d.position.set(orbitPosition.y/2, 0, orbitPosition.x/2);
  //earth.planet3d.rotation.z = Math.PI / 2;

  // Renieri
  //let x = (1*(1-(0.0167**2)))/(1+(0.0167*Math.cos(angle)));
  setcoordinatesOrbit(1, 0.0167, earth);
  setcoordinatesOrbit(0.387, 0.2056, mercury);
  setcoordinatesOrbit(0.723, 0.0067, venus);

  setcoordinatesOrbit(1.524, 0.0934, mars);
  setcoordinatesOrbit(5.203, 0.0489, jupiter);
  setcoordinatesOrbit(9.537, 0.0565, saturn);
  setcoordinatesOrbit(19.191, 0.0463, uranus);
  setcoordinatesOrbit(30.069, 0.01, neptune);
  setcoordinatesOrbit(39.482, 0.2488, pluto);


  //earth.planet.position.x = 90 * Math.cos(0.001 * settings.acceleration);
  
  mars.planet.rotateY(0.01 * settings.acceleration);
  mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
  jupiter.planet.rotateY(0.005 * settings.acceleration);
  jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
  saturn.planet.rotateY(0.01 * settings.acceleration);
  saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
  uranus.planet.rotateY(0.005 * settings.acceleration);
  uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
  neptune.planet.rotateY(0.005 * settings.acceleration);
  neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
  pluto.planet.rotateY(0.001 * settings.acceleration)
  pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)

  // Animate Earth's moon
  if (earth.moons) {
    earth.moons.forEach(moon => {
      const time = performance.now();
      const tiltAngle = 5 * Math.PI / 180;

      const moonX = earth.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
      const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
      const moonZ = earth.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);

      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01);
    });
  }
  // Animate Mars' moons
  if (marsMoons) {
    marsMoons.forEach(moon => {
      if (moon.mesh) {
        const time = performance.now();

        const moonX = mars.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
        const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
        const moonZ = mars.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

        moon.mesh.position.set(moonX, moonY, moonZ);
        moon.mesh.rotateY(0.001);
      }
    });
  }

  // Animate Jupiter's moons
  if (jupiter.moons) {
    jupiter.moons.forEach(moon => {
      const time = performance.now();
      const moonX = jupiter.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
      const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
      const moonZ = jupiter.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

      moon.mesh.position.set(moonX, moonY, moonZ);
      moon.mesh.rotateY(0.01);
    });
  }

  // ****** OUTLINES ON PLANETS ******
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections
  var intersects = raycaster.intersectObjects(raycastTargets);

  // Reset all outlines
  outlinePass.selectedObjects = [];

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;

    // If the intersected object is an atmosphere, find the corresponding planet
    if (intersectedObject === earth.Atmosphere) {
      outlinePass.selectedObjects = [earth.planet];
    } else if (intersectedObject === venus.Atmosphere) {
      outlinePass.selectedObjects = [venus.planet];
    } else {
      // For other planets, outline the intersected object itself
      outlinePass.selectedObjects = [intersectedObject];
    }
  }
  // ******  ZOOM IN/OUT  ******
  if (isMovingTowardsPlanet) {
    // Smoothly move the camera towards the target position
    camera.position.lerp(targetCameraPosition, 0.03);

    // Check if the camera is close to the target position
    if (camera.position.distanceTo(targetCameraPosition) < 1) {
      isMovingTowardsPlanet = false;
      showPlanetInfo(selectedPlanet.name);

    }
  } else if (isZoomingOut) {
    camera.position.lerp(zoomOutTargetPosition, 0.05);

    if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
      isZoomingOut = false;
    }
  }

  // Update the controls
  angle += 0.01;
  if(angle > 2 * Math.PI) angle = 0;

  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}

//loadAsteroids('./asteroids/asteroidPack.glb', 1000, 130, 160, scene);
//loadAsteroids('./asteroids/asteroidPack.glb', 3000, 352, 370, scene);
animate();

function setcoordinatesOrbit(a,e, planet){
  let x = a*(Math.cos(angle) - e);
  let y = a*Math.sin(angle)*Math.sqrt(a-(e**2));
  planet.planet3d.position.set(x*30, 0, y*30);
  return {x, y};
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
