var THREE, camera, scene, renderer, labelRenderer, LabelObject; //THREEjs variables
var controls; //Object variables

//Raycaster variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

//arrays
var objects = []; 

//Declare width and height of canvas
var width = $('.tourwrap').width(); //declare width
var height = $('.tourwrap').height(); //declare height

//Show landscape popup if window is in portrait mode
$(document).ready(function(){
	if(window.innerHeight > window.innerWidth){
		$('.uselandscape').css("display", "table");
	}
});
//Close landscape popup on click
$(window).on('orientationchange resize', function(){ $('.uselandscape').hide(); });
$('.close').on('click touchend', function(){ $('.uselandscape').hide(); });

//Execute main functions
init();
//Execute other functions after THREEjs items are loaded
THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
    if(loaded === total){
		animate();
		afterinit();
	}
};

function init() {
	//RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha:true } );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( width, height );
	renderer.autoClear = false;
	renderer.setClearColor(0x000000, 0.0);
    document.getElementById('virtualtour').appendChild( renderer.domElement );
	
	//LabelRenderer
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize( width, height );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.getElementById('labelwrap').appendChild( labelRenderer.domElement );
	
	//Camera position etc
	camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 2200 ); 
	camera.position.x = camerastartX;
	camera.position.y = camerastartY;
	camera.position.z = camerastartZ;
    
    // OrbitControls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.enableZoom = false; 
    controls.enableRotate = true;
	controls.enableDamping = true;
	controls.dampingFactor = 0.07;
	controls.target.set(0,0,0);
	//controls.rotateSpeed = 0.07;
	controls.maxAzimuthAngle = Math.PI / 2.5;
	controls.minAzimuthAngle = Math.PI / -2.5;
	controls.minPolarAngle = 1.0;
	controls.maxPolarAngle = Math.PI / 2.2;
	controls.enabled = true;//enable self controlling	

}// end of init();



var nummer;

$(document).on('click touchend','.label', function() {
	
	nummer = $(this).attr('class').match(/\d+/);
	
	//controls.target.set(orbs[nummer].position.x,orbs[nummer].position.y,orbs[nummer].position.z );
	
    gsap.to( controls.target, {
        duration: 1,
        x: orbs[nummer].position.x,
        y: orbs[nummer].position.y,
        z: orbs[nummer].position.z,
		onUpdate: function () {
			controls.update();
		}
    });
	
	gsap.to( camera, {
		duration: 1,
		zoom: 2,
		onUpdate: function () {
			camera.updateProjectionMatrix();
		}
	});
	
    var str = orbs[nummer].callback.name;
    str = str.replace(/_/g, ' ');
    $('.infocard h2').text(str);
	
	window[orbs[nummer].callback.name + "_text"](); //set infocard text by executing function
	
	$('.infocard').stop().fadeIn();
	
	$('.label').removeClass('thislabel');
	$(this).addClass('thislabel');
	
});

$('.infocard a.button').on('click', function() {
    orbs[nummer].callback();
});

function closeinfocard() {
	$('.thislabel').removeClass('thislabel');
	$('.infocard').stop().fadeOut();
	
    gsap.to( controls.target, {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
		onUpdate: function () {
			controls.update();
		}
    } );
	
	gsap.to( camera, {
		duration: 1,
		zoom: 1,
		onUpdate: function () {
			camera.updateProjectionMatrix();
		}
	} );
}

$(document).on('click touchend','.thislabel, .closeinfocard', function() {
	closeinfocard();
});

//close popup on click outside of video
$(document).on('click touchend','.popup', function() {
	$(this).fadeOut(300, function() { $(this).remove(); });
});


var ClientClickX, ClientClickY;

var canvas = document.body.getElementsByTagName('canvas')[0];
var intersects;

// Using the same logic as above, determine if we are currently mousing over a three.js object,
// and adjust the animation to provide visual feedback accordingly
$('.tourwrap').on('mousemove', function(event) {
    event.preventDefault();
	
	var wrap = this;

    mouse.x = ((event.pageX - wrap.offsetLeft) / wrap.clientWidth) * 2 - 1;
    mouse.y =  - ((event.pageY - wrap.offsetTop) / wrap.clientHeight) * 2 + 1;
	
    raycaster.setFromCamera(mouse, camera);
	intersects = raycaster.intersectObjects( objects, true );
	
	if(intersects.length > 0) {
		
		if ( intersects[0].object.userData.tag === 'nocursor' ) {
			canvas.style.cursor = "default";
		} else {
			if(intersects[0].object.visible === true) {
				canvas.style.cursor = "pointer";
			}
		}
	} else {
        canvas.style.cursor = "default";
	}
});

