import * as THREE from "three";

const canvas = document.getElementById('canvas');
const gl = new THREE.WebGLRenderer({
    canvas,
    antialias: true
})

gl.setSize(window.innerWidth - 20, window.innerHeight - 20)
//setup camera
const angleOfView = 55;
const aspectRatio = canvas.clientWidth / canvas.clientHeight;
const nearPlane = 0.1;
const farPlane = 100;
const camera = new THREE.PerspectiveCamera(
    angleOfView,
    aspectRatio,
    nearPlane,
    farPlane
);
camera.position.set(0, 8, 30);
//making a scene
const scene = new THREE.Scene()

scene.background = new THREE.Color(0.01, 0.01, 0.01);


const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);


//SPHERE

const sphereRadius = 4;
const sphereWidthSegments = 32;
const sphereHeightSegments = 16;
const sphereGeometry = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthSegments,
    sphereHeightSegments
);

const textureLoader = new THREE.TextureLoader();


const sphereColorMap = textureLoader.load('textures/brickBaseMap.jpg');
sphereColorMap.wrapS = THREE.RepeatWrapping;
sphereColorMap.wrapT = THREE.RepeatWrapping;
sphereColorMap.repeat.set(4, 4)

const sphereNormalMap = textureLoader.load('textures/brickNormalMap.jpg');
sphereNormalMap.wrapS = THREE.RepeatWrapping;
sphereNormalMap.wrapT = THREE.RepeatWrapping;
sphereNormalMap.repeat.set(4, 4)

const sphereMaterial = new THREE.MeshStandardMaterial({
    map: sphereColorMap,
    normalMap: sphereNormalMap
})

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0);
scene.add(sphere);

//LIGHT

const color = 0xffecb8;
const intensity = 0.8;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 20, 20);
scene.add(light);



window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    gl.setSize(window.innerWidth - 20, window.innerHeight - 20)
    render()
}

function animate(time) {
    time *= 0.001
    requestAnimationFrame(animate)
    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.005;
    render()
}

animate()

function render() {
    gl.render(scene, camera)
}
