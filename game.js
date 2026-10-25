import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const socket = io();
const root = document.getElementById('game');
const connection = document.getElementById('connection');
const startScreen = document.getElementById('startScreen');
const playBtn = document.getElementById('playBtn');
const playerCount = document.getElementById('playerCount');
const fragCount = document.getElementById('fragCount');
const toast = document.getElementById('toast');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 38, 105);
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, .1, 180);
camera.position.set(0, 5, 9);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9ddfff, 0x202238, 2));
const sun = new THREE.DirectionalLight(0xfff2d7, 3.2);
sun.position.set(-18, 35, 14); sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat = (color, roughness=.8, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const floorMat = mat(0x111e2d);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100,100),floorMat);
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
const grid = new THREE.GridHelper(100,50,0x2a8d9a,0x20364b);
grid.position.y=.015; scene.add(grid);

const boundaryMat = new THREE.MeshStandardMaterial({color:0x50f4e2,emissive:0x0c6e72,emissiveIntensity:1.3});
for(let i=0;i<4;i++){
 const wall=new THREE.Mesh(new THREE.BoxGeometry(i%2?90:.12,1.5,i%2?.12:90),boundaryMat);
 wall.position.set(0,.75,0); // subtle glowing arena perimeter
 if(i===0) wall.position.z=-45; if(i===1) wall.position.x=45; if(i===2) wall.position.z=45; if(i===3) wall.position.x=-45;
 scene.add(wall);
}
function box(w,h,d,x,y,z,material,shadow=true){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;scene.add(m);return m;
}
// Modular sci-fi cover, crates and illuminated pylons.
const crateMats=[mat(0x273a50),mat(0x35485d),mat(0x1d3444)];
for(let i=0;i<27;i++){
 const x=(Math.random()-.5)*76,z=(Math.random()-.5)*76;
 if(Math.abs(x)<9&&Math.abs(z)<9)continue;
 const size=1.4+Math.random()*2.4;
 box(size,size*(.7+Math.random()*.8),size,x,size*.35,z,crateMats[i%3]);
 if(i%3===0){
   const strip=box(size*.9,.045,.055,x,size*.55,z+size*.51,mat(0x50daca,.3,.2),false);
   strip.material.emissive.setHex(0x146e69);
 }
}
for(let i=0;i<14;i++){
 const a=i/14*Math.PI*2, x=Math.cos(a)*36,z=Math.sin(a)*36;
 const p=new THREE.Mesh(new THREE.CylinderGeometry(.16,.28,3.5,8),mat(0x263f55,.45,.3));
 p.position.set(x,1.75,z);p.castShadow=true;scene.add(p);
 const light=new THREE.PointLight(0x50f4e2,1.8,8);light.position.set(x,3.2,z);scene.add(light);
}

