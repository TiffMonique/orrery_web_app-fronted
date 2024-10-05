import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const asteroids = [];

export function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius, scene) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        for (let i = 0; i < numberOfAsteroids / 12; i++) { // Divide by 12 because there are 12 asteroids in the pack
          const asteroid = child.clone();
          const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
          const angle = Math.random() * Math.PI * 2;
          const x = orbitRadius * Math.cos(angle);
          const y = 0;
          const z = orbitRadius * Math.sin(angle);
          child.receiveShadow = true;
          asteroid.position.set(x, y, z);
          asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
          scene.add(asteroid);
          asteroids.push(asteroid);
        }
      }
    });
  }, undefined, function (error) {
    console.error('An error happened', error);
  });
}


// Rotate asteroids
asteroids.forEach(asteroid => {
  asteroid.rotation.y += 0.0001;
  asteroid.position.x = asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) + asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
  asteroid.position.z = asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) - asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
});
