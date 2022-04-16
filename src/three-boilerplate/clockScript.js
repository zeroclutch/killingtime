import * as THREE from 'three';
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://threejs.org/examples/jsm/loaders/MTLLoader.js'

// Add timer
let frame = 0

// Initialize scene and renderer
let scene = new THREE.Scene();
scene.background = new THREE.Color( 0x444444 )

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
camera.position.z = 200;

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Allow draggable controls
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

const light = new THREE.AmbientLight( 0x404040, 20 ); // soft white light

// Add lighting
scene.add( light );
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

// Configure 3D model loaders
let objLoader = new OBJLoader();
let mtlLoader = new MTLLoader()

objLoader.setPath('/three-boilerplate/assets/');
mtlLoader.setPath('/three-boilerplate/assets/');

// Loads an object into the scene, and resolves to that object
const loadObj = (objPath, mtlPath) => {
    return new Promise((resolve) => {
        if(mtlPath) {
            mtlLoader.load(mtlPath, function(materials) {
                objLoader.setMaterials(materials);
                objLoader.load(objPath, function (object) {
                    resolve(object)
                });
            })
        }

        
        objLoader.load(objPath, function (object) {
            resolve(object)
        });
    })
}

// const geometry = new THREE.BoxGeometry( 100, 100, 100 );
// const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
// const cube = new THREE.Mesh( geometry, material );

// All possible spawnable clocks
const OBJECTS = [
    { obj: 'clock2/watch_benzino_1.obj', mtl: 'clock2/watch_benzino_1.mtl', scaleX: 50, scaleY: 50, scaleZ: 50, },
    { obj: '/clock3/Clock_obj.obj', mtl: '/clock3/Clock_obj.mtl', scaleX: 150, scaleY: 150, scaleZ: 150,},
]

// Current list of clocks
const spawnedObjects = []

// Spawns a new clock
async function createObject(options) {
    // Select random object from possible list
    let data = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]
    // Load object into scene
    let object = await loadObj(data.obj, data.mtl)

    // Scale object
    object.scale.x = data.scaleX
    object.scale.y = data.scaleY
    object.scale.z = data.scaleZ

    // Add some metadata about the object
    let createdAt = frame
    let killAt = frame + (options.killAfter || -1) 
    return { object, createdAt, killAt }
}

function addObject(object, killAfter) {
    object.killAt = frame + killAfter
    object.createdAt = frame
    scene.add(object.object);
    spawnedObjects.push(object)
}

;(async function() {
    // Load objects
    const OBJECT_COUNT = 5
    const createdObjects = []
    for(let i = 0; i < OBJECT_COUNT; i++) {
        createdObjects.push(await createObject({ killAfter: 100 }))
    }

    addObject(createdObjects[0])

    // Animation loop
    let animate = function () {
        requestAnimationFrame( animate );
        frame++

        controls.update();
        renderer.render(scene, camera);

        console.log(spawnedObjects)
        
        // Spawns an moves
        for(let i in spawnedObjects) {
            let object = spawnedObjects[i]
            if(frame === object.killAt ) {
                scene.remove(object.object)
                spawnedObjects.splice(i, 1)
                i--
                continue
            }
            moveParabolic(object.object, -0.5, -1, (frame - object.createdAt - 100) * 0.5)
            rotateObject(object.object)
        }
    };
    animate();
})()

// Move parabolically as a function of time
function moveParabolic(object, ax, ay, t) {
    let x = 2 * ax * t, y = ay * t ** 2
    object.position.x = x
    object.position.y = y
}

// Rotates Object
function rotateObject(object, rad) {
    object.rotation.y += Math.random() * (0.03 - 0.01) + 0.01
    object.rotation.z += Math.random() * (0.03 - 0.01) + 0.01
    object.rotation.x += Math.random() * (0.03 - 0.01) + 0.01

    if (object.rotation.x > 2 * Math.PI) object.rotation.x = 0
    if (object.rotation.y > 2 * Math.PI) object.rotation.y = 0
    if (object.rotation.z > 2 * Math.PI) object.rotation.z = 0
}