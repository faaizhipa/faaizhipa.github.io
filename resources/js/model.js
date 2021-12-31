let scene, camera, renderer;
let modelDiv = document.getElementById("canco-model");

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 5000);
    camera.rotation.y = 45/180*Math.PI;
    camera.position.x = 800;
    camera.position.y = 100;
    camera.position.z = 1000;


    hlight = new THREE.AmbientLight (0x404040, 100);
    scene.add(hlight);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    modelDiv.appendChild(renderer.domElement);

    let loader = new THREE.GLTFLoader();
    loader.load("../gltf/canco.gltf", function(gltf) {
        canco = gltf.scene.children[0];
        canco.scale.set(0.5, 0.5, 0.5);
        scene.add(gltf.scene);
        renderer.render(scene, camera);
    });
}

init();