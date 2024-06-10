import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

var btn, gl, glCanvas, camera, scene, renderer, vaseModel;
var reticle;

var xrSession = null;
var xrViewerPose;
var hitTestSource = null;
var hitTestSourceRequested = false;

loadScene()

function loadScene() {
    glCanvas = document.createElement('canvas');
    gl = glCanvas.getContext('webgl2', { antialias: true })

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    )

    scene = new THREE.Scene();

    var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25)
    scene.add(light)

    //Erstelle Reticle

    const loader = new GLTFLoader()

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
        'vase.glb',

        function (gltf) {

            vaseModel = gltf.scene;

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

        },
        // called while loading is progressing
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    )

    //Erstelle den Renderer

    navigator.xr.isSessionSupported('immersive-ar')
        .then((supported) => {
            if (supported) {

                // create button element to advertise XR
                btn = document.getElementById("startAR")
                // add 'click' event listener to button
                btn.addEventListener('click', onRequestSession);
                btn.innerHTML = "Enter XR";
                var header = document.querySelector("header");
                header.appendChild(btn);
            }
            else {
                // create fallback session
                navigator.xr.isSessionSupported('inline')
                    .then((supported) => {
                        if (supported) {
                            console.log('inline session supported');
                        }
                        else {
                            console.log('inline not supported')
                        };
                    })
            }
        })
        .catch((reason) => {
            console.log('WebXR not supported: ' + reason);
        })
}

function onSelect() {
    console.log("on select fired");
    var clone = vaseModel.clone()
    clone.scale.x *= 1.5;
    clone.scale.y *= 1.5;
    clone.scale.z *= 1.5;
    clone.applyMatrix4(reticle.matrix)
    scene.add(clone)
}

function onRequestSession() {
    console.log("requesting session");
    //Erstelle einen Request für eine Session
}

function onSessionStarted(session) {
    console.log('starting session');
    btn.removeEventListener('click', onRequestSession);
    btn.addEventListener('click', endXRSession);
    btn.innerHTML = "STOP AR";
    xrSession = session;
    xrSession.addEventListener('select', onSelect);
    setupWebGLLayer()
        .then(() => {
            renderer.xr.setReferenceSpaceType('local');
            renderer.xr.setSession(xrSession);
            animate();
        })
}

function setupWebGLLayer() {
    return gl.makeXRCompatible().then(() => {
        xrSession.updateRenderState(
            { baseLayer: new XRWebGLLayer(xrSession, gl) });
    });
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render(time, frame) {
    //Erstelle die Render-Funktion
}

function endXRSession() {
    if (xrSession) {
        console.log('ending session...');
        xrSession.end().then(onSessionEnd);
    }
}

function onSessionEnd() {
    xrSession = null;
    console.log('session ended');
    btn.innerHTML = "START AR";
    btn.removeEventListener('click', endXRSession);
    btn.addEventListener('click', onRequestSession);
}