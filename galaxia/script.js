let scene, camera, renderer, controls;
let galaxyParticles, coreHeart;

const startBtn = document.getElementById('heart-btn');
const startScreen = document.getElementById('start-screen');
const headerTitle = document.getElementById('header-title');
const bgMusic = document.getElementById('background-music');

// Evento al tocar para entrar (activa música y la escena)
startBtn.addEventListener('click', () => {
    if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(error => console.log("Error al reproducir audio:", error));
    }

    startScreen.style.opacity = '0';
    setTimeout(() => {
        startScreen.classList.add('hidden');
        headerTitle.classList.remove('hidden');
        init3D();
        animate();
    }, 1000);
});

// Frases cortas motivadoras flotantes
const frasesMotivadoras = [
    "Nunca dejes de soñar",
    "Eres capaz de todo",
    "Sigue brillando",
    "Confía en tu proceso",
    "El universo está a tu favor",
    "Cree en ti",
    "Haz que suceda",
    "Tu luz es única",
    "Un día a la vez",
    "Lo mejor está por venir",
    "Sé tu propia inspiración",
    "Sigue adelante"
];

function init3D() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05000a, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 25, 35);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 10;

    // Crear la galaxia, corazón, frases y personajes
    createGalaxy();
    createCenterHeart();
    createFloatingTexts(); // <--- Muestra las frases motivadoras
    createCharacterSprites();

    window.addEventListener('resize', onWindowResize);
}

// Generación de partículas
function createGalaxy() {
    const particleCount = 20000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorInside = new THREE.Color('#ff007f');
    const colorOutside = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * 20;
        const spinAngle = radius * 4;
        const branchAngle = ((i % 3) * 2 * Math.PI) / 3;

        const randomX = (Math.random() - 0.5) * 1.5;
        const randomY = (Math.random() - 0.5) * 1.5;
        const randomZ = (Math.random() - 0.5) * 1.5;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorInside.clone().lerp(colorOutside, radius / 20);
        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    galaxyParticles = new THREE.Points(geometry, material);
    scene.add(galaxyParticles);
}

// Corazón central
function createCenterHeart() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x, y, x, y - 0.25);
    shape.bezierCurveTo(x, y - 0.5, x - 0.5, y - 0.5, x - 0.5, y - 0.25);
    shape.bezierCurveTo(x - 0.5, y, x - 0.25, y + 0.25, x + 0.25, y + 0.6);
    shape.bezierCurveTo(x + 0.73, y + 0.25, x + 1, y, x + 1, y - 0.25);
    shape.bezierCurveTo(x + 1, y - 0.5, x + 0.5, y - 0.5, x + 0.5, y - 0.25);

    const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });
    coreHeart = new THREE.Mesh(geometry, material);
    coreHeart.scale.set(3, 3, 3);
    coreHeart.rotation.x = Math.PI;
    scene.add(coreHeart);
}

// Genera el texto 3D flotante para cada frase motivadora
function createFloatingTexts() {
    frasesMotivadoras.forEach((text, i) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 64;

        ctx.font = 'Bold 20px Arial';
        ctx.fillStyle = '#f3e59b';
        ctx.shadowColor = '#b59eaa';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(text, 150, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);

        const angle = (i / frasesMotivadoras.length) * Math.PI * 2;
        const radius = 6 + Math.random() * 10;
        sprite.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius);
        sprite.scale.set(7, 1.5, 1);

        scene.add(sprite);
    });
}

// Personajes
function createCharacterSprites() {
    const textureLoader = new THREE.TextureLoader();

    const personajes = [
        { url: './go.png', escala: [3.5, 4.5] },
        { url: 'pngwing.com.png', escala: [3.5, 3.5] },
        { url: 'Ligh.png', escala: [3.5, 4.5] },
        { url: 'soldier.png', escala: [4.5, 3.5] },
        { url: 'oli.png', escala: [3.5, 3.5] },
        { url: 'f.png', escala: [3.5, 3.5] },
        { url: 'fs.png', escala: [3.5, 3.5] },
        { url: 'k.png', escala: [3.5, 3.5] },
        { url: 'nicol.png', escala: [3.5, 3.5] }
    ];

    personajes.forEach((pj, index) => {
        textureLoader.load(pj.url, (texture) => {
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true,
                depthWrite: false 
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            const angle = (index / personajes.length) * Math.PI * 2 + Math.random() * 0.5;
            const radius = 8 + Math.random() * 9;

            sprite.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 4,
                Math.sin(angle) * radius
            );

            sprite.scale.set(pj.escala[0], pj.escala[1], 1);
            scene.add(sprite);
        });
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (galaxyParticles) galaxyParticles.rotation.y += 0.0015;
    if (coreHeart) {
        coreHeart.rotation.y += 0.01;
        coreHeart.scale.x = 3 + Math.sin(Date.now() * 0.003) * 0.2;
        coreHeart.scale.y = 3 + Math.sin(Date.now() * 0.003) * 0.2;
    }

    controls.update();
    renderer.render(scene, camera);
}