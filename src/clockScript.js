import * as THREE from 'three';
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js'
import { RGBELoader } from 'https://threejs.org/examples/jsm/loaders/RGBELoader.js'
import { MTLLoader } from 'https://threejs.org/examples/jsm/loaders/MTLLoader.js'
import clockGeometry from '/three-boilerplate/assets/geometry.js'

import { getPosition, getReady, getTrigger } from './handScript.js'
// import { render } from 'express/lib/response';

// Add timer
let frame = 0
let start = Date.now()
const TARGET_FPS = 60
let getTime = () => Math.floor((Date.now() - start) / 1000 * TARGET_FPS)

let score = 0
let time = 100
let dirs = [];  // directions
let parts = []; // particles
// explosion parameters
let movementSpeed = 35;
let totalObjects = 500;
let objectSize = 3;

// Hit sound
let sound = new Audio('/clank.mp3');
sound.load()

// Initialize scene and renderer
let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
camera.position.z = 200;

const gameCanvas = document.getElementById('scene')

let renderer = new THREE.WebGLRenderer( { canvas: gameCanvas, alpha: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x000000, 0 );

let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 0.75);
keyLight.position.set(-100, 0, 100);

let fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.6);
fillLight.position.set(100, 0, 100);

let backLight = new THREE.DirectionalLight(0xFFB35C, 1.0);
backLight.position.set(100, 0, -100).normalize();

const light = new THREE.AmbientLight( 0x424242, 1.75 ); // soft white light

// Add lighting
scene.add( light );
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

// Configure 3D model loaders
let objLoader = new OBJLoader();
let mtlLoader = new MTLLoader();

new RGBELoader()
    .setDataType( THREE.FloatType )
    .setPath( '/three-boilerplate/assets/textures/' )
    .load( 'artist_studio_4k.hdr', function ( texture ) {

    var envMap = pmremGenerator.fromEquirectangular( texture ).texture;

    // scene.background = envMap;
    scene.environment = envMap;

    texture.dispose();
    pmremGenerator.dispose();
})
var pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

objLoader.setPath('/three-boilerplate/assets/');
mtlLoader.setPath('/three-boilerplate/assets/');

