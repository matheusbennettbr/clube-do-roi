// Rei de xadrez em 3D real (WebGL) — geometria de revolução, material físico e luz de estúdio.
import * as THREE from './three.module.min.js';

const host = document.getElementById('chess3d');
if (host && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  init(host);
}

function init(host) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return; // sem WebGL: fica o poster
  }
  if (!renderer.getContext()) return;

  const W = () => host.clientWidth;
  const H = () => host.clientHeight;

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H(), false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
  camera.position.set(0, 2.1, 8.5);
  camera.lookAt(0, 1.86, 0);

  // ---------- ambiente (reflexos) ----------
  const envScene = new THREE.Scene();
  const panel = (color, intensity, x, y, z, sx, sy) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(sx, sy),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    envScene.add(m);
  };
  envScene.background = new THREE.Color(0x070b1a);
  panel(0xfff1e0, 3.4, -6, 7, 5, 12, 12);   // softbox principal
  panel(0xd08c5e, 2.6, 7, 3, -6, 12, 14);   // rim cobre
  panel(0x2a4b9e, 1.6, 0, -4, 8, 14, 10);   // bounce azul do "piso"
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  // ---------- luzes ----------
  const key = new THREE.DirectionalLight(0xfff0dd, 2.4);
  key.position.set(-4.2, 7.5, 5.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 7; key.shadow.camera.bottom = -2;
  key.shadow.bias = -0.0015;
  key.shadow.radius = 3;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xe09a62, 5.2);
  rim.position.set(5.8, 4.2, -2.6);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0x7f9ae0, 1.4);
  fill.position.set(5, 1.5, 6);
  scene.add(fill);

  scene.add(new THREE.HemisphereLight(0x33508f, 0x05070f, 0.5));

  // ---------- material ----------
  const marble = new THREE.MeshPhysicalMaterial({
    color: 0xece2d4,
    roughness: 0.2,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.14,
    sheen: 0.55,
    sheenColor: new THREE.Color(0xe9b68e),
    envMapIntensity: 1.7,
  });

  // ---------- perfil do rei (x = raio, y = altura) ----------
  const P = [
    [0.00, 0.00], [1.00, 0.00], [1.03, 0.07], [1.00, 0.15], [0.90, 0.21],
    [0.80, 0.27], [0.76, 0.35], [0.68, 0.43], [0.57, 0.54], [0.47, 0.70],
    [0.39, 0.92], [0.34, 1.16], [0.31, 1.40], [0.30, 1.60], [0.32, 1.77],
    [0.37, 1.89], [0.51, 1.97], [0.55, 2.05], [0.49, 2.13], [0.37, 2.19],
    [0.34, 2.30], [0.41, 2.42], [0.53, 2.57], [0.61, 2.73], [0.63, 2.87],
    [0.60, 2.95], [0.52, 2.99], [0.40, 3.02], [0.26, 3.04], [0.12, 3.05],
    [0.00, 3.06],
  ].map(([x, y]) => new THREE.Vector2(x, y));

  const piece = new THREE.Group();

  const body = new THREE.Mesh(new THREE.LatheGeometry(P, 160), marble);
  body.castShadow = true;
  body.receiveShadow = true;
  piece.add(body);

  // bulbo entre a coroa e a cruz
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.19, 48, 32), marble);
  knob.position.y = 3.14;
  knob.scale.y = 0.82;
  knob.castShadow = true;
  piece.add(knob);

  // cruz do topo
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.72, 0.15), marble);
  crossV.position.y = 3.58;
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.15, 0.15), marble);
  crossH.position.y = 3.66;
  [crossV, crossH].forEach((m) => { m.castShadow = true; piece.add(m); });

  scene.add(piece);

  // sombra de contato
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.ShadowMaterial({ opacity: 0.42 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // reflexo no "piso"
  const mirror = new THREE.Mesh(body.geometry, marble.clone());
  mirror.material.transparent = true;
  mirror.material.opacity = 0.14;
  mirror.material.depthWrite = false;
  mirror.scale.y = -1;
  piece.add(mirror);

  // ---------- interação e loop ----------
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  addEventListener('pointermove', (e) => {
    targetX = (e.clientX / innerWidth - 0.5) * 0.5;
    targetY = (e.clientY / innerHeight - 0.5) * 0.22;
  }, { passive: true });

  let spin = 0.45;
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    spin += dt * 0.34;
    pointerX += (targetX - pointerX) * 0.05;
    pointerY += (targetY - pointerY) * 0.05;
    piece.rotation.y = spin + pointerX;
    piece.rotation.x = pointerY * 0.5;
    piece.position.y = Math.sin(spin * 0.9) * 0.05;
    renderer.render(scene, camera);
  });

  const resize = () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H(), false);
  };
  addEventListener('resize', resize, { passive: true });

  host.classList.add('on');
}