const players = new Map();
let myId=null, playing=false, signals=0, yaw=0, pitch=-.12;
const keys={};
const raycaster=new THREE.Raycaster();
const clock=new THREE.Clock();
const local={
 x:0,z:0,vY:0,onGround:true,
};
function makeAvatar(id,data){
 const group=new THREE.Group();
 const color=new THREE.Color(data.color||'#43e8d8');
 const bodyMat=mat(color, .52, .12), dark=mat(0x172436), visorMat=new THREE.MeshStandardMaterial({color:0xaafbf3,emissive:0x124a50,metalness:.4,roughness:.22});
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.7,4,8),bodyMat);torso.position.y=1.2;torso.castShadow=true;group.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.28,12,10),mat(0xd8c8b5));head.position.y=1.95;head.castShadow=true;group.add(head);
 const visor=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.12),visorMat);visor.position.set(0,2,.22);group.add(visor);
 const pack=new THREE.Mesh(new THREE.BoxGeometry(.48,.58,.2),dark);pack.position.set(0,1.32,-.37);group.add(pack);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.6,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.3}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=.04;group.add(shadow);
 scene.add(group);
 const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=64;
 const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#07101dcc';ctx.fillRect(10,9,236,46);ctx.strokeStyle=data.color||'#43e8d8';ctx.strokeRect(10,9,236,46);
 ctx.fillStyle='#ffffff';ctx.font='bold 25px Arial';ctx.textAlign='center';ctx.fillText(data.name||'Jugador',128,39);
 const texture=new THREE.CanvasTexture(labelCanvas);
 const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true}));
 label.scale.set(2.7,.68,1);label.position.y=2.65;group.add(label);
 return {group, id, health:data.health??100, targetX:data.x||0,targetZ:data.z||0,targetYaw:data.yaw||0,bodyMat, label};
}
function ensurePlayer(id,data){
 if(!players.has(id))players.set(id,makeAvatar(id,data));
 const p=players.get(id);
 p.targetX=data.x??p.targetX;p.targetZ=data.z??p.targetZ;p.targetYaw=data.yaw??p.targetYaw;
 p.health=data.health??p.health;
 if(p.label && data.name){ /* label is refreshed on state update only if name changed */ }
 return p;
}
function showToast(text){
 toast.textContent=text;toast.style.opacity='1';
 clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.style.opacity='.35',2200);
}
function makePing(x,z){
 const ring = new THREE.Mesh(
   new THREE.TorusGeometry(.28,.055,8,24),
   new THREE.MeshBasicMaterial({color:0x8ffff2, transparent:true, opacity:.95})
 );
 ring.rotation.x = Math.PI/2;
 ring.position.set(x,.12,z);
 scene.add(ring);
 let age=0;
 function pulse(){
   age += .04;
   ring.scale.setScalar(1 + age*5);
   ring.material.opacity = Math.max(0, 1-age);
   if(age<1){requestAnimationFrame(pulse)}else{scene.remove(ring);ring.geometry.dispose();ring.material.dispose();}
 }
 pulse();
}
function updateCamera(){
 const target=new THREE.Vector3(local.x,1.5,local.z);
 const distance=6.8;
 const offset=new THREE.Vector3(-Math.sin(yaw)*distance,2.6+pitch*3,-Math.cos(yaw)*distance);
 camera.position.lerp(target.clone().add(offset),.16);
 camera.lookAt(target.clone().add(new THREE.Vector3(Math.sin(yaw)*2,.15+pitch*2,Math.cos(yaw)*2)));
}
function sendPing(){
 if(!playing||!myId)return;
 socket.emit('ping');
 makePing(local.x,local.z);
}
playBtn.addEventListener('click',()=>{
 socket.emit('name',document.getElementById('playerName').value);
 startScreen.classList.add('hidden');playing=true;
 renderer.domElement.requestPointerLock?.();
 showToast('¡A explorar! Haz clic para enviar una señal.');
});
document.addEventListener('pointerlockchange',()=>{
 if(document.pointerLockElement!==renderer.domElement&&playing)showToast('Haz clic en el juego para volver a apuntar.');
});
document.addEventListener('mousemove',e=>{
 if(document.pointerLockElement===renderer.domElement&&playing){
   yaw-=e.movementX*.0025;pitch=Math.max(-.5,Math.min(.35,pitch-e.movementY*.0018));
 }
});
document.addEventListener('keydown',e=>{
 keys[e.code]=true;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(e.code==='Space'&&playing&&local.onGround){local.vY=7;local.onGround=false;}
 if(e.code==='Escape')showToast('Ratón liberado');
});
document.addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('mousedown',e=>{
 if(e.button===0&&playing){
   if(document.pointerLockElement!==renderer.domElement){renderer.domElement.requestPointerLock?.();return;}
   sendPing();
 }
});
renderer.domElement.addEventListener('click',()=>{
 if(playing&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.();
});

socket.on('connect',()=>{connection.textContent='SERVIDOR CONECTADO';connection.style.color='#50f4e2';});
socket.on('disconnect',()=>{connection.textContent='SIN CONEXIÓN';connection.style.color='#ff6b6b';});
socket.on('welcome',data=>{
 myId=data.id;
 Object.entries(data.players).forEach(([id,p])=>ensurePlayer(id,p));
});
socket.on('joined',p=>{ensurePlayer(p.id,p);showToast(`${p.name} ha entrado en la nebulosa`);});
socket.on('left',id=>{if(players.has(id)){scene.remove(players.get(id).group);players.delete(id);}});
socket.on('ping',e=>{if(e.id!==myId)makePing(e.x,e.z);if(e.id===myId){signals=e.count;fragCount.textContent='SEÑALES: '+signals;showToast('¡Señal enviada!');}});
socket.on('state',state=>{
 Object.entries(state).forEach(([id,p])=>ensurePlayer(id,p));
 for(const id of players.keys())if(!state[id]){scene.remove(players.get(id).group);players.delete(id);}
 playerCount.textContent=Object.keys(state).length;
});

function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 if(playing){
   const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
   const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
   const len=Math.hypot(forward,side)||1;
   const speed=keys.ShiftLeft?10:7;
   local.x+=((Math.sin(yaw)*forward+Math.cos(yaw)*side)/len)*speed*dt;
   local.z+=((Math.cos(yaw)*forward-Math.sin(yaw)*side)/len)*speed*dt;
   local.x=THREE.MathUtils.clamp(local.x,-42,42);local.z=THREE.MathUtils.clamp(local.z,-42,42);
   if(!local.onGround){local.vY-=18*dt;local.jumpY=(local.jumpY||0)+local.vY*dt;if(local.jumpY<=0){local.jumpY=0;local.vY=0;local.onGround=true;}}
   socket.emit('move',{x:local.x,z:local.z,yaw});
 }
 for(const [id,p] of players){
   if(id===myId){
     p.group.position.set(local.x,local.jumpY||0,local.z);
     p.group.rotation.y=yaw;
   }else{
     p.group.position.x=THREE.MathUtils.lerp(p.group.position.x,p.targetX,.22);
     p.group.position.z=THREE.MathUtils.lerp(p.group.position.z,p.targetZ,.22);
     p.group.rotation.y=THREE.MathUtils.lerp(p.group.rotation.y,p.targetYaw,.22);
   }
   p.group.visible=true;
 }
 updateCamera();
 renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);
});
