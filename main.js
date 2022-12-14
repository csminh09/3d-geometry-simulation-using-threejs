let object, style, camera, light, plane, controls, material, color, loader, id, idCam
let size = 20
let pos = size + 20
let flag = true
let CamFlag = true

const scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer({ antialias: true })
let gui = new dat.GUI();
gui.domElement.id = 'gui'
loader = new THREE.TextureLoader()

dat.GUI.prototype.removeFolder = function(name) {
  var folder = this.__folders[name]
  if (!folder) {
    return
  }
  folder.close()
  this.__ul.removeChild(folder.domElement.parentNode)
  delete this.__folders[name]
  this.onResize()
}

function init () {

	var enableFog = true
	const constants = {
		side: {
			'THREE.FrontSide': THREE.FrontSide,
			'THREE.BackSide': THREE.BackSide,
			'THREE.DoubleSide': THREE.DoubleSide
		},
	}

	// Init helper
	// var helper = new THREE.CameraHelper(directionalLight.shadow.camera)

	// scene.add(helper)

	// ---------------- Camera ----------------------------
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth/window.innerHeight,
		1,
		1000
	)

	camera.position.x = 250;
	camera.position.y = 250;
	camera.position.z = 100;

	camera.lookAt(new THREE.Vector3(0, 0, 0))


	// -------------- Callback -------------------------

	renderer.shadowMap.enabled = true
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.setClearColor("rgb(120, 120, 120)")
	document.getElementById("webgl").appendChild(renderer.domElement)
	renderer.render(scene, camera)

	controls = new THREE.OrbitControls(camera, renderer.domElement)

	update(renderer, scene, camera, controls)

	// Init plane
	addPlane()
}

function addObjectEvent(option){
	if (object) {
        scene.remove(object)
        object.geometry.dispose()
        object.material.dispose()
    }
    if (style) {
        scene.remove(style)
        style.geometry.dispose()
        style.material.dispose()
    }
    if (light) {
        material = 'standard'
    }
    else {
        material = 'basic'
    }
    color = 'rgb(92, 133, 214)'
	let objectMaterial = getMaterial(material, color)
	objectMaterial.name = material
	object = getObject(option, 30, objectMaterial)
	object.name = option
	scene.add(object)
	update(renderer, scene, camera, controls)
}

function addPlane(){
	if (plane) {
        scene.remove(plane)
        plane.geometry.dispose()
        plane.material.dispose()
    }
    if (light) {
        material = 'standard'
    }
    else {
        material = 'basic'
    }
    let planeMaterial = getMaterial2(material, 'rgb(153, 153, 153)')
	plane = getPlane(planeMaterial, 500)
	plane.name = 'plane'

	plane.rotation.x = Math.PI/2
	plane.position.y = -10

	scene.add(plane)
	update(renderer, scene, camera, controls)
}

function addStyleEvent(opt){
	if (style) {
        scene.remove(style)
        style.geometry.dispose()
        style.material.dispose()
    }
    if (opt == 'solid') {
    	scene.add(object)
    }
    else {
    	if (object) {
        	scene.remove(object)
    	}
		style = getStyleObject(opt, size, object)
		scene.add(style)
    }
	update(renderer, scene, camera, controls)
}

function addLightEvent(opt) {
	if (light) {
        scene.remove(light)
		light.dispose()
		RemoveLight()
    }

	light = getLight(opt, 1.2)
	
	let lightGeo = new THREE.SphereGeometry(2, 24, 24)
	let lightMat = new THREE.MeshBasicMaterial({
		color: "rgb(255, 255, 255)"
	})
	let lightShape = new THREE.Mesh(lightGeo, lightMat)

	light.add(lightShape)
	scene.add(light)

	light.position.x = 50
	light.position.y = 70
	light.position.z = 25

	Guilight(light)

	addPlane()

	if (style) {
		addObjectEvent(object.name)
		addStyleEvent(style.name)
    }
    else if (object) {
    	addObjectEvent(object.name)
    }

	update(renderer, scene, camera, controls)
}

