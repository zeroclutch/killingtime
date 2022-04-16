import * as THREE from 'three';
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://threejs.org/examples/jsm/loaders/MTLLoader.js'

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
camera.position.z = 1000;

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(-100, 0, 100);

let fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(100, 0, 100);

let backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();

const light = new THREE.AmbientLight( 0x404040 ); // soft white light

scene.add( light );
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

let objLoader = new OBJLoader();
let mtlLoader = new MTLLoader()
// objLoader.setMaterials(materials);
objLoader.setPath('/three-boilerplate/assets/');
mtlLoader.setPath('/three-boilerplate/assets/');

const loadObj = (objPath, mtlPath) => {
    return new Promise((resolve) => {
        mtlLoader.load(mtlPath, function(materials) {
            objLoader.setMaterials(materials);
            objLoader.load(objPath, function (object) {
                scene.add(object);
                resolve(object)
            });
        })
    })
}

// const geometry = new THREE.BoxGeometry( 100, 100, 100 );
// const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
// const cube = new THREE.Mesh( geometry, material );

;(async function() {
    // Load objects
    // let r2d2 = await loadObj('r2-d2.obj');
    let clock1 = await loadObj('clock3/Clock_obj.obj', 'clock3/Clock_obj.mtl');
    clock1.scale.x = 100
    clock1.scale.y = 100
    clock1.scale.z = 100


    
    // Animation loop
    let t = -100
    let animate = function () {
        requestAnimationFrame( animate );
        controls.update();
        renderer.render(scene, camera);
        // r2d2.translateZ(0.1)
        // moveParabolic(r2d2, -0.2, t)
        moveParabolic(clock1, -4, -1, t)
        rotateObject(clock1, 0.1)


        // rotateObject(r2d2, 0.1)
        t += 0.5
        if(t > 100) t = -100;
    };
    animate();
})()

function tossObject(speed) {
    speed 
}

// Move parabolically as a function of time
function moveParabolic(object, ax, ay, t) {
    let x = 2 * ax * t, y = ay * t ** 2 + 500
    object.position.y = y
    object.position.x = x
}

// Rotates Object

function rotateObject(object, rad) {
    // https://threejs.org/docs/#api/en/math/Quaternion
    // const quaternion = new THREE.Quaternion();
    // quaternion.setFromAxisAngle( new THREE.Vector3( 1, 1, 1 ), Math.PI / 100 );
    // object.applyQuaternion( quaternion );
    object.rotation.y += Math.random() * (0.03 - 0.01) + 0.01
    object.rotation.z += Math.random() * (0.03 - 0.01) + 0.01
    object.rotation.x += Math.random() * (0.03 - 0.01) + 0.01

    if (object.rotation.x > 2 * Math.PI) object.rotation.x = 0
    if (object.rotation.y > 2 * Math.PI) object.rotation.y = 0
    if (object.rotation.z > 2 * Math.PI) object.rotation.z = 0


    // object.rotateOnAxis(axis, rad)
    // console.log(rad, object.rotation.x, object.rotation.y, object.rotation.z)
    // object.rotation.x = Date.now()*.00002;
}