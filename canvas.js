"use strict"
// Global variables
const canvas = document.querySelector('canvas');	// Canvas working area
const xAxis = [0,1,2,3,4,5,6,7,8,9,10];
const yAxis = [1,2,3,4,5,6,7,8,9,10];
const ctx = canvas.getContext('2d');				// Drawing key
const gridMin = 100;
const gridMax = 509;
const cellSize = 40;
const instruct = "Your TASK is to use the algebra formula (y = mx + b)"+
"\nto control Pikachu to attack Snorlax.\nYou have to check the Snorlax's"+
" location and adjust the\nslope(m) and/or the intercept(b) in order "+
"to knock it down.\n\nFor example, if Snorlax is at [8,10], then we set m = 1"+
" and\nb = 2, so the equation becomes 'y = 1x + b'. Now we test\nplugging"+
" x = 8, y = 10, we see that the equation is fulfilled.\n\nRemember, it could"+
"be more than one possible solutions.\n\nAlright! Let's Do It!"
const mBar = document.querySelector('#m-value');
const bBar = document.querySelector('#b-value');
const enemyChr = document.getElementById('enemy');
const allyChr = document.getElementById('ally');
const animateImg = document.getElementById('animate');
const attkBtn = document.getElementById('fire'); 
const replayBtn = document.getElementById('replay');
const fireAct = document.getElementById('skill');
const mTxt = document.getElementById('m-txt');
const bTxt = document.getElementById('b-txt');
var enemyCoord = [];
var enemyLocation = 0;
var mValue = mBar.value, bValue = bBar.value, 
destX = gridMin, destY = gridMax, origX = gridMin, origY = gridMax;
var timerId = null;
var goal = false;

// Initialize
function init(){		
	canvas.width = 1200 ;
	canvas.height = 700;
	updateTxt();
	drawGrid();
	drawText();
	allocateEnemy();
	pixelizeDestXY(mValue,bValue);
	drawLine(origX,origY);
}

// Drawing text
function drawText(){
	// Instruction
	ctx.save();
	ctx.textBaseline = "middle";
	ctx.fillStyle = 'rgba(247, 247, 171, 0.8)';
	ctx.fillRect(620,30, 500,320);
	ctx.fillStyle = "#0000ff";
	ctx.font = "bold 20px serif";
	var lines = instruct.split('\n');
	var lineHeight = 25;
	for(let i = 0; i < lines.length; i++)
		ctx.fillText(lines[i], 620, 50 + (i * lineHeight));

	// Slide bars
	// m-slider
	ctx.fillStyle = '0099ff';
	ctx.font = "18px serif";
	ctx.fillText('m value:', 120, 570);

	// b-slider
	ctx.fillStyle = '0099ff';
	ctx.font = "18px serif";
	ctx.fillText('b value:', 370, 570);
	ctx.restore();
}

// Drawing grid
function drawGrid(){	
	const columnSize = 40;							// Context
	const rowSize = 40;
	const sections = 10;
	const xScale = 40;
	const yScale = 40;
	const xAxis = [0,1,2,3,4,5,6,7,8,9,10];
	const yAxis = [1,2,3,4,5,6,7,8,9,10];
	const x = 100, y = 100;							// Starting x & y
	const w = columnSize, h = rowSize;	

	ctx.beginPath();									// Drawing the frame
	ctx.moveTo(100, 100);
	ctx.lineTo(100, 509);
	ctx.lineTo(509, 509);
	ctx.lineTo(509, 100);
	ctx.lineTo(100, 100);
	ctx.closePath;
	ctx.stroke();

	ctx.save();
	for(let i = 0; i < 10; i++){					// Drawing the body
		for(let j = 0; j < 10; j++){	
			ctx.fillStyle = 'rgba(111, 166, 248, 0.25)';
			ctx.fillRect(x + i * columnSize + i, y + j * rowSize + j, w, h);
		}
	}

	for (let i=0 ; i <= sections; i++) {
		const x = i * xScale + i;
        const y = i * yScale + i;
		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.font = "8pt Verdana";
		if( i == 0 || i == 10)
			ctx.fillText(xAxis[i], 92 + x, 523);
		else
			ctx.fillText(xAxis[i], 96 + x, 523);
		if(i < 9)
			ctx.fillText(yAxis[i], 88, 469 - y);
		else if(i == 9)
			ctx.fillText(yAxis[i], 84, 469 - y);
	}
	ctx.restore();
}
// Clear grid
function clrGrid(){
	ctx.clearRect(gridMin - 50, gridMin - 10, gridMax, gridMax - 45);
}


// Draw line
function drawLine(x, y){
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(destX, destY);
	ctx.closePath;
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(gridMin, gridMin);
	ctx.lineTo(gridMin, gridMax);
	ctx.lineTo(gridMax, gridMax);
	ctx.lineTo(gridMax, gridMin);
	ctx.lineTo(gridMin, gridMin);
	ctx.closePath();
	ctx.clip();

	var formula = `y = ${mValue}x + ${bValue}`;
	ctx.save();
	ctx.textAlign = "center";
	ctx.font = `18px Arial`;
	let txtX = gridMax - 2 * cellSize;
	let txtY = gridMax - 2 * cellSize; 
	ctx.fillText(formula, txtX, txtY);
	ctx.restore();
}

