import * as THREE from "three";

const canvas = document.getElementById('canvas');
const gl = new THREE.WebGLRenderer({
    canvas,
    antialias: true
})

gl.setSize(window.innerWidth - 20, window.innerHeight - 20)
//Szene erstellen

//Kamera erstellen

//scene.background = new THREE.Color(0.01, 0.01, 0.01);


const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);


//Kugel erstellen

//Texturen laden und zur Kugel hinzufügen

//Lichtquelle erstellen

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    gl.setSize(window.innerWidth - 20, window.innerHeight - 20)
    render()
}

function animate() {
    requestAnimationFrame(animate)
    //Rotation hinzufügen
    render()
}

animate()

function render() {
    gl.render(scene, camera)
}
