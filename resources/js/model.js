let scene, camera, renderer, canco;
let modelDiv = document.getElementById("canco-model");

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 5000);
    camera.rotation.y = 10/180*Math.PI;
    camera.position.x = 4;
    camera.position.y = 6;
    camera.position.z = 25;

    hlight = new THREE.AmbientLight (0x060606, 60);
    scene.add(hlight);

    directionalLight = new THREE.DirectionalLight(0x040301, 65);
    directionalLight.position.set(0,1,0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    light1 = new THREE.PointLight(0x040302, 60);
    light1.position.set(0, 300, 500);
    scene.add(light1);

    light2 = new THREE.PointLight(0x050202, 50);
    light2.position.set(590, 100, 0);
    scene.add(light2);

    light3 = new THREE.PointLight(0x020201, 40);
    light3.position.set(0, 100, -500);
    scene.add(light3);

    light4 = new THREE.PointLight(0x020201, 35);
    light4.position.set(-500, 300, 0);
    scene.add(light4);
    
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    modelDiv.appendChild(renderer.domElement);

    let loader = new THREE.GLTFLoader();
    loader.load("./resources/gltf/canco.gltf", function(gltf) {
        canco = gltf.scene.children[0];
        canco.scale.set(0.6, 0.6, 0.6);
        scene.add(gltf.scene);
    });
}

function animate() {
    requestAnimationFrame(animate);
    canco.rotation.y += 0.0065;
    renderer.render(scene, camera);
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();