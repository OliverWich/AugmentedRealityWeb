import * as THREE from "three";

const canvas = document.getElementById('canvas');
const gl = new THREE.WebGLRenderer({
    canvas,
    antialias: true
})

gl.setSize(window.innerWidth - 20, window.innerHeight - 20)
//Szene erstellen

const scene = new THREE.Scene()

//Kamera erstellen
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)

scene.background = new THREE.Color(0.01, 0.01, 0.01);

const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);


//Kugel erstellen
const sphereGeometry = new THREE.SphereGeometry(10, 32, 32)

//Texturen laden und zur Kugel hinzufügen
const textureLoader = new THREE.TextureLoader()

const brickTexture = textureLoader.load('./textures/brickBaseMap.jpg')
const brickNormalMap = textureLoader.load('./textures/brickNormalMap.jpg')

const sphereMaterial = new THREE.MeshPhongMaterial({
    map: brickTexture,
    normalMap: brickNormalMap
})

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.position.set(0, 0, -50)
scene.add(sphere)

//Lichtquelle erstellen
const directionalLight = new THREE.DirectionalLight('#d2ab73', 4)
directionalLight.position.set(50, 100, -80)
directionalLight.target = sphere
scene.add(directionalLight)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    gl.setSize(window.innerWidth - 20, window.innerHeight - 20)
    render()
}

let scale = 1

function animate() {
    requestAnimationFrame(animate)
    //Rotation hinzufügen
    sphere.rotation.x += 0.001
    sphere.rotation.y -= 0.005
    sphere.rotation.z += 0.002

    scale *= 1.001
    sphere.scale.set(scale, scale, scale)
    render()
}

animate()

function render() {
    gl.render(scene, camera)
}