function addAnimation(option){
	getAnimation(option)
}

function RemoveLight(){
    if (light) {
        scene.remove(light)
        light = undefined
    }
	addPlane()

	if (style) {
		addObjectEvent(object.name)
		addStyleEvent(style.name)
    }
    else if (object) {
    	addObjectEvent(object.name)
    }

    gui.removeFolder('light')

    update(renderer, scene, camera, controls)
}

// -------------- Get object --------------------
function getObject(type, size, material) {
	var geometry
	var segmentMultiplier = 1
	switch (type) {
		case 'box':
			geometry = new THREE.BoxGeometry(size, size, size)
			break
		case 'sphere':
			geometry = new THREE.SphereGeometry(size, 32*segmentMultiplier, 32*segmentMultiplier)
			break
		case 'cone':
			geometry = new THREE.ConeGeometry(size, size, 256*segmentMultiplier)
			break;
		case 'cylinder':
			geometry = new THREE.CylinderGeometry(size, size, 3*size)
			break
		case 'wheel':
			geometry = new THREE.TorusGeometry( size*2/3, size/3, size*2/3, 6*size )
			if (material.name == 'basic') {
				material.map = loader.load('/assets/textures/wheel.jpg')
			}
			else {
				material.roughnessMap = loader.load('/assets/textures/wheel.jpg')
				material.roughness = 1
				material.metalness = 0
			}
			break
		case 'teapot':
			geometry = new THREE.TeapotGeometry(size*2/3, 10)
			break
		default:
			break
	}
	var obj = new THREE.Mesh(geometry, material)
	obj.castShadow = true
	obj.name = type
	obj.position.set(0,pos,0)
	return obj
}

function getStyleObject(type, size, obj) {
	let geo, mat, styleObj

	switch (type) {
		case 'point':
			geo = obj.geometry
			mat = new THREE.PointsMaterial( { color: color, size: 2 } )
			styleObj = new THREE.Points( geo, mat )
			break
		case 'line':
			geo = new THREE.WireframeGeometry( obj.geometry )
			mat = new THREE.LineBasicMaterial( { color: color} )
			styleObj = new THREE.Line( geo, mat )
			styleObj.renderOrder = 1 // make sure wireframes are rendered 2nd
			break
		case "dash":
			geo = box( 20, 20, 20 )
			mat = new THREE.LineDashedMaterial( { color: "black" , dashSize: 1, gapSize: 0.5} )
			styleObj = new THREE.Line( geo, mat )
			styleObj.computeLineDistances()
		default:
			break
	}
	styleObj.name = type
	styleObj.castShadow = true
	styleObj.position.set(0,pos,0)
	return styleObj
}

function getBorder(object){
	var geo = new THREE.WireframeGeometry( object.geometry )
	var mat = new THREE.LineBasicMaterial( { color: "black", linewidth: 20 } )
	var wireframe = new THREE.LineSegments( geo, mat )
	wireframe.renderOrder = 1 // make sure wireframes are rendered 2nd
	return wireframe
}

function getLight(type, intensity) {
	
	switch (type) {
		case 'point':
			light = new THREE.PointLight(0xffffff, intensity)
			break
		case 'directional':
			light = new THREE.DirectionalLight(0xffffff, intensity)
			break
		case 'spotlight':
			light = new THREE.SpotLight(0xffffff, intensity)
			break
		case 'remove':
			light = RemoveLight()
			return
	}
    light.castShadow = true
    return light
}

function getMaterial(type, color){
	var selectedMaterial;
	var materialOptions = {
		color: color == undefined ? 'rgb(255, 255, 255)': color
	}
	switch(type) {
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions)
			break
		case 'lambert':
			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions)
			break
		case 'phong':
			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions)
			break
		case 'standard':
			selectedMaterial = new THREE.MeshStandardMaterial(materialOptions)
			break
		case 'line':
			selectedMaterial = new THREE.LineBasicMaterial(materialOptions)
			break
		default:
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions)

	}

	return selectedMaterial
}

