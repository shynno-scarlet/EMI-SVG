//-----------------------------------------//
//  Dieses JavaScript läuft nur in NodeJS  //
//-----------------------------------------//

//Verwendung: node stars.js <Anzahl Zacken> <Äußerer Radius> <Innerer Radius> <Dauer für 1 Rotation> <RGB Farben (jeweils einzeln)>

const proc = require("process");
const FS = require("fs/promises");

//argv[0] == node.exe; argv[1] == stars.js

//Anzahl der Edges als Arg
let edges = Number(proc.argv[2]) || 5;

//Radius als Arg
let outerRadius = Number(proc.argv[3]) || 100;
let innerRadius = Number(proc.argv[4]) || 30;

//Animationsdauer
let dur = Number(proc.argv[5]) || 3;

//RGB Fill Color
let clR = Number(proc.argv[6]) || 255;
let clG = Number(proc.argv[7]) || 255;
let clB = Number(proc.argv[8]) || 255;

// Runden auf x Nachkommastellen
const RoundTo = (num,x) => {
    let p = Math.pow(10, x);
    return (Math.round(num * p)) / p;
}

// Polygon-Punkte berechnen und als Array ausgeben
// Center = [0,0]
const PolyPoints = (e,r) => {
    let a = [];
    for(let i = 0; i < e; i++){
        a.push([RoundTo(r * Math.cos(2 * Math.PI * i / e), 3), RoundTo(r * Math.sin(2 * Math.PI * i / e), 3)]);
    }
    return a;
}

// 2 Polygone zu einem Stern zusammenfügen
const PolysToStar = (innerPoly, outerPoly, r) => {
    // Fix, damit die Punkte von innerPoly nicht mehr mit outerPoly und dem Mittelpunkt auf einer Linie liegen
    let rot = (360 / innerPoly.length) / 2;
    rot = (Math.PI / 180) * rot;
    for(let i = 0; i < innerPoly.length; i++){
        let newX = RoundTo((Math.cos(rot) * innerPoly[i][0]) - (Math.sin(rot) * innerPoly[i][1]), 3);
        let newY = RoundTo((Math.sin(rot) * innerPoly[i][0]) + (Math.cos(rot) * innerPoly[i][1]), 3);
        innerPoly[i] = [newX,newY];
    }
    console.log(innerPoly);
    
    // Poly zu Stern zusammenfügen
    let a = [];
    if(innerPoly.length == outerPoly.length){
        for(let i = 0; i < outerPoly.length; i++){
            a.push([outerRadius - outerPoly[i][0],outerRadius - outerPoly[i][1]]);
            a.push([outerRadius - innerPoly[i][0],outerRadius - innerPoly[i][1]]);
        }
    }
    return a;
}

// Polygone Punkte als SVG String formatieren
const PolyPointsToSVG = (points) => {
    for(let i = 0; i < points.length; i++){
        points[i] = points[i].join(",");
    }
    points = points.join(" L");
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${outerRadius * 2}" height="${outerRadius * 2}">
        <path fill="rgb(${clR}, ${clG}, ${clB})" fill-rule="evenodd" d="M ${points} Z">
            <animateTransform attributeName="transform" type="rotate" dur="${dur}s" repeatCount="indefinite" values="0 ${outerRadius} ${outerRadius};360 ${outerRadius} ${outerRadius}"/>
        </path>
    </svg>`;
}


let outer = PolyPoints(edges,outerRadius);
let inner = PolyPoints(edges,innerRadius);

let star = PolysToStar(inner,outer,outerRadius);

FS.writeFile(`./sterne/star${edges}.svg`, PolyPointsToSVG(star), {encoding: "utf8"}).then(() => {
    console.log(`Stern mit ${edges} Zacken als SVG gespeichert.`);
}).catch((e) => {
    console.log(e);
});