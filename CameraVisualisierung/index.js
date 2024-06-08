import * as THREE from "../node_modules/three/build/three.module.js";

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

const displacementMap = textureLoader.load('textures/brickDisplacementMap.png');
displacementMap.wrapS = THREE.RepeatWrapping;
displacementMap.wrapT = THREE.RepeatWrapping;
displacementMap.repeat.set(4, 4)


const sphereMaterial = new THREE.MeshStandardMaterial({
    map: sphereColorMap,
    normalMap: sphereNormalMap,
    displacementMap: displacementMap
})

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 0, 0);
scene.add(sphere);


let keysPressed = {}

document.addEventListener('keydown',(event) => {
    keysPressed[event.key] = true;
    if(keysPressed["ArrowUp"]){
        sphere.position.z -= 1
        sphere.rotation.x -= 0.1
    }
    if(keysPressed["ArrowDown"]){
        sphere.position.z += 1
        sphere.rotation.x += 0.1
    }
})

document.addEventListener('keyup', (event) => {
    delete keysPressed[event.key];
 });

//LIGHT

const color = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 30, 30);
scene.add(light);

//AMBIENT LIGHT
const ambientColor = 0xffffff;
const ambientIntensity = 0.2;
const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
scene.add(ambientLight);



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
    //sphere.rotation.x += 0.005;
    render()
}

animate()

function render() {
    gl.render(scene, camera)
}
