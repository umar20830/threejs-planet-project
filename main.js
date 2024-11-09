import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  22,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.z = 10;

const starTexture = new THREE.TextureLoader();
const star = starTexture.load("./stars.jpg");
star.colorSpace = THREE.SRGBColorSpace;

const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({
  map: star,
  opacity: 0.2,
  side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);

scene.add(starSphere);

const radius = 1.3;
const segments = 64;
const radialDistace = 4.5;
// const colors = ["white", "red", "green", "yellow"];
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];

const spheres = new THREE.Group();

const loader = new RGBELoader();
loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

const sphereMeshes = [];

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = radialDistace * Math.cos(angle);
  sphere.position.z = radialDistace * Math.sin(angle);

  if (i === 1) {
    const cloudTexture = textureLoader.load("./earth/clouds.jpg");
    cloudTexture.colorSpace = THREE.SRGBColorSpace;

    const cloudGeometry = new THREE.SphereGeometry(
      radius + 0.07,
      segments,
      segments
    );
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.3,
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);

    cloudSphere.position.x = radialDistace * Math.cos(angle);
    cloudSphere.position.z = radialDistace * Math.sin(angle);
    sphereMeshes.push(cloudSphere);
    spheres.add(cloudSphere);
  }

  sphereMeshes.push(sphere);

  spheres.add(sphere);
}

console.log(sphereMeshes);

spheres.rotation.x = 0.16;
spheres.position.y = -0.5;
scene.add(spheres);

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener("resize", function (e) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastWheelTime = 0;
const throttelDelay = 2000;
let scrollCount = 0;

function throttelWheelHandler(e) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttelDelay) {
    lastWheelTime = currentTime;

    const direction = e.deltaY > 0 ? "down" : "up";
    const headings = document.querySelectorAll(".heading");

    scrollCount = (scrollCount + 1) % 4;

    gsap.to(headings, {
      y: `-=${100}%`,
      direction: 2,
      ease: "linear",
    });

    gsap.to(spheres.rotation, {
      y: `-=${Math.PI / 2}`,
      duration: 1,
      ease: "linear",
    });

    if (scrollCount == 0) {
      gsap.to(headings, {
        y: `0`,
        direction: 2,
        ease: "linear",
      });
    }
  }
}

window.addEventListener("wheel", throttelWheelHandler);

const clock = new THREE.Clock();
function animate() {
  window.requestAnimationFrame(animate);
  for (let i = 0; i < sphereMeshes.length; i++) {
    const sphere = sphereMeshes[i];
    const time = clock.getElapsedTime();
    if (i === 1) {
      sphere.rotation.y = time * 0.06;
    } else {
      sphere.rotation.y = time * 0.03;
    }
  }
  renderer.render(scene, camera);
}

animate();
