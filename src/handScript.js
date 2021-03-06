import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";
const mpHands = window;
const drawingUtils = window;
const controls = window;
const controls3d = window;
const sensitivity = 0.25;
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
    { client: 'Chrome' },
]);
function testSupport(supportedDevices) {
    const deviceDetector = new DeviceDetector();
    const detectedDevice = deviceDetector.parse(navigator.userAgent);
    let isSupported = false;
    for (const device of supportedDevices) {
        if (device.client !== undefined) {
            const re = new RegExp(`^${device.client}$`);
            if (!re.test(detectedDevice.client.name)) {
                continue;
            }
        }
        if (device.os !== undefined) {
            const re = new RegExp(`^${device.os}$`);
            if (!re.test(detectedDevice.os.name)) {
                continue;
            }
        }
        isSupported = true;
        break;
    }
    if (!isSupported) {
        alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
            `is not well supported at this time, continue at your own risk.`);
    }
}
// input frames come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
const config = { locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${mpHands.VERSION}/${file}`;
    } };

const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const grid = new controls3d.LandmarkGrid(landmarkContainer, {
    connectionColor: 0xCCCCCC,
    definedColors: [{ name: 'Left', value: 0xffa500 }, { name: 'Right', value: 0x00ffff }],
    range: 0.2,
    fitToGrid: false,
    labelSuffix: 'm',
    landmarkSize: 2,
    numCellsPerAxis: 4,
    showHidden: false,
    centered: false,
});


let cache = new Array(10)
let cacheMaxElements = 0
let i = 0
let isReady = true

let avgX = 0, avgY = 0
let isTriggered = false
let isGameReady = false

export function getPosition() {
    return [avgX, avgY]
}

export function getTrigger() {
    return isTriggered
}

export function getReady() {
    return isGameReady
}

function onResults(results) {
    isGameReady = true
    // Hide the spinner.
    document.body.classList.add('loaded');
    // Update the frame rate.
    fpsControl.tick();
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks && results.multiHandedness) {
        for (let index = 0; index < results.multiHandLandmarks.length; index++) {
            const classification = results.multiHandedness[index];
            const isRightHand = classification.label === 'Right';
            const landmarks = results.multiHandLandmarks[index];
            drawingUtils.drawConnectors(canvasCtx, landmarks, mpHands.HAND_CONNECTIONS, { color: isRightHand ? '#00FF00' : '#FF0000' });
            drawingUtils.drawLandmarks(canvasCtx, landmarks, {
                color: isRightHand ? '#00FF00' : '#FF0000',
                fillColor: isRightHand ? '#FF0000' : '#00FF00',
                radius: (data) => {
                    return drawingUtils.lerp(data.from.z, -0.15, .1, 10, 1);
                }
            });
        }
    }

    // If a hand is on screen, calculate the cursor
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        cache[i] = normalizeHand(results.multiHandLandmarks[0][8], results.multiHandLandmarks[0][5], sensitivity)

        // Average out the cache values

        for(let j = 0; j < cacheMaxElements; j++) {
            if ( !cache[j]) break
            avgX += cache[j][0]
            avgY += cache[j][1]
        }

        i++

        cacheMaxElements = Math.max(cacheMaxElements, i + 1) // Stores the highest recorded number of elements in cache
        avgX /= cacheMaxElements
        avgY /= cacheMaxElements

        // Reset if we're at the end
        if(i === cache.length - 1) i = 0

        isTriggered = triggered(results.multiHandLandmarks[0][6], results.multiHandLandmarks[0][5], results.multiHandLandmarks[0][4])

        const lm = [{'x': avgX,'y': avgY, 'z': 0}];
        drawingUtils.drawLandmarks(canvasCtx, lm, {
            color: '#00FF00',
            fillColor: isTriggered && isReady ? '#0000FF' : '#FF00FF',//
            radius: isTriggered && isReady ? 50 : 10 // 
        })
        isReady = !isTriggered
    }
    canvasCtx.restore();
    if (results.multiHandWorldLandmarks) {
        // We only get to call updateLandmarks once, so we need to cook the data to
        // fit. The landmarks just merge, but the connections need to be offset.
        const landmarks = results.multiHandWorldLandmarks.reduce((prev, current) => [...prev, ...current], []);
        const colors = [];
        let connections = [];
        for (let loop = 0; loop < results.multiHandWorldLandmarks.length; ++loop) {
            const offset = loop * mpHands.HAND_CONNECTIONS.length;
            const offsetConnections = mpHands.HAND_CONNECTIONS.map((connection) => [connection[0] + offset, connection[1] + offset]);
            connections = connections.concat(offsetConnections);
            const classification = results.multiHandedness[loop];
            colors.push({
                list: offsetConnections.map((unused, i) => i + offset),
                color: classification.label,
            });
        }
        grid.updateLandmarks(landmarks, connections, colors);
    }
    else {
        grid.updateLandmarks([]);
    }
   
}
const hands = new mpHands.Hands(config);
hands.onResults(onResults);

// Find position on screen given hand coordinates
function normalizeHand(p1, p2, d) {
    let x = p1.x - p2.x
    let y = p1.y - p2.y
    let z = p1.z - p2.z
    let yPos = p2.y - y * d / z
    let xPos = p2.x - x * d / z
    return [xPos, yPos]
}

function inRange(a, b, range){
    return (a < b + range && a > b - range)
}

function triggered(f1, f2, t1) {
    let range = (Math.abs(f2.z)**(1/2))/2
    
    let d1 = ((t1.x - f1.x) ** 2 + (t1.y - f1.y) ** 2 + (t1.z- f1.z) ** 2) ** (1/2)
    let d2 = ((t1.x - f2.x) ** 2 + (t1.y - f2.y) ** 2 + (t1.z- f2.z) ** 2) ** (1/2)
    //console.log(d1, d2, range)

    // Return true if distance is close enough to 0
    return inRange(d2, 0, range) || inRange(d1, 0, range)//inRange(t1.y, f2.y, range) && inRange(t1.x, f2.x, range) && inRange(t1.z, f2.z, range/2))
}

// Present a control panel through which the user can manipulate the options and view camera FPS
new controls
    .ControlPanel(controlsElement, {
    selfieMode: true,
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
})
    .add([
    fpsControl,
    new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new controls.SourcePicker({
        onFrame: async (input, size) => {
            const aspect = size.height / size.width;
            let width, height;
            if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
            }
            else {
                width = window.innerWidth;
                height = width * aspect;
            }
            canvasElement.width = width;
            canvasElement.height = height;
            await hands.send({ image: input });
        },
    }),
])
    .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    hands.setOptions(options);
});