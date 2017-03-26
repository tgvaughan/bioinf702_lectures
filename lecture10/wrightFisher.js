var plotVertices = true;
var plotCoalescence = true;
var trace = [];
var N = 32;
var bottleneck = 0.25;
var wavelength = 16;
var theta = 0;
var delayInMillis = 100;

var G = 64;

var Key = {
  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40
};

window.onload = function() {

	for (var i = 1; i <= N; i++) {
		trace.push(i);
	}

    // Computes the canvas size based on the dimension of the parent div
    var container = document.getElementById("canvas-container");
    var bbox = container.getBoundingClientRect();
    canvas.setAttribute("width", bbox.width);
    canvas.setAttribute("height", bbox.height);

	canvas = document.getElementById("canvas"); // grabs the canvas element
	ctx = canvas.getContext("2d"); // returns the 2d context object
	
	window.addEventListener('keydown', function(evt) {
								
		switch (evt.keyCode) {
			case Key.UP:
				setG(G + 1);
				break;
			case Key.DOWN:
				if (G > 2) {
				  setG(G - 1);
				}
				break;
			case Key.LEFT:
				if (N > 2) {
				  setN(N - 1);
				}
				break;
			case Key.RIGHT:
				  setN(N + 1);
				break;
			default:
		}
	});
	
	window.addEventListener('keypress', function(evt) { 
		if (evt.key == 'n') {
			addGenerationGenerateAndDraw();
		}

		if (evt.key == 'v') {
			vertex = !vertex;
			drawWrightFisher();
		}

	});
	regenerate();
};

var intervalId = null;
 
function run() {
	intervalId = setInterval(nextGeneration, delayInMillis);
}
  