// Slider handler
mBar.addEventListener('input',onSeek, false);
bBar.addEventListener('input',onSeek, false);
mBar.addEventListener('change',onSet, false);
bBar.addEventListener('change',onSet, false);
function onSeek(){
	mValue = mBar.value;
	bValue = bBar.value;
	updateTxt();
	clrGrid();
	drawGrid();
	pixelizeDestXY(mValue, bValue);
	drawLine(gridMin, pixelizeOrigin(bValue));
	moveAlly(pixelizeOrigin(bValue));
}
function onSet(){
	allyChr.setAttribute('src','img/pika_stdr2_rmbg.gif');
}

// Text handler
mTxt.addEventListener('input', updateMB, false);
bTxt.addEventListener('input', updateMB, false);
function updateMB(){
	mBar.value = mTxt.value;
	bBar.value = bTxt.value;
	onSeek();
}

// Button handler
function btnAction(){
	animateImg.hidden = false;
	setTimeout(function(){
		animateImg.setAttribute('src','img/pika_fire3_R.gif');
	}, 1500);
	
	setTimeout(function(){
		animateImg.setAttribute('src','img/pika_fire_R.gif');
		animateImg.hidden = true;
	},2500);
	setTimeout(startAttkAnimation, 3000);
}
attkBtn.addEventListener('click',btnAction);
replayBtn.addEventListener('click',function(){
	window.location.reload();
});

// Image controle
// enemy
function allocateEnemy(){
	var zeroToTen = Math.floor(Math.random() * 10 );
	console.log('random number:', zeroToTen)
	assignCoord(zeroToTen);
	console.log('coord:',enemyCoord);
}

function moveAlly(newY){
	allyChr.setAttribute('src','img/pika_run.gif');
	allyChr.style.top = `${newY - 50}px`;
	fireAct.style.top = `${newY - 30}px`;
	fireAct.style.left = `${gridMin}px`;
}

function startAttkAnimation(){	
	fireAct.hidden = false;
	timerId = setInterval(attack, 10);
}

function attack(){
	var imgTop = parseInt(fireAct.style.top);
	var imgLeft = parseInt(fireAct.style.left);
	origX = imgLeft;
	origY = imgTop;
	pixelizeDestXY(mValue, bValue);
	if((imgLeft == destX && imgTop == destY) || imgLeft >= gridMax || imgTop <= gridMin){
		clearTimeout(timerId);
		timerId = null;
		setTimeout(function(){
			fireAct.hidden = true;
			checkGoal();
		}, 1000);
		fireAct.style.top = `${origX}px`;	
		fireAct.style.left = `${origY}px`;
	}
	if(imgTop > destY)
		imgTop -= Number(mValue);
	else if(imgTop < destY)
		imgTop += Number(mValue);
	if(imgLeft < destX)
		imgLeft += 1;
	else if(imgLeft > destX)
		imgLeft -= 1;

	console.log(`imgLeft: ${imgLeft}, destX: ${destX}, imgTop: ${imgTop}`);
	fireAct.style.left = `${imgLeft}px`;
	fireAct.style.top = `${imgTop}px`;
}


// Implementation
init();

// Helper functions
// Pixelize Starting coordinates
function pixelizeOrigin(val){
	return (gridMax - val * cellSize - val);
}

// Pixelize destination X and Y coordinates
function pixelizeDestXY(mVal, bVal){
	destX = gridMin;
	destY = gridMax;
	let x = cellSize * (10 - mVal + 1) + 9;
	let y = (mVal * x) + Number(mVal) + (bVal * cellSize) + Number(bVal);			
	destX = destX + x;	
	destY = destY - y;
}

// Check goal
function checkGoal(){	
	ctx.save();
	ctx.textBaseline = 'top';
	ctx.fillStyle = 'rgba(247, 247, 171, 0.8)';
	ctx.font = '16px serif';
	ctx.fillRect(345,345,145,26);
	ctx.fillStyle = '#0000ff';
	if((Number(enemyCoord[0]) * Number(mValue) + Number(bValue)) == Number(enemyCoord[1])){
		enemyChr.setAttribute('src','img/snorlax_slp.gif');
		let result = `Great job! You did it!`;
		ctx.fillText(result, 350, 350);
		attkBtn.disabled = true;
	}else{
		let result = `Oh No!! Try again!`;
		ctx.fillText(result, 350, 350);
	}
	ctx.restore();
}

// Update Textbox values with sliders
function updateTxt(){
	mTxt.value = mValue;
	bTxt.value = bValue;
}

// Assign enemy's coordinates
function assignCoord(zeroToTen){
	ctx.save();
	ctx.fillStyle = 'rgba(247, 247, 171, 0.8)';
	ctx.font = '16px serif'
	ctx.textBaseline = 'top';
	var wid = ctx.measureText(`Snorlax is at[10,10]`).width;
	ctx.fillRect(20,30,wid,20);
	ctx.fillStyle = '#0000ff';
	if(zeroToTen != 0){
		enemyLocation = zeroToTen * cellSize + zeroToTen;
		enemyChr.style.left = `${gridMax - enemyLocation - cellSize - 1}px`; 
		enemyChr.style.top = `-20px`; 
		ctx.fillText(`Snorlax is at[${10-zeroToTen},10]`, 20, 30);
		enemyCoord = [10-zeroToTen,10];
	}else{
		zeroToTen = Math.floor(Math.random() * 10 );
		enemyLocation = zeroToTen * cellSize + zeroToTen;
		enemyChr.style.top = `${enemyLocation}px`;
		ctx.fillText(`Snorlax is at[10,${10-zeroToTen}]`, 20, 30);
		enemyCoord = [10,10-zeroToTen];
	}
	ctx.restore();
}
