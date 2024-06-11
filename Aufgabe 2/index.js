import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

var btn, gl, glCanvas, camera, scene, renderer, vaseModel, sphere;
var reticle;

var xrSession = null;
var xrViewerPose;
var hitTestSource = null;
var hitTestSourceRequested = false;

var spheres = []

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
    reticle = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: '#00FF00'}))
    reticle.matrixAutoUpdate = false
    reticle.visible = false
    scene.add(reticle)

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
    renderer = new THREE.WebGLRenderer({canvas: glCanvas, context: gl})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    document.body.appendChild(renderer.domElement)

    //Kugel erstellen
    const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32)

//Texturen laden und zur Kugel hinzufügen
    const textureLoader = new THREE.TextureLoader()

    const brickTexture = textureLoader.load('./textures/brickBaseMap.jpg')
    const brickNormalMap = textureLoader.load('./textures/brickNormalMap.jpg')

    const sphereMaterial = new THREE.MeshPhongMaterial({
        map: brickTexture,
        normalMap: brickNormalMap
    })

    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

    //Lichtquelle erstellen
    const directionalLight = new THREE.DirectionalLight('#d2ab73', 4)
    directionalLight.target = sphere
    scene.add(directionalLight)

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
    var clone = sphere.clone()
    clone.applyMatrix4(reticle.matrix)
    spheres.push(clone)
    scene.add(clone)
}

function onRequestSession () {
    console.log('requesting session')
    //Erstelle einen Request für eine Session
    navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor']
    }).then(onSessionStarted).catch((reason) => {
        console.log('request disabled: ' + reason.log)
    })
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
    if(frame) {
        var referenceSpace = renderer.xr.getReferenceSpace('local')
        var session = frame.session
        xrViewerPose = frame.getViewerPose(referenceSpace)
        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                session.requestHitTestSource({space: referenceSpace}).then((source) => {
                    hitTestSource = source
                })
            })
            session.addEventListener('end', () => {
                hitTestSourceRequested = false
                hitTestSource = null
            })
        }
    } if(hitTestSource) {
        var hitTestResults = frame.getHitTestResults(hitTestSource)
        if (hitTestResults.length > 0) {
            var hit = hitTestResults[0]
            reticle.visible = true
            reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix)
        } else {
            reticle.visible = false
        }
    }

    for (const sphere of spheres) {
        sphere.rotation.x += 0.09
        sphere.rotation.y -= 0.08
        sphere.rotation.z += 0.07

        sphere.position.x += 0.01
        sphere.position.y += 0.02
        sphere.position.z += 0.03
    }

    renderer.render(scene, camera);
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
