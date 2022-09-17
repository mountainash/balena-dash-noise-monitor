const settings = {
		amplitudeX: 20,
		amplitudeY: 20,
		lines: 20,
		startColor: '#191A2A',
		endColor: '#ff7b00'
	},
	c = document.getElementById('canvas'),
	ctx = c.getContext('2d');

let	Paths = [],
	color = [],
	winW = window.innerWidth,
	winH = window.innerHeight,
	time = 0,
	curves,
	velocity;

class Path {
	constructor(y, color) {
		this.y = y;
		this.color = color;
		this.root = [];
		this.create();
		this.draw();
	}

	create() {
		let rootX = 0,
			rootY = this.y + 30;

		this.root = [{ x: rootX, y: rootY }];

		while (rootX < winW) {
			let casual = Math.random() > 0.5 ? 1 : -1,
				x = parseInt(settings.amplitudeX / 2 + Math.random() * settings.amplitudeX / 2),
				y = parseInt(rootY + casual * (settings.amplitudeY / 2 + Math.random() * settings.amplitudeY / 2)),
				delay = Math.random() * 100;
			rootX += x;
			this.root.push({ x: rootX, y: y, height: rootY, casual: casual, delay: delay });
		}
	}

	draw() {
		ctx.beginPath();
		ctx.moveTo(0, winH);

		ctx.lineTo(this.root[0].x, this.root[0].y);

		for (let i = 1; i < this.root.length - 1; i++) {

			let x = this.root[i].x,
				y = this.root[i].y,
				nextX = this.root[i + 1].x,
				nextY = this.root[i + 1].y,

				xMid = (x + nextX) / 2,
				yMid = (y + nextY) / 2,
				cpX1 = (xMid + x) / 2,
				cpY1 = (yMid + y) / 2,
				cpX2 = (xMid + nextX) / 2,
				cpY2 = (yMid + nextY) / 2;

			ctx.quadraticCurveTo(cpX1, y, xMid, yMid);
			ctx.quadraticCurveTo(cpX2, nextY, nextX, nextY);
		}

		const lastPoint = this.root.reverse()[0];
		this.root.reverse();
		ctx.lineTo(lastPoint.x, lastPoint.y);
		ctx.lineTo(winW, winH);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}
}

/* INIT */
let path;
function init() {
	c.width = winW;
	c.height = winH;
	Paths = [];

	color = chroma.scale([settings.startColor, settings.endColor]).mode('lch').colors(settings.lines);

	document.body.style = `background: ${settings.startColor}`;

	for (let i = 0; i < settings.lines; i++) {
		Paths.push(new Path(winH / settings.lines * i, color[i]));
		settings.startY = winH / settings.lines * i;
	}
}

/* WIN RESIZE */
window.addEventListener('resize', function() {
	winW = window.innerWidth;
	winH = window.innerHeight;
	c.width = winW;
	c.height = winH;
	if ( winW > 900)
		init();
});
window.dispatchEvent(new Event('resize'));

/* COLOR SCHEME */
function darkMode(isdark) {
	if (isdark) {
		settings.initStartColor = settings.startColor;
		settings.initEndColor = settings.endColor;
		settings.startColor = chroma(settings.startColor).darken(.5);
		settings.endColor = chroma(settings.endColor).darken(3);
	} else { // revert
		settings.startColor = settings.initStartColor;
		settings.endColor = settings.initEndColor;
	}
	init();
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	darkMode(true);
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
	darkMode(event.matches);
});

/* RENDER */
function render() {
	c.width = winW;
	c.height = winH;

	curves = decibels;
	velocity = decibels;

	time += 0.05;

	Paths.forEach(function(path, i) {
		path.root.forEach(function(r, j) {
			if (j % curves == 1) {
				let move = Math.sin(time + r.delay ) * velocity * r.casual;
				r.y -= (move / 2) - move;
			}
			if (j + 1 % curves == 0) {
				let move = Math.sin(time + r.delay ) * velocity * r.casual;
				r.x += (move / 2) - move / 10;
			}
		});

		path.draw();
	});

	requestAnimationFrame(render);
}
render();