function stop() {
	if (isRunning()) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

function isRunning() {
	return (intervalId !== null);
}

// set the number of generations to plot
function setG(g) {
	G = parseInt(g);
	regenerate();
}

// set the maximum population size
function setN(n) {
	N = parseInt(n);
	
	trace = [];
	for (var i = 1; i <= N; i++) {
		trace.push(i);
	}
	
	regenerate();
}

function setWavelength(w) {
	wavelength = w;
	drawWrightFisher();	
}

function setBottleneckFraction(b) {
	bottleneck = b;			
	regenerate();
}

function setAnimationSpeed(speed) {
	delayInMillis = 1000/speed;	
	if (isRunning()) {
		stop();
		run();
	}
}


// calculate the next generation and re-draw the whole wright-fisher population
function nextGeneration() {
	
	theta = theta + 2 * Math.PI / wavelength;
	
	amplitude =  N * (1.0-bottleneck) / 2.0;
	
	var n = Math.round((N - amplitude) + amplitude * Math.cos(theta));
	if (n < 1) n = 1;
		
	addGeneration(n);
	drawWrightFisher();	
}

function regenerate() {
	generateWrightFisher();
	drawWrightFisher();		
}

function setPlotVertices(checkbox) {
	plotVertices = checkbox.checked;	
	drawWrightFisher();		
}

function setPlotCoalescence(checkbox) {
    plotCoalescence = checkbox.checked;
    drawWrightFisher();
}

function generateWrightFisher() {
	pop = initialPopulation(G, N);
	sortPopulation(pop);
}

function drawWrightFisher() {
	ctx.fillStyle = "#FFFFFF"; // sets color
	ctx.fillRect(0, 0, width(), height()); // sets top left location points x,y and then width and height
	ctx.strokeStyle = "#808080";
	ctx.lineWidth = 0.5;
	plotWrightFisher(ctx);

    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 1.5;
    traceCoalescence(trace, pop[0], ctx);

	ctx.stroke();
}

// adds a generation to the population and removes the oldest generation
function addGeneration(n) {
	
	var ngen = pop.length;
	
	tmp = pop[ngen-1];
	
	// shift current generations up one
	for (var i = ngen-1; i > 0; i--) {
		pop[i] = pop[i-1];	
		
		// update gen numbers
		for (var j = 0; j < pop[i].length; j++) {
			pop[i][j].gen = i;
		}
	}
	
	// resize spare array if necessary
	m  = tmp.length;
	if (m < n) {
	    // add extra elements
	    for (var j = m; j < n; j++) {
	    	tmp.push({label: j + 1});
	    }
	} else if (m > n) {
		// remove last element until it is the right size
		for (var j = n; j < m; j++) {
			tmp[tmp.length-1].parent = null;
			tmp.pop();	
		}
	} 
	pop[0] = tmp;

	// clear old parent links from new oldest generation
	for (var j = 0; j < pop[ngen-1].length; j++) {
		pop[ngen-1][j].parent = null;
	}

	// insert new generation in zero'th row
	for (var j = 0; j < pop[0].length; j++) {
		
		// rewrite data in new generation
		pop[0][j].label = j+1;
		pop[0][j].gen = 0;
		pop[0][j].parent = pop[1][Math.floor((Math.random() * pop[1].length))];
	}	
	
	// sort this generation by parent numbers
	pop[0].sort(function(a, b) {
		return a.parent.num - b.parent.num
	});
	// number this generation after sorting
	for (var j = 0; j < pop[0].length; j++) {
		pop[0][j].num = j;
	}
}

function width() {
	return canvas.width;
}

function height() {
	return canvas.height;
}

function plotWrightFisher(context) {
	scale = Math.min(width() / (N + 2), height() / (G + 2));
	
	xMargin = (width() - scale * (N + 2.0)) / 2.0
	yMargin = (height() - scale * (G + 2)) / 2.0
	radius = scale * 0.23;
	context.beginPath();
	
	var xm = 0;
	var pxm = 0;
	for (i = G-1; i >= 0; i--) {
		// calculate generation specific xm
		
		xm = (width() - scale * (pop[i].length + 2.0)) / 2.0
		for (j = 0; j < pop[i].length; j++) {
			pop[i][j].x = (j+1) * scale + xm
			pop[i][j].y = height() - yMargin - (i+1) * scale

			if (i < G-1) {
				plotParentLine(pop[i][j], context)
			}
		}
		pxm = xm;
	}
	context.stroke();
	
	if (plotVertices) {
		for (i = 0; i <= G-1; i++) {
			// calculate generation specific xm
			xm = (width() - scale * (pop[i].length + 2.0)) / 2.0
			for (j = 0; j < pop[i].length; j++) {
				//text(pop[j-1][i-1].label,i*scale+xMargin, height - yMargin - j*scale)
				
				node = pop[i][j];
				
				context.beginPath();
				context.ellipse(node.x, node.y, radius, radius, 0, 0, 2 * Math.PI)
				context.fill();
				context.stroke();
			}
		}
	}
}

function plotParentLine(node, context) {
	if (node["parent"]) {
		p = node.parent;
		context.moveTo(node.x, node.y);
		context.lineTo(p.x, p.y);
	}
}

function plotCoalescentLine(node, context) {
	x1 = scale + xMargin;
	x2 = scale * N + xMargin;
	context.moveTo(x1, node.y);
	context.lineTo(x2, node.y);
}

function initialPopulation(G, N) {
	var arr = [];
	// Creates all generations:
	for (var i = 0; i < G; i++) {
		// Creates an empty line
		arr.push([]);
		// Adds cols to the empty line:
		arr[i].push(new Array(N));
	}
	// populate generations from oldest to most recent
	for (var i = G - 1; i >= 0; i--) {
		for (var j = 0; j < N; j++) {
			// Initializes:
			arr[i][j] = {
				label: j + 1
			};
			arr[i][j].gen = i;
			arr[i][j].num = j;
			if (i < G - 1) {
				arr[i][j].parent = arr[i + 1][Math.floor((Math.random() * N))];
			}
		}
	}
	return arr;
}

function traceCoalescence(labels, gen, context) {
	nodes = [];
	for (var j = 0; j < gen.length; j++) {
		if (labels.indexOf(gen[j].label) > -1) {
			nodes.push(gen[j]);
		}
	}
	traceNodes(nodes, context);
}

function traceNodes(nodes, context) {
	parents = [];
	context.beginPath();
	xm = (width() - scale * (pop[nodes[0].gen].length + 2.0)) / 2.0
	for (var j = 0; j < nodes.length; j++) {
		plotParentLine(nodes[j], context);
		if (nodes[j]["parent"]) {
			if (parents.indexOf(nodes[j].parent) === -1) {
				parents.push(nodes[j].parent);
			}
		}
	}
	context.stroke();
	if (parents.length < nodes.length && parents.length > 0) {
		
		if (plotCoalescence) {
			context.strokeStyle = "#0000FF";
			context.beginPath();
			plotCoalescentLine(parents[0], context);
			context.stroke();
		}
		context.strokeStyle = "#FF0000";
	}
	if (parents.length > 0) {
		traceNodes(parents, context);
	}
}

function sortPopulation(pop) {
	for (i = (G - 2); i >= 0; i--) {
		gen = pop[i];
				
		// sort this generation by parent numbers
		gen.sort(function(a, b) {
			return a.parent.num - b.parent.num
		});
		// renumber this generation after sorting
		for (var j = 0; j < gen.length; j++) {
			gen[j].num = j;
		}
	}
}