// Loads an object into the scene, and resolves to that object
const loadObj = (objPath, mtlPath) => {
    return new Promise((resolve) => {
        if(mtlPath) {
            mtlLoader.load(mtlPath, function(materials) {
                materials.preload();
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
    { obj: 'blueclock/LP_Classic_Wecker.obj', mtl: 'blueclock/LP_Classic_Wecker.mtl', scaleX: 200, scaleY: 200, scaleZ: 200, },
]

const CLOCK_TYPES = [
    { TYPE: 0, POINTS: 0,  odds: 0.25, material: { shininess: 30, color: new THREE.Color("rgb(40, 40, 40)"), } },
    { TYPE: 1, POINTS: 5,  odds: 0.5, material: { shininess: 30, color: new THREE.Color("rgb(244, 84, 84)"), } },
    { TYPE: 2, POINTS: 10, odds: 0.65, material: { shininess: 30, color: new THREE.Color("rgb(168, 123, 175)"), } },
    { TYPE: 3, POINTS: 15, odds: 0.8, material: { shininess: 30, color: new THREE.Color("rgb(49, 193, 115)"), } },
    { TYPE: 4, POINTS: 20, odds: 0.9, material: { shininess: 30, color: new THREE.Color("rgb(37, 167, 185)"), } },
    { TYPE: 5, POINTS: 40, odds: 1, material: { shininess: 50, color: new THREE.Color("rgb(255, 203, 70)"), } },
]


// Current list of clocks
const spawnedObjects = []
const createdObjects = []

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
    let createdAt = getTime()
    let killAt = getTime() + (options.killAfter || -1) 
    return { object, createdAt, killAt }
}

function randomBetween(a, b) {
    return Math.random() * (a - b) + b
}

function addObject(object, killAfter) {
    // Adjust params 
    object.killAt = getTime() + (killAfter || 0)
    object.createdAt = getTime()

    let randomNegative = Math.random() > 0.5 ? -1 : 1

    object.aX = randomBetween(3, 5) * randomNegative
    object.aY = randomBetween(-0.3, -0.5)
    object.speed = randomBetween(0.1, 0.3)
    object.height = Math.round(randomBetween(0, 150))

    object.x = 1000

    // Add object to scene
    scene.add(object.object);
    spawnedObjects.push(object)

    console.log('Spawned', spawnedObjects)
}

// Load objects
async function initializeClocks(clocksPerType) {
    for(let i = 0; i < CLOCK_TYPES.length; i++) {
        for(let j = 0; j < clocksPerType; j++) {
            let clock = await createObject({ killAfter: 100 })

            let type = CLOCK_TYPES[i]

            // Add specific type properties
            clock.type = type.TYPE
            clock.points = type.POINTS
            const mesh = clock.object.children[0]
            if(mesh) {
                let material = mesh.material[1]

                Object.assign(material, type.material)
                material.color = type.material.color
                material.side = THREE.DoubleSide
            } else {
                const material = new THREE.MeshBasicMaterial( { color: type.material.color } );
                material.side = THREE.DoubleSide
                const geometry = new THREE.BufferGeometry();
                
                geometry.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(clockGeometry.position.array), 3))
                geometry.setAttribute('uv', new THREE.BufferAttribute(Float32Array.from(clockGeometry.uv.array), 3))
                geometry.setAttribute('normal', new THREE.BufferAttribute(Float32Array.from(clockGeometry.uv.array), 3))

                const mesh = new THREE.Mesh( geometry, material );
                clock.object.add(mesh)
            }
            createdObjects.push(clock)

            scene.add(clock.object)
            clock.object.position.y = -500
            scene.remove(clock.object)
            
            // console.log(createdObjects, material)
        }
    }
    return true
}

function selectClockType() {
    let seed = Math.random()
    for(let i = 0; i < CLOCK_TYPES.length; i++) {
        let type = CLOCK_TYPES[i]
        console.log(seed, type.odds)
        if(seed < type.odds) return type.TYPE
    }
    return 0
}

function addClock(type, duration=200) {
    // Try to find an available clock to add
    let clock = createdObjects.find(obj => !obj.object.parent && obj.type === type)
    if(!clock) return false
    addObject(clock, duration)
    return true
}

function killClock(i, x, y) {
    const object = spawnedObjects[i].object
    scene.remove(object)

    const explosionForClock = new ExplodeAnimation(x, y, CLOCK_TYPES[spawnedObjects[i].type].material.color)
    parts.push(explosionForClock)
    scene.add(explosionForClock.object)
    spawnedObjects.splice(i, 1)

    console.log('killing clock at', x,y)

    // Play kill sound
    sound.play();

    setTimeout(() => scene.remove(explosionForClock.object), 750)
}

let isTriggered = false
let isReady = true
let timeElapsed = 0

const cursorGeometry = new THREE.SphereGeometry( 5, 32, 16 );
const cursorMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const cursor = new THREE.Mesh( cursorGeometry, cursorMaterial );

;(async function() {
    // Create all possible clocks and cache them
    await initializeClocks(5)
    // Add a clock of type 0 for 200 frames. If there are no clocks available, this returns false
    console.log(addClock(0, 200))

    let FRAME_DELAY = 400

    scene.add( cursor );
    // Animation loop
    let animate = function () {
        requestAnimationFrame( animate );
        if(!getReady() || time < 0) return

        frame++

        let pCount = parts.length;
        while(pCount--) {
            parts[pCount].update();
        }

        // Set cursor position
        [pointer.x, pointer.y] = getPosition()
        isTriggered = getTrigger()
        let actualTrigger = isTriggered // && isReady
        moveCursor(pointer.x, pointer.y, actualTrigger)
        
        // Spawn in a new clock
        if(getTime() % FRAME_DELAY === 0) {
            console.log(FRAME_DELAY)
            const clockType = Math.floor(randomBetween(0, CLOCK_TYPES.length))
            console.log(`Adding clock ${clockType} was successful:`, addClock(selectClockType(), 1000))
            FRAME_DELAY = Math.max(400 - (timeElapsed * 5), 20) // min spawn speed is 20 frames
        }
        
        // Spawns an moves
        for(let i in spawnedObjects) {
            let object = spawnedObjects[i]
            moveParabolic(object.object, object.aX, object.aY, object.height, (getTime() - object.createdAt - 100),  object.speed)
            rotateObject(object.object)

            if(getTime() === object.killAt) { // If missed
                scene.remove(object.object)
                spawnedObjects.splice(i, 1)
                updateTime(-5) // Lose 5 second
                i--
                continue
            } else if (collision(object, pointer.x, pointer.y) && actualTrigger) {
                updateScore(object.points)
                updateTime(4)
                console.log(object.type)
                if(object.type == 0) {
                    time = 0
                }
                killClock(i, object.object.position.x, object.object.position.y)
                i--
            }
        }
        isReady = !isTriggered
        renderer.render(scene, camera);
    };
    animate();
})()

// Move parabolically as a function of time

function moveParabolic(object, ax, ay, height, t, speed) {
    t *= speed
    let x = 2 * ax * t, y = ay * t ** 2 + height
    object.position.x = x
    object.position.y = y
}

// Rotates Object
function rotateObject(object, rad) {
    object.rotation.y +=  (0.03 - 0.01) + 0.01
    object.rotation.z +=  (0.03 - 0.01) + 0.01
    object.rotation.x +=  (0.03 - 0.01) + 0.01

    if (object.rotation.x > 2 * Math.PI) object.rotation.x = 0
    if (object.rotation.y > 2 * Math.PI) object.rotation.y = 0
    if (object.rotation.z > 2 * Math.PI) object.rotation.z = 0
}


// edmund's workspace
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector3();
const client = { x: 0, y: 0 }
// var vec = new THREE.Vector3(); // create once and reuse
// var cursorPos = new THREE.Vector3(); // create once and reuse

// function onPointerMove(event) {

// 	// calculate pointer position in normalized device coordinates
// 	// (-1 to +1) for both components

// 	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
// 	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
// }


function clamp(a, min, max) {
    return Math.min(max, Math.max(a, min))
}


function collision(object, x, y) {
     x = clamp(x, -1, 1)
     y = clamp(y, -1, 1)

	 // pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	 // pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
     // Solve for event.clientX
     let pointer = new THREE.Vector2(x, -y)
	 // update the picking ray with the camera and pointer position
	 raycaster.setFromCamera( pointer, camera );

	 // calculate objects intersecting the picking ray
	 const intersects = raycaster.intersectObjects( scene.children );

	 for ( let i = 0; i < intersects.length; i ++ ) {
         if(intersects[i].object == object.object.children[0]) return intersects[i].object;
	 }

     return false;
}

function moveCursor(x,y, isTriggered) {
    client.x = (pointer.x + 1) / 2 * window.innerWidth
    client.y = -(pointer.y + 1) / 2 * window.innerHeight

    // cursor.style.left = Math.round(clientX) + 'px'
    // cursor.style.top = Math.round(-clientY) + 'px'

    // const ctx = cursorCanvas.getContext('2d')
    // let cursor = ctx.ellipse(clientX, clientY, 10, 10)

    const targetZ = 200

    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse

    vec.set( x, -y );

    var distance = ( targetZ - camera.position.z ) / vec.z;

    vec.unproject( camera );

    vec.sub( camera.position ).normalize();

    var distance = - camera.position.z / vec.z;

    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    cursor.position.x = pos.x
    cursor.position.y = pos.y
    cursor.position.z = pos.z

    if(isTriggered) cursorMaterial.color = new THREE.Color( '#2c8f45' )
    else  cursorMaterial.color = new THREE.Color( '#e32b47' )

}

// window.addEventListener( 'pointermove', onPointerMove );

/* Game functions */

function updateScore(increment) {
    score += increment
    document.getElementsByClassName("score-field")[0].innerHTML = 'Score: ' +  score
}

function updateTime(increment) {
    time += increment
    renderTime(time)
    if(time < 0) {
        timesUp(true)
    }
}

function timesUp(isDone=false) {
    document.getElementById("times-up").style.display = isDone ? "flex" : "hidden"
    document.getElementById('final-score').innerText = score
}
 
function renderTime(seconds) {
    let minutes = (seconds < 60) ? 0 : Math.floor(seconds / 60)
    let remainingSeconds = (seconds - (minutes * 60)) % 60 
    document.getElementById('timer-value').innerHTML = (seconds < 0) ? "EXPIRED" : `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`
}

let decrementTime = setInterval(() => {
    if(time > -1) updateTime(-1)
    timeElapsed += 1
}, 1000)



function ExplodeAnimation(x, y, color)
{
  let geometry = new THREE.BufferGeometry();
  const vertices = new Array();
  for (let i = 0; i < totalObjects; i ++) { 
     vertices.push(x, y, 0)
  
    dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
  }
  const float32Vertices = Float32Array.from(vertices)

  geometry.setAttribute('position', new THREE.BufferAttribute(float32Vertices, 3));
  let material = new THREE.PointsMaterial( { size: objectSize, color });
  let particles = new THREE.Points( geometry, material );
  
  this.object = particles;
  this.status = true;
  
  this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  
  this.update = function(){
    if (this.status == true){
      let pCount = totalObjects;
      let particles =  this.object.geometry.getAttribute('position').array // THREE.BufferAttribute(float32Vertices, 3)
    //   console.log(this.object.geometry.getAttribute('position'))
      for(let i = 0; i < particles.length; i += 3) {
        pCount--
        particles[i] += dirs[pCount].x;
        particles[i + 1] += dirs[pCount].y;
        particles[i + 2] += dirs[pCount].z;
      }
      this.object.geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))
      this.object.geometry.needsUpdate = true;
    }
  }
  
}

function revealOverlay(e) {
    let isHidden =  document.getElementById("loading-overlay").style.display === "none"
    document.getElementById("loading-overlay").style.display = isHidden ? "block" : "none"
}

document.getElementsByClassName("settings-button")[0].addEventListener('click', revealOverlay)