$('.tourwrap').on('mousedown', function(event){
	var wrap = this;
	
    clientClickX = event.pageX - wrap.offsetLeft;
    clientClickY = event.pageY - wrap.offsetTop;
});

$('.tourwrap').on('mouseup', function(event) {
    event.preventDefault();
	
	var wrap = this;
	
    var x = event.pageX - wrap.offsetLeft;
    var y = event.pageY - wrap.offsetTop;
	
	if( x != clientClickX || y != clientClickY ) {
		//If you drag the cursor on mousedown
	} else {
		//If you click (mousedown and mouseup on the same spot)
		
		mouse.x = ((event.pageX - wrap.offsetLeft) / wrap.clientWidth) * 2 - 1;
		mouse.y =  - ((event.pageY - wrap.offsetTop) / wrap.clientHeight) * 2 + 1;
		
		raycaster.setFromCamera(mouse, camera);
		
		var intersects = raycaster.intersectObjects( objects, true );
		
		if (intersects.length > 0) {
			//Start callbacks
			if(intersects[0].object.callback && intersects[0].object.visible === true) {
				intersects[0].object.callback();
			}
		}
	}
});


$('.tourwrap').on('touchstart', function() {
    documentClick = true;
});

$('.tourwrap').on('touchmove', function() {
    documentClick = false;
});

$('.tourwrap').on('touchend', function(event) {
	event.preventDefault();
	
	var wrap = this;
	
    if (documentClick) {

		mouse.x = ((event.changedTouches[0].pageX - wrap.offsetLeft) / wrap.clientWidth) * 2 - 1;
		mouse.y = -((event.changedTouches[0].pageY - wrap.offsetTop) / wrap.clientHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);

		var intersects = raycaster.intersectObjects( objects, true );

		if (intersects.length > 0) {
			//Start callbacks
			if(intersects[0].object.callback) {
				intersects[0].object.callback();
			}
		}
	}
});



var $mouseX = 0, $mouseY = 0;
var $xp = 0, $yp = 0;

$(document).mousemove(function(e){
    $mouseX = e.pageX;
    $mouseY = e.pageY;
});

//this function executes when the window size changes
$(window).on('orientationchange resize', function(){
	var width = $('.tourwrap').width(); //declare width
	var height = $('.tourwrap').height(); //declare height
	
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
	raycaster.setFromCamera( mouse, camera );
	renderer.clear();
    renderer.setSize( width, height );
    labelRenderer.setSize( width, height );
	controls.update();
});

//this function executes after the init function
function afterinit() {
	//maak alle orbs buiten als eerste zichtbaar
	for (var i = 0; i < orbs.length; i++) {
		
		if(orbs[i].userData.afdeling === 'buiten') {
			orbs[i].visible = pulses[i].visible = labels[i].visible = true;
		}
		
        var str = orbs[i].callback.name;
        str = str.replace(/_/g, ' ');
        $('.label'+i).text(str);
		
	}
}

function animate() {
    requestAnimationFrame( animate );
	
	//Animeer pulse bij orbs
	var pulsespeed = 0.01;
	function pulseit() {
		for (i = 0; i < pulses.length; i++) {
			if (pulses[i].scale.x >= 0 && pulses[i].scale.x < 1.5) {
				pulses[i].scale.x += pulsespeed;
				pulses[i].scale.y += pulsespeed;
				pulses[i].scale.z += pulsespeed;
				pulses[i].material.opacity -= (0.05*pulsespeed);
			} else if(pulses[i].scale.x >= 1.5 ) {
				pulses[i].scale.x = 0.5;
				pulses[i].scale.y = 0.5;
				pulses[i].scale.z = 0.5;
				pulses[i].material.opacity = 1;
			}
		}
	}pulseit();

	renderer.clear();
    controls.update();
    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
}	
