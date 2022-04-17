# Killing Time - LAHacks 2022 submission

## Welcome to Killing Time!

----

## Inspiration

When Peter Parker builds his new suit in *Spider-man: Far From Home*, or when Obi-Wan and Anakin strategize their assault on Geonosis in the *Star Wars* universe, these characters all use technologies that interact seamlessly in 3D space with the motions of their hands. With advancements in technologies in machine vision and hand tracking, these technologies of science fiction are slowly becoming less and less fiction. For our project, we use these technologies to create *Killing Time*, a game in which you use your hands as finger guns to shoot clocks that are thrown at you, earning points in a certain amount of time. Unlike how games like *Valorant's* shooting range require peripherals like a mouse to click or how *Fruit Ninja* requires an active touchscreen, *Killing Time* transforms your computer screen into a 3D touchscreen-like and VR-like experience. Any point to a screen and it will simply work as a mouse. 

## What it does

*Killing Time* is a game which uses machine vision and hand tracking to 

## How we built it

In the frontend, we used [React.js](https://reactjs.org/), [Bulma.io](https://bulma.io), [SCSS](https://sass-lang.com/), and Webpack to create an installable progressive web app. We initially designed our project in Figma, and used these HTML, CSS, and JS libraries to develop the application for use. We used a library called "React Pro Camera" in order to access the camera for the barcode scanning. We also performed image cropping using HTML5 Canvas in order to improve the accuracy of our backend's barcode image recognition algorithm. Recovery uses a REST API to communicate with the backend.

### Backend

In the backend, we used Python build a Flask REST API with several data endpoints that could be called in the frontend to handle data instructions. Information about a food's nutrients was fetched from the OpenFoodFacts and FoodData Central databases. Using this data, we kept track of nutrient intake and also calculated how many nutrients a person needed based on their sex and weight. Since OpenFoodFacts stored barcodes of items in their API, we decided to implement a barcode scanner feature that would enhance the user experience by allowing them to simply scan their item instead of having to manually search for it. In order to parse the image of the barcode to a barcode number, we utilized pyzbar to decode the barcode into a string format. We added our own modifications to the barcode decoding process using image manipulation in order to improve the accuracy rate of the scanning.

## UI/UX

The UI / UX was focused on ease-of-use and simplicity. The key aspects to accomplishing this were are as follows.

* Having a straightforward user interaction loop
* Large, prominent buttons that directed the user
* Intuitive ways to scan and search for items
* Consistent visual design

To tackle these challenges, we approached the design process by creating a color and typography system.

<p style="text-align: center;">
<img src="https://github.com/zeroclutch/killingtime/blob/main/images/Background.png">
<img src="https://raw.githubusercontent.com/zeroclutch/killingtime/main/images/Poster%20(1).png">
<img src="https://raw.githubusercontent.com/zeroclutch/killingtime/main/images/Poster.png">
<img src="https://raw.githubusercontent.com/zeroclutch/killingtime/main/images/clock.png">
</p>

## What we learned

* How to create progressive web apps (PWAs)
* Front-end and back-end workflow, including using Postman to test our REST API
* Developing in React.js--almost all of our team had 0 experience in React
* Deploying the backend to Google App Engine using Docker
* Barcode scanning implementation with Python

## Challenges we faced

* Clocks wouldn't render on MacOS
* Hitboxes dependent on orientation of clock in 3D space
* Algorithm for interpreting cursor/trigger
* Making cursor stable (stability/latency tradeoff)
* WASM is a black box, when something goes wrong its near impossible to debug
* When hand is directly in front of camera and titled, model has troubled detecting trigger

## Accomplishments we're proud of

* Consistent barcode detection through image cropping & post-processing
* Sexy design (UI, logo)
* Mobile browser compatibility

## What's next for Recovery

* Ability to share nutrition progress on social media
* Allow users to create their own meal plans with custom nutrition quotas
* Addition of more preset meal plans based on other personalized needs (ex: weight loss, muscle gain, diabetics)
* Optimize loading times

## Built with

* Figma
* Python
* Javascript
* Blender

## The team

* Pranav Grover
* Patrick Hu
* Tan Huynh
* Christopher Linscott
* Edmund Zhi