function getMaterial2(type, color){
	var selectedMaterial;
	var materialOptions = {
		color: color == undefined ? 'rgb(255, 255, 255)': color,
		side: THREE.DoubleSide
	}
	switch(type) {
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions)
			break
		case 'lambert':
			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions)
			break
		case 'phong':
			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions)
			break
		case 'standard':
			selectedMaterial = new THREE.MeshStandardMaterial(materialOptions)
			break
	}

	return selectedMaterial
}

function getPlane(material, size){
	var geometry = new THREE.PlaneGeometry(size, size)
	var mesh = new THREE.Mesh(geometry, material)
	mesh.receiveShadow = true

	return mesh
}

function getAnimation(opt){
	var ani
	switch (opt) {
		case 'animation1':
			ani = animation1()
			break
		case 'drop':
			// cameraAnimation()
			animatationDrop()
			camDropAnimation()
			break
		case 'remove':
			stopAnimation(id)
			stopAnimation(idCam)
		default:
			break
	}
}

function animatationDrop() {
	if (style){
		dropObject(style)
	}
    else{
    	dropObject(style)
    }

    id = requestAnimationFrame(function () {
		animatationDrop()
	})

    renderer.render(scene, camera)
}

let start = Date.now()

function animation1(){
	id = requestAnimationFrame (animation1);
	var step = 1
	if (style){
		if(object.name !== 'sphere' ){
			style.rotation.x += Math.PI/300;
			style.rotation.y += Math.PI/300;
			style.rotation.z += Math.PI/300;
			}

		if(object.name == 'sphere'){
			const timer = Date.now() - start;
			style.position.y = Math.abs( Math.sin( timer * 0.002 ) ) * 150;
			style.rotation.x = timer * 0.0003;
			style.rotation.z = timer * 0.0002;
		}
	}
	else {
		if(object.name !== 'sphere' ){
			object.rotation.x += Math.PI/300;
			object.rotation.y += Math.PI/300;
			object.rotation.z += Math.PI/300;
			}

		if(object.name == 'sphere'){
			const timer = Date.now() - start;
			object.position.y = Math.abs( Math.sin( timer * 0.002 ) ) * 150;
			object.rotation.x = timer * 0.0003;
			object.rotation.z = timer * 0.0002;
		}
	}
	renderer.render( scene, camera );

}


function camDropAnimation(){
	if (style || object){
		camDrop()
	}
    else{
    	return
    }
	idCam = requestAnimationFrame(function () {
		camDropAnimation()
	})

    renderer.render(scene, camera)
}

function stopAnimation(AnimationID){
	cancelAnimationFrame( AnimationID )
}

function cameraAnimation(){
	var cameraZRotation = new THREE.Group()
	var cameraYPosition = new THREE.Group()
	var cameraZPosition = new THREE.Group()
	var cameraXRotation = new THREE.Group()
	var cameraYRotation = new THREE.Group()

	cameraZRotation.name = 'cameraZRotation'
	cameraYPosition.name = 'cameraYPosition'
	cameraZPosition.name = 'cameraZPosition'
	cameraXRotation.name = 'cameraXRotation'
	cameraYRotation.name = 'cameraYRotation'

	cameraZRotation.add(camera)
	cameraYPosition.add(cameraZRotation)
	cameraZPosition.add(cameraYPosition)
	cameraXRotation.add(cameraZPosition)
	cameraYRotation.add(cameraXRotation)
	scene.add(cameraYRotation)
	scene.remove(camera)
}

function dropObject(obj){
	let SPEED = 0.02
	if (!style){
		if (object.position.y >= pos) {
			flag = true
		}
		if (object.position.y <= -pos) {
			flag = false
		}
		if (flag){
        	object.position.y -= SPEED * size
		}
		else{
			object.position.y += SPEED * size
		}
	}
	else {
		if (style.position.y >= pos) {
			flag = true
		}
		if (style.position.y <= -pos) {
			flag = false
		}
		if (flag){
        	style.position.y -= SPEED * size
		}
		else{
			style.position.y += SPEED * size
		}
	}
}

