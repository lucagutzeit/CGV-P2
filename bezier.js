var canvas;
var ctx;
var t = 0.5 ;

var control_points
const max_bezier_depth = 10;    // max recursion depth -> 2^depth segments
const initial_num_points = 4;    
const line_width = 3;
const point_size = 8;
const back_color = '#FDFDFD';
const stroke_color = '#256785'
const line_color = '#5FAFD2';
const point_color = '#DC6955';

const dash_line = '#171214';
const orange_line = '#FBA860';
const pink_line = '#ED33B9';
const isDrawSupport=true;

class P {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function stepper(btn){
    let input_t = document.getElementById('input-t');
    let id = btn.getAttribute("id");
    let min = input_t.getAttribute("min");
    let max = input_t.getAttribute("max");
    let val = input_t.getAttribute("value");

    let newValue = (id === "increment") ? (parseFloat(val) + 0.01) : (parseFloat(val) - 0.01);

    if(newValue >= min && newValue <= max){
        input_t.setAttribute("value", newValue.toFixed(2));
        t = newValue.toFixed(2);
        console.log(t);
        draw(control_points);
    }
}

function getRandomPoint(width, height) {			
    return new P(Math.floor(Math.random() * width),
                    Math.floor(Math.random() * height));
}

function getRandomPoints(num_points) {
    var CP = Array(num_points);
    for (var i=0; i<num_points; i++) {
        CP[i] = getRandomPoint(canvas.width, canvas.height);
    }
    control_points = CP;
    return CP;
}

function drawSupportLines(point_layers) {
    for(var i=0; i<point_layers.length; i++) {
        for(var j=0; j<point_layers[i].length-1; j++) {
            line(point_layers[i][j], point_layers[i][j+1], 1, dash_line, [5]);
            point(point_layers[i][j+1], pink_line);
        }
        point(point_layers[i][0], pink_line);
    }
}


function draw(points) {
    if(ctx) {
        resetCanvas();

        var layers = bezier(points, max_bezier_depth);
    
        if(isDrawSupport) {
            drawSupportLines(layers);
        }
        
        // Stützpunkte zeichnen
        for (var i=0; i<points.length; i++) {
            point(points[i]);
        }
    }  
}

function point (P, color = point_color,  size = point_size) {
    ctx.fillStyle = color;
    ctx.fillRect(P.x-size/2,P.y-size/2,size,size);
}

function line (P0, P1, width = line_width, color=line_color, segments=[]) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(segments);
    ctx.beginPath();
    ctx.moveTo(P0.x, P0.y);
    ctx.lineTo(P1.x, P1.y);
    ctx.stroke();
}

function bezier (points, depth) {
    var point_layers = Array(points.length);
    if(depth === 0 || Math.sqrt(points[0] - points[points.length-1]) < 2) {
        line(points[0], points[points.length-1]);
    } else {
        point_layers[0] = points; 

        for(var i=1; i<point_layers.length; i++) {
            point_layers[i] = Array(points.length-i);
        }

        for (var i = 1; i<points.length; i++){
            for(var j = 0; j<points.length-i; j++) {
                let pointA = point_layers[i-1][j];
                let pointB = point_layers[i-1][j+1]

                point_layers[i][j] = new P((t*pointA.x+(1-t)*pointB.x), (t*pointA.y+(1-t)*pointB.y));
            }
        }

        var new_points_left = Array(points.length);
        var new_points_right = Array(points.length);
        
        for(var k = 0; k < points.length; k++) {
            new_points_left[k] = point_layers[k][0];
            new_points_right[new_points_right.length-1-k] = point_layers[k][point_layers[k].length-1];
        }				

        bezier(new_points_left, depth-1);
        bezier(new_points_right, depth-1);
    }
    return point_layers;
}

function resizer() {
    if (canvas.width != document.body.clientWidth) {
        canvas.width = document.body.clientWidth;
        //console.log(canvas.width, canvas.height);
        drawWithNewPoints();
    }
}

function drawWithNewPoints() {
    draw(getRandomPoints(initial_num_points))
}

function resetCanvas() {
    if (ctx) {
        ctx.fillStyle = back_color;
        ctx.strokeStyle = stroke_color;
        ctx.setLineDash([]);
        ctx.fillRect(0, 0, canvas.width, canvas.height);	
        ctx.strokeRect(0, 0, canvas.width, canvas.height);	
        ctx.lineWidth = line_width;
    }
}

window.addEventListener('load', function () {
    canvas = document.getElementById('beziers');
    // check for browser support
    if (canvas && canvas.getContext) {
        canvas.width = document.body.clientWidth; 
        ctx = canvas.getContext('2d');
        canvas.addEventListener('mousedown', drawWithNewPoints, false);
        window.addEventListener('resize', resizer, false);
        if (ctx) {
            drawWithNewPoints();
        }
    }
}, false);				
