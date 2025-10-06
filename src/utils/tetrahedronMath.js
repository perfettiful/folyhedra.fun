import * as THREE from 'three'

// Tetrahedron vertices (scaled)
export const V = [
  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(-1, -1, 1),
].map(v => v.multiplyScalar(0.6))

// Edges: (01),(02),(03),(12),(13),(23)
export const E = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
export const E_INDEX = new Map(E.map((e,i)=>[e.join(','), i]))

// Faces (omit one vertex each)
export const FACES = []
for (let miss = 0; miss < 4; miss++) {
  const vs = [0,1,2,3].filter(v => v !== miss)
  const es = []
  for (let i=0;i<vs.length;i++) for (let j=i+1;j<vs.length;j++){
    const a = Math.min(vs[i],vs[j]), b = Math.max(vs[i],vs[j])
    es.push(E_INDEX.get(`${a},${b}`))
  }
  FACES.push(new Set(es)) // size 3
}

// Adjacency (for connectivity)
export const ADJ = Array.from({length:4}, ()=>[])
E.forEach(([a,b], ei)=>{
  ADJ[a].push([b, ei])
  ADJ[b].push([a, ei])
})

// A4 rotations as even permutations on vertices -> edge perms
function isEvenPerm(p) {
  let inv=0
  for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) if (p[i]>p[j]) inv++
  return (inv % 2) === 0
}

function permute(arr){
  if (arr.length===0) return [[]]
  const out=[]
  function rec(a, m=[]){
    if (a.length===0) out.push(m)
    else for(let i=0;i<a.length;i++){
      const aa=a.slice(), x=aa.splice(i,1)
      rec(aa, m.concat(x))
    }
  }
  rec(arr.slice())
  return out
}

const A4 = []
for (const p of permute([0,1,2,3])) if (isEvenPerm(p)) A4.push(p)

function edgePermFromVertexPerm(p){
  const m = new Array(6)
  for (let ei=0; ei<6; ei++){
    let [a,b] = E[ei]
    const a2 = p[a], b2 = p[b]
    const u = Math.min(a2,b2), v = Math.max(a2,b2)
    m[ei] = E_INDEX.get(`${u},${v}`)
  }
  return m
}

export const ROT_EDGE_PERMS = [...new Set(A4.map(p => edgePermFromVertexPerm(p).join(',')))]
  .map(s => s.split(',').map(Number)) // 12

// Bitmask helpers
export function rotateMask(mask, perm){
  let out=0
  for(let i=0;i<6;i++){
    if ((mask>>i)&1) out |= (1<<perm[i])
  }
  return out
}

export function canonical(mask){
  let min = Infinity
  for (const p of ROT_EDGE_PERMS){
    const m = rotateMask(mask, p)
    if (m < min) min = m
  }
  return min
}

export function isConnected(mask){
  const used = new Set()
  for (let ei=0; ei<6; ei++){
    if ((mask>>ei)&1){
      used.add(E[ei][0]); used.add(E[ei][1])
    }
  }
  if (used.size===0) return false
  const arr=[...used]
  const q=[arr[0]]
  const seen=new Set([arr[0]])
  while(q.length){
    const u=q.shift()
    for (const [v, ei] of ADJ[u]){
      if (((mask>>ei)&1) && !seen.has(v)){
        seen.add(v); q.push(v)
      }
    }
  }
  return seen.size===used.size
}

export function hasFullFace(mask){
  for (const f of FACES){
    let ok=true
    for (const e of f){
      if (!((mask>>e)&1)) { ok=false; break }
    }
    if (ok) return true
  }
  return false
}

export function generateMasks(mode, rotationUnique){
  const full = (1<<6)-1
  const raw = []
  for (let m=1; m<full; m++){ // exclude empty and full
    if (mode==='connected' || mode==='connected_noface'){
      if (!isConnected(m)) continue
    }
    if (mode==='connected_noface'){
      if (hasFullFace(m)) continue
    }
    raw.push(m)
  }
  if (!rotationUnique) return raw

  const reps = new Set()
  for (const m of raw) reps.add(canonical(m))
  return [...reps]
}

export function countBits(m){ 
  let c=0; 
  while(m){ c+=m&1; m>>=1; } 
  return c; 
}

export function vertexDegrees(mask){
  const deg = [0,0,0,0]
  for (let ei=0; ei<6; ei++){
    if ((mask>>ei)&1){
      const [a,b] = E[ei]
      deg[a]++; deg[b]++
    }
  }
  return deg.sort((a,b)=>b-a) // multiset, descending
}

export function labelFor(userData){
  const d = userData.degrees.join(',')
  const k = userData.edgeCount
  if (k===1) return 'K₂ (single edge)'
  if (k===2){
    // connected only case is P3
    return 'P₃ (two adjacent edges)'
  }
  if (k===3){
    if (d==='3,1,1,1') return 'K₁,₃ (star)'
    if (userData.hasFace) return 'Triangle (face)'
    if (d==='2,2,1,1') return 'P₄ (3-edge path)'
    return 'Other 3-edge'
  }
  if (k===4){
    if (!userData.hasFace && d==='2,2,2,2') return 'C₄ (4-cycle)'
    if (userData.hasFace) return 'Triangle + edge'
  }
  if (k===5) return 'K₄−e (contains faces)'
  return `Edges=${k}`
}
