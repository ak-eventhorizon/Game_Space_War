'use strict';

const stars = {
    radiuses: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    areolas: [2,3,4,5,6,7,8],
    colors: ['#ffffff','#c8c8c8','#fff4fe','#faf0db','#fbf9ff'],
};

let canvas;
let ctx;



//main function for export
function createStarsBackground(elementID, ordinaryStars, gradientStars) {
    canvas = document.getElementById(elementID);
    ctx = canvas.getContext('2d');
    ctx.canvas.width  = canvas.clientWidth; // set canvas width as block width
    ctx.canvas.height = canvas.clientHeight; // set canvas height as block height

    refreshCanvas();
    generateOrdinaryStars(ordinaryStars);
    generateGradientStars(gradientStars);
}



function randomFromZeroTo(number){
    return Math.floor(Math.random() * number);
}

function randomElementFrom(array) {
    let randomItem = array[Math.floor(Math.random() * array.length)];
    return randomItem;
}

// create ordinary stars
function generateOrdinaryStars(number) {

    let x,y,r,color;

    for (let i = 0; i < number; i++) {
        x = randomFromZeroTo(canvas.width);
        y = randomFromZeroTo(canvas.height);
        r = randomElementFrom(stars.radiuses);
        color = randomElementFrom(stars.colors);

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x,y,r,0,2*Math.PI); // arc(x, y, r, startAngle, endAngle)
        ctx.fill();
    }
}

// create stars with areola
function generateGradientStars(number) {

    let x,y,r,areol,color;

    for (let i = 0; i < number; i++) {
        x = randomFromZeroTo(canvas.width);
        y = randomFromZeroTo(canvas.height);
        r = randomElementFrom(stars.radiuses);
        areol = randomElementFrom(stars.areolas);
        color = randomElementFrom(stars.colors);

        // Create gradient stars
        let grd = ctx.createRadialGradient(x,y,r, x,y,r*areol); // (x0, y0, r0, x1, y1, r1);
        grd.addColorStop(0, color);
        grd.addColorStop(1,"transparent");

        // Fill canvas with gradient stars
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height); // fillRect(x, y, width, height) 
    }
}

// refresh width/height & clear canvases
function refreshCanvas() {
    ctx.canvas.width  = canvas.clientWidth; 
    ctx.canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}



createStarsBackground('stars_bg', 1400, 14);
