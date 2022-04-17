# [Killing Time](https://www.killingtime.tech/) - LAHacks 2022 submission

[Try our project out](https://www.killingtime.tech/)—it works best on Chrome.

----

## Description

*Killing Time* is a game which uses machine vision and hand tracking to interpolate on-screen cursor position from hand gestures.

## Inspiration

When Peter Parker builds his new suit in *Spider-man: Far From Home*, or when Obi-Wan and Anakin strategize their assault on Geonosis in the *Star Wars* universe, these characters all use technologies that interact seamlessly in 3D space with the motions of their hands. With advancements in technologies in machine vision and hand tracking, these technologies of science fiction are slowly becoming reality. For our project, we use these technologies to create *Killing Time*, a game in which you use your hands as finger-guns to shoot clocks that are thrown at you, earning points in a certain amount of time. Unlike how traditional games like *Valorant's* shooting range require peripherals such as a mouse to click or how Fruit Ninja requires an active touchscreen, Killing Time transforms your computer screen into a 3D touchscreen-like and VR-like experience—anywhere, anytime. It's a whole new way to use a device; just a simple point towards your screen will act as a cursor.


<p style="text-align: center;">
<img src="https://github.com/zeroclutch/killingtime/blob/main/images/Background.png">
<img src="https://raw.githubusercontent.com/zeroclutch/killingtime/main/images/Poster%20(1).png">
<img src="https://raw.githubusercontent.com/zeroclutch/killingtime/main/images/Poster.png">
<img src="https://raw.githubusercontent.com/zeroclutch/killingtime/main/images/clock.png">
</p>

## How to play

* Stand about 1 meter away from your webcam
* Hold your arm at webcam-level and point towards it
* Form an L with your hand, with your index finger pointing forwards and your thumb perpendicular to your index
* To aim, move your fingers in the desired direction
* To shoot, bring your thumb down close to your index
* Destroy as many clocks as possible!

### Rules
* The game ends when time runs out or when you destroy a black clock
* Destroying other clocks earns you points and grants you extra time
* Failing to destroy a clock before it falls takes time away
* Clock values:
    * 🔴 Red: 5 point
    * 🟣 Purple: 10 points
    * 🟢 Green: 15 points
    * 🔵 Blue: 20 points
    * 🟡 Gold: 40 points
    * ⚫️ Black: Game Over

## How we built it

Utilizing technologies including *Three.JS*, *MediaPipe*, and *Tensorflow*, we created a fun, interactive game utilizing faster and faster spawns of clocks for you to destroy.

We used machine vision to identify the markers on the user's hand, and developed our own algorithm to translate that data into a point on a 2D coordinate plane. We performed a series of calculations to determine whether the user has chosen to shoot and where the user is aiming their finger-gun.

In order to convert the direction where your finger points to the in-game 3-D environment, we had to convert the real-life 3-D points of the hand into 2-D points to match the environment; only afterwards, converting them back into 3-D points in the Three.JS scene to determine what clocks you're aiming at.

In modeling our game, we used parametric equations to model the clocks in xyz space, developed their spawn rates, and their individual behaviors. They'll float up and, due to our scene's "gravity", fall down much faster. Incorporating a fun and light user experience inspired us to create and design a cartoon-themed background alongside lo-fi music and fun sound effects.

## Challenges we ran into

* Three of us were learning JavaScript for the first time
* Clocks wouldn't render on MacOS
* Hitboxes dependent on orientation of clock in 3D space
* Algorithm for interpreting cursor/trigger
* Making cursor stable (stability/latency tradeoff)
* WASM is a black box, when something goes wrong its near impossible to debug
* When a hand is directly in front of camera and titled, the model has trouble detecting trigger fingers
* Modern browsers abide by strict autoplay policies that we had to work around

## Accomplishments we're proud of

* Collision detection algorithm is accurate
* Stable and precise finger-to-cursor tracking
* Animated background (cat's tail, clouds, steam, light)
* 3D graphics implementation (clock & particle explosions)
* Overall art theme and game design

## What we learned

* How to mass-produce and manipulate geometric shapes with Three.JS to animate a particle explosion
* How to utilize machine vision to track hand movements down to each finger's joints
* How to use projections and vector math to calculate values from 3-D coordinates

## What's next for Killing Time

* Improve trigger detection
* Improve camera FPS
* Add power-ups/debuffs to more clocks
* Support for multiple hands/multiplayer
* Include a larger variety of clock models

## Built with

* Figma
* MediaPipe
* TensorFlow
* Three.JS
* JavaScript
* SkyPack
* Blender
* Vercel
* Domain.com

## The team

* Pranav Grover
* Patrick Hu
* Tan Huynh
* Christopher Linscott
* Edmund Zhi
