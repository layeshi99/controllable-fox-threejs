import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const gltfLoader = new GLTFLoader()
let fox = null
let mixer = null
let action = null
let walkAction = null
let currentAction = null

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)
        
        action = mixer.clipAction(gltf.animations[0])
        walkAction = mixer.clipAction(gltf.animations[1])
        
        action.play()
        currentAction = action

        fox = gltf.scene
        fox.scale.set(0.025, 0.025, 0.025)
        scene.add(fox)
    }
)

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 15),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//camera
const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//key movements
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
}

const updateCurrentAction = () => {
    if (keys.forward || keys.backward || keys.left || keys.right) {
        if (currentAction !== walkAction) {
            currentAction.stop()
            walkAction.play()
            currentAction = walkAction
        }
    } else {
        if (currentAction !== action) {
            currentAction.stop()
            action.play()
            currentAction = action
        }
    }
}

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.forward = true
            break
        case 'ArrowDown':
            keys.backward = true
            break
        case 'ArrowLeft':
            keys.left = true
            break
        case 'ArrowRight':
            keys.right = true
            break
    }
    updateCurrentAction()
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.forward = false
            break
        case 'ArrowDown':
            keys.backward = false
            break
        case 'ArrowLeft':
            keys.left = false
            break
        case 'ArrowRight':
            keys.right = false
            break
    }
    updateCurrentAction()
})

const moveSpeed = 0.1

const updateFoxPosition = () => {
    if (fox) {
        if (keys.forward) {
            fox.position.z -= moveSpeed
            fox.rotation.y = Math.PI 
        }
        if (keys.backward) {
            fox.position.z += moveSpeed
            fox.rotation.y = 0 
        }
        if (keys.left) {
            fox.position.x -= moveSpeed
            fox.rotation.y = Math.PI / 2 
        }
        if (keys.right) {
            fox.position.x += moveSpeed
            fox.rotation.y = -Math.PI / 2
        }
    }
}

const animate = () => {
    requestAnimationFrame(animate)
    updateFoxPosition()

    renderer.render(scene, camera)
}

// Animate
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update mixer
    if (mixer !== null) {
        mixer.update(deltaTime)
    }

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
animate()
