import * as THREE from 'three';
import * as YUKA from 'yuka';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0xA3A3A3);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 0);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

const entityManager = new YUKA.EntityManager();

const pursuerGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
pursuerGeometry.rotateX(Math.PI * 0.5);
const pursuerMaterial = new THREE.MeshNormalMaterial();
const pursuerMesh = new THREE.Mesh(pursuerGeometry, pursuerMaterial);
pursuerMesh.matrixAutoUpdate = false;
scene.add(pursuerMesh);

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const pursuer = new YUKA.Vehicle();
pursuer.setRenderComponent(pursuerMesh, sync);
entityManager.add(pursuer);
pursuer.position.set(-2, 0, -3);
pursuer.maxSpeed = 2;

const evaderGeometry = new THREE.SphereBufferGeometry(0.1);
const evaderMaterial = new THREE.MeshPhongMaterial({color: 0xFFEA00});
const evaderMesh = new THREE.Mesh(evaderGeometry, evaderMaterial);
evaderMesh.matrixAutoUpdate = false;
scene.add(evaderMesh);

const evader = new YUKA.Vehicle();
evader.setRenderComponent(evaderMesh, sync);
entityManager.add(evader);
evader.position.set(2, 0, -3);
evader.maxSpeed = 2;

const pursuitBehavior = new YUKA.PursuitBehavior(evader, 5);
pursuer.steering.add(pursuitBehavior);

const evaderTarget = new YUKA.Vector3();
const seekBehavior = new YUKA.SeekBehavior(evaderTarget);
evader.steering.add(seekBehavior);

const time = new YUKA.Time();

function animate() {
    const delta = time.update().getDelta();
    entityManager.update(delta);

    const elapsed = time.getElapsed();
    evaderTarget.x = Math.cos(elapsed) * Math.sin(elapsed * 0.2) * 6;
    evaderTarget.z = Math.sin(elapsed * 0.8) * 6;

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});