function camDrop() {
	let SPEED = 0.2
	var cameraYPosition = scene.getObjectByName('cameraYPosition')
	if (style) {
		if (style.position.y >= 0){
			CamFlag = true
		}
		if (style.position.y <= 0 ){
			CamFlag = false
		}
	}
	else {
		if (object.position.y >= 0){
			CamFlag = true
		}
		if (object.position.y <= 0 ){
			CamFlag = false
		}
	}

	if (CamFlag){
        camera.position.y -= SPEED * size
	}
	else{
		camera.position.y += SPEED * size
	}
}

let controlObject = {
    posX: 0,
    posY: pos,
    posZ: 0,

    rotX: 0,
    rotY: 0,
    rotZ: 0,

    scaX: 1,
    scaY: 1,
    scaZ: 1,
}

function setControlObj() {
    let affineTransform = gui.addFolder('Affine transform');
    affineTransform.add(controlObject, 'posX', -50, 50).name('position x').onChange(function () {
        if (object) {
            object.position.x = controlObject.posX
        }
		if (style) {
            style.position.set(0, size, 0)
            style.position.x = controlObject.posX
        }
    });
    affineTransform.add(controlObject, 'posY', -50, 50).name('position y').onChange(function () {
        if (object) {
            object.position.y = controlObject.posY
        }
		if (style) {
            style.position.y = controlObject.posY
        }

    });
    affineTransform.add(controlObject, 'posZ', -50, 50).name('position z').onChange(function () {
        if (object) {
            object.position.z = controlObject.posZ
        }
		if (style) {
            style.position.z = controlObject.posZ
        }

    });
    affineTransform.add(controlObject, 'rotX', 0, 20).name('rotate x').onChange(function () {
        if (object) {
            object.rotation.x = controlObject.rotX;
        }
		if (style) {
            style.rotation.x = controlObject.rotX;
        }

    });
    affineTransform.add(controlObject, 'rotY', 0, 20).name('rotate y').onChange(function () {
        if (object) {
            object.rotation.y = controlObject.rotY;
        }
		if (style) {
            style.rotation.y = controlObject.rotY;
        }
 
    });
    affineTransform.add(controlObject, 'rotZ', 0, 20).name('rotate z').onChange(function () {
        if (object) {
            object.rotation.z = controlObject.rotZ;
        }
		if (style) {
            style.rotation.z = controlObject.rotZ;
        }
 
    });
    affineTransform.add(controlObject, 'scaX', 1, 20).name('scale x').onChange(function () {
        if (object) {
            object.scale.x = controlObject.scaX
        }
		if (style) {
            style.scale.x = controlObject.scaX
        }

    });
    affineTransform.add(controlObject, 'scaY', 1, 20).name('scale y').onChange(function () {
        if (object) {
            object.scale.y = controlObject.scaY
        }
		if (style) {
            style.scale.y = controlObject.scaY
        }
 
    });
    affineTransform.add(controlObject, 'scaZ', 1, 20).name('scale z').onChange(function () {
        if (object) {
            object.scale.z = controlObject.scaZ
        }
		if (style) {
            object.scale.z = controlObject.scaZ
        }

    });
}

// -------------- GUI ---------------
function guiScene( gui, scene ) {

	const folder = gui.addFolder( 'Scene' );
	if (light) {
		const data = {
		background: '#000000',
		'ambient light': light.color.getHex()
		}

	folder.addColor( data, 'ambient light' ).onChange( handleColorChange( light.color ) );
	}

	guiSceneFog( folder, scene );

}

function guiSceneFog( folder, scene ) {

	const fogFolder = folder.addFolder( 'scene.fog' );

	const fog = new THREE.Fog( 0x3f7b9d, 0, 60 );

	const data = {
		fog: {
			'THREE.Fog()': false,
			'scene.fog.color': fog.color.getHex()
		}
	};

	fogFolder.add( data.fog, 'THREE.Fog()' ).onChange( function ( useFog ) {

		if ( useFog ) {

			scene.fog = fog;

		} else {

			scene.fog = null;

		}

	} );

	fogFolder.addColor( data.fog, 'scene.fog.color' ).onChange( handleColorChange( fog.color ) );

}

function Guilight(light)
{	
	let folder = gui.addFolder('light');

	folder.add(light,'intensity',0,10);
	folder.add(light.position,'x',-50,50);
	folder.add(light.position,'y',20,120);
	folder.add(light.position,'z',-50,50);
}

function guiMaterial( gui, mesh, material, geometry ) {

	const folder = gui.addFolder( 'THREE.Material' );

	folder.add( material, 'transparent' );
	folder.add( material, 'opacity', 0, 1 ).step( 0.01 );
	folder.add( material, 'alphaTest', 0, 1 ).step( 0.01 ).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'visible' );
	folder.add( material, 'side', constants.side ).onChange( needsUpdate( material, geometry ) );

}

function guiMeshStandardMaterial( gui, mesh, material, geometry ) {

	const data = {
		color: material.color.getHex(),
		emissive: material.emissive.getHex(),
		envMaps: envMapKeys[ 0 ],
		map: diffuseMapKeys[ 0 ],
		roughnessMap: roughnessMapKeys[ 0 ],
		alphaMap: alphaMapKeys[ 0 ]
	};

	const folder = gui.addFolder( 'THREE.MeshStandardMaterial' );

	folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
	folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );

	folder.add( material, 'roughness', 0, 1 );
	folder.add( material, 'metalness', 0, 1 );
	folder.add( material, 'flatShading' ).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'wireframe' );
	folder.add( material, 'vertexColors' ).onChange( needsUpdate( material, geometry ) );
	folder.add( material, 'fog' );
	folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
	folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
	folder.add( data, 'roughnessMap', roughnessMapKeys ).onChange( updateTexture( material, 'roughnessMap', roughnessMaps ) );
	folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

	// TODO metalnessMap

}


// -------------- Transformation ------------




// -------------- Texture --------------





// ------------- Animation -----------------


// ------------- Event ----------------------
function handleColorChange( color ) {

	return function ( value ) {

		if ( typeof value === 'string' ) {

			value = value.replace( '#', '0x' );

		}

		color.setHex( value );

	};
}

function needsUpdate( material, geometry ) {

	return function () {

		material.vertexColors = material.vertexColors;
		material.side = parseInt( material.side ); //Ensure number
		material.needsUpdate = true;
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.normal.needsUpdate = true;
		geometry.attributes.color.needsUpdate = true;

	};
}

function update(renderer, scene, camera, controls) {
	renderer.render(scene, camera)

	controls.update()

	requestAnimationFrame(function () {
		update(renderer, scene, camera, controls)
	})
}

guiScene(gui, scene)

let opt
let objectOption = document.querySelectorAll('.object-option')
let lightOption = document.querySelectorAll('.light-option')
let styleOption = document.querySelectorAll('.style-option')
let animationOption = document.querySelectorAll('.animation-option')

function clickEvent() {
    objectOption.forEach(option =>
    {
        option.onclick = () =>
        {
            opt = option.innerText.toLowerCase()
            addObjectEvent(opt)
        }
    })

    lightOption.forEach(option =>
    {
        option.onclick = () =>
        {
            opt = option.innerText.toLowerCase()
            addLightEvent(opt)
        }
    })

    styleOption.forEach(option =>
    {
        option.onclick = () =>
        {
            opt = option.innerText.toLowerCase()
            addStyleEvent(opt)
        }
    })

    animationOption.forEach(option =>
    {
        option.onclick = () =>
        {
            opt = option.innerText.toLowerCase()
            addAnimation(opt)
        }
    })
}
init()
setControlObj()
clickEvent()