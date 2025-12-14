
# platonic_counts.py
# Compute canonical edge-subset counts (rotations only) for all 5 Platonic solids:
#   - All Combinations
#   - All Connected (on used vertices)
#   - Valid Incomplete (connected and no full triangular face)
#
# Usage: python platonic_counts.py
#
# Requirements: Python 3.x, numpy, (optional) pandas for pretty table

import itertools, math, numpy as np, time

def normalize(v):
    v = np.array(v, dtype=float)
    n = np.linalg.norm(v)
    return v if n==0 else v/n

def rot_axis_angle(axis, theta):
    axis = normalize(axis)
    x,y,z = axis
    c = math.cos(theta); s = math.sin(theta); C = 1-c
    return np.array([
        [c + x*x*C,   x*y*C - z*s, x*z*C + y*s],
        [y*x*C + z*s, c + y*y*C,   y*z*C - x*s],
        [z*x*C - y*s, z*y*C + x*s, c + z*z*C]
    ], dtype=float)

def is_rot(R):
    return np.allclose(R.T@R, np.eye(3), atol=1e-8) and np.isclose(np.linalg.det(R),1.0,atol=1e-8)

def nearest_index(p, V, tol=1e-5):
    for i,v in enumerate(V):
        if np.linalg.norm(p-v) < tol: return i
    return None

def dedup_perms(perms):
    seen = set(); out=[]
    for p in perms:
        t = tuple(p)
        if t not in seen:
            seen.add(t); out.append(list(p))
    return out

def edge_perm(edge_list, vperm):
    idx = {tuple(sorted(e)):i for i,e in enumerate(edge_list)}
    out=[]
    for a,b in edge_list:
        a2,b2 = vperm[a], vperm[b]
        out.append(idx[tuple(sorted((a2,b2)))])
    return out

def cycles_of_perm(perm):
    n=len(perm); seen=[False]*n; cyc=[]
    for i in range(n):
        if not seen[i]:
            j=i; cur=[]
            while not seen[j]:
                seen[j]=True; cur.append(j); j=perm[j]
            cyc.append(cur)
    return cyc

def connected_on_used(nV, subset_edges):
    used = sorted(set([u for e in subset_edges for u in e]))
    if not used: return True
    idmap={v:i for i,v in enumerate(used)}
    g=[set() for _ in used]
    for a,b in subset_edges:
        ia,ib=idmap[a],idmap[b]
        g[ia].add(ib); g[ib].add(ia)
    seen={0}; stack=[0]
    while stack:
        u=stack.pop()
        for w in g[u]:
            if w not in seen: seen.add(w); stack.append(w)
    return len(seen)==len(used)

def contains_triangle(subset_edges, tri_faces):
    E=set(tuple(sorted(e)) for e in subset_edges)
    for a,b,c in tri_faces:
        if (tuple(sorted((a,b))) in E and
            tuple(sorted((b,c))) in E and
            tuple(sorted((c,a))) in E):
            return True
    return False

def burnside_counts(V, E, edge_perms, tri_faces, solid_name=""):
    nV=len(V); mE=len(E)
    idx={tuple(sorted(e)):i for i,e in enumerate(E)}
    cycsets_per_perm = []
    
    print(f"Computing cycles for {solid_name}...")
    for i, perm in enumerate(edge_perms):
        if i % 10 == 0:
            print(f"  Processing permutation {i+1}/{len(edge_perms)}")
        cyc = cycles_of_perm(perm)
        cycsets=[set(E[i] for i in c) for c in cyc]
        cycsets_per_perm.append(cycsets)

    print(f"Computing subset counts for {solid_name}...")
    tot_all=0; tot_conn=0; tot_valid=0
    for perm_idx, cycsets in enumerate(cycsets_per_perm):
        if perm_idx % 10 == 0:
            print(f"  Processing permutation {perm_idx+1}/{len(cycsets_per_perm)}")
        c=len(cycsets)
        tot_all += 2**c
        # enumerate unions of cycles (2^c per perm)
        conn=0; valid=0
        total_subsets = 1<<c
        for mask in range(total_subsets):
            if mask % 1000000 == 0 and mask > 0:
                print(f"    Subset {mask}/{total_subsets}")
            subset=set()
            for i in range(c):
                if (mask>>i)&1:
                    subset |= cycsets[i]
            subset_edges=sorted(subset)
            if connected_on_used(nV, subset_edges):
                conn += 1
                if not contains_triangle(subset_edges, tri_faces):
                    valid += 1
        tot_conn += conn
        tot_valid+= valid
    G=len(edge_perms)
    print(f"Completed {solid_name}!")
    return tot_all//G, tot_conn//G, tot_valid//G

# ----- Geometry for solids -----
phi = (1 + 5**0.5)/2

# Tetrahedron
TetV = np.array([normalize(v) for v in [
    ( 1, 1, 1), (-1,-1, 1), (-1, 1,-1), ( 1,-1,-1)
]], dtype=float)
TetE = sorted(tuple(sorted(e)) for e in itertools.combinations(range(4),2))
TetF_tri = [(0,1,2),(0,1,3),(0,2,3),(1,2,3)]

# Cube
CubV = np.array([normalize(v) for v in itertools.product([-1,1], repeat=3)], dtype=float)
CubE = []
for i in range(8):
    for j in range(i+1,8):
        if np.sum(np.abs(CubV[i]-CubV[j])>1e-6)==1:
            CubE.append((i,j))
CubE=sorted(CubE)
# Use triangular splits of square faces for frames (not for triangle filter)
CubF_tri = []
faces_quads=[
  (7,5,1,3),(6,4,0,2),(7,5,4,6),(3,1,0,2),(5,1,0,4),(7,3,2,6)
]
for a,b,c,d in faces_quads:
    CubF_tri += [(a,b,c),(a,c,d)]

# Octahedron
OctV = np.array([normalize(v) for v in [
    (1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)
]], dtype=float)
OctE=[]
for i in range(6):
    for j in range(i+1,6):
        if np.isclose(np.dot(OctV[i], OctV[j]), 0.0, atol=1e-9):
            OctE.append((i,j))
OctE=sorted(OctE)
OctF_tri=[
    (0,2,4),(0,2,5),(0,3,4),(0,3,5),
    (1,2,4),(1,2,5),(1,3,4),(1,3,5)
]

# Icosahedron
IcoV = np.array([normalize(v) for v in [
    (0, -1, -phi),
    (0, -1,  phi),
    (0,  1, -phi),
    (0,  1,  phi),
    (-1, -phi, 0),
    (-1,  phi, 0),
    ( 1, -phi, 0),
    ( 1,  phi, 0),
    (-phi, 0, -1),
    ( phi, 0, -1),
    (-phi, 0,  1),
    ( phi, 0,  1),
]], dtype=float)
# Edges = minimal distance pairs
def edges_from_vertices(vertices):
    V=np.array(vertices)
    n=len(V)
    dists=[]
    for i in range(n):
        for j in range(i+1,n):
            d=np.linalg.norm(V[i]-V[j])
            dists.append((d,i,j))
    dists.sort()
    edges=set()
    min_d=dists[0][0]
    for d,i,j in dists:
        if abs(d-min_d)<1e-6:
            edges.add((i,j))
        else:
            break
    return sorted(tuple(sorted(e)) for e in edges)

IcoE = edges_from_vertices(IcoV)
# Triangles = any triple of mutually adjacent vertices
Eset=set(tuple(sorted(e)) for e in IcoE)
IcoF_tri=sorted({tuple(sorted(f)) for f in itertools.combinations(range(12),3)
                 if tuple(sorted((f[0],f[1]))) in Eset and
                    tuple(sorted((f[1],f[2]))) in Eset and
                    tuple(sorted((f[2],f[0]))) in Eset})

# Dodecahedron (dual of icosahedron): vertices = face centers of Icosa
DodV = []
for a,b,c in IcoF_tri:
    center = normalize((IcoV[a]+IcoV[b]+IcoV[c])/3.0)
    DodV.append(center)
# dedup
def unique_rows(a, tol=1e-8):
    out=[]
    for r in a:
        if not any(np.allclose(r, q, atol=tol) for q in out):
            out.append(r)
    return np.array(out)
DodV = unique_rows(np.array(DodV))
DodE = edges_from_vertices(DodV)
DodF_tri = []

# ----- Rotation groups via generators (each solid) -----
def rotation_group_from_generators(V, gens_expected):
    # close the group from generator rotation matrices; return vertex perms
    V=np.array(V); n=len(V)
    def vperm_from_R(R):
        perm=[None]*n
        for i in range(n):
            j=nearest_index(R@V[i], V, tol=1e-5)
            if j is None: return None
            perm[i]=j
        return tuple(perm)

    # Close group
    mats=[np.eye(3)]
    perms=[tuple(range(n))]
    def add(R):
        # normalize by rounding for stability
        # project to nearest proper rotation via SVD not needed for exact axes here
        p=vperm_from_R(R)
        if p is None: return False
        if p in perms: return False
        perms.append(p); mats.append(R)
        return True

    frontier=[np.eye(3)]
    gens = gens_expected  # supplied list of generator matrices
    while frontier:
        new_frontier=[]
        for A in frontier:
            for G in gens:
                for R in (G@A, A@G):
                    if add(R):
                        new_frontier.append(R)
        frontier=new_frontier

    return perms

# Build generators for each solid
def tetra_generators(V):
    # pick vertex 0 and opposite face centroid for 120-deg axis
    face = [1,2,3]
    axis = normalize(V[0] + 0*V[0])  # through vertex 0 and origin (regular tetra around origin)
    R120 = rot_axis_angle(axis, 2*math.pi/3)
    # 180 around midpoint-axis of edge (0,1)-(2,3) midpoints
    m1 = normalize((V[0]+V[1])/2)
    m2 = normalize((V[2]+V[3])/2)
    axis2 = normalize(m1 - m2)  # direction through midpoints; any collinear direction works
    R180 = rot_axis_angle(axis2, math.pi)
    return [R120, R180]

def cube_generators(V):
    # 90° about z-axis
    Rz90 = rot_axis_angle(np.array([0,0,1]), math.pi/2)
    # 120° about body diagonal (1,1,1)
    Rbd120 = rot_axis_angle(normalize(np.array([1,1,1])), 2*math.pi/3)
    return [Rz90, Rbd120]

def octa_generators(V):
    # 90° about z-axis (same as cube)
    Rz90 = rot_axis_angle(np.array([0,0,1]), math.pi/2)
    # 120° about axis through vertex (0,0,1) and opposite face center: vector roughly z-axis again,
    # but we choose a different 120°: about axis (1,1,1)
    Rbd120 = rot_axis_angle(normalize(np.array([1,1,1])), 2*math.pi/3)
    return [Rz90, Rbd120]

def icosa_generators(V):
    # Generator 1: 72° rotation about vertex axis (5-fold symmetry)
    axis_v = normalize(V[0])
    R72 = rot_axis_angle(axis_v, 2*math.pi/5)
    
    # Generator 2: 120° rotation about face center axis (3-fold symmetry)
    # Use a known face center direction for icosahedron
    face_center = normalize(np.array([phi, 1, 0]))  # Known face center direction
    R120 = rot_axis_angle(face_center, 2*math.pi/3)
    
    # Generator 3: 180° rotation about edge midpoint (2-fold symmetry)
    edge_mid = normalize(np.array([0, phi, 1]))  # Known edge midpoint direction
    R180 = rot_axis_angle(edge_mid, math.pi)
    
    return [R72, R120, R180]

def dodeca_generators(V):
    # Generator 1: 72° rotation about vertex axis (5-fold symmetry)
    axis_v = normalize(V[0])
    R72 = rot_axis_angle(axis_v, 2*math.pi/5)
    
    # Generator 2: 120° rotation about face center axis (3-fold symmetry)
    # Use a known face center direction for dodecahedron
    face_center = normalize(np.array([1, phi, 0]))  # Known face center direction
    R120 = rot_axis_angle(face_center, 2*math.pi/3)
    
    # Generator 3: 180° rotation about edge midpoint (2-fold symmetry)
    edge_mid = normalize(np.array([phi, 0, 1]))  # Known edge midpoint direction
    R180 = rot_axis_angle(edge_mid, math.pi)
    
    return [R72, R120, R180]

# Build vertex perms (rotation groups)
Tet_perms = rotation_group_from_generators(TetV, tetra_generators(TetV))
Cub_perms = rotation_group_from_generators(CubV, cube_generators(CubV))
Oct_perms = rotation_group_from_generators(OctV, octa_generators(OctV))

# For icosahedron and dodecahedron, use brute force approach
def brute_force_rotations(V, max_rotations=120):
    """Find rotations by trying many axis-angle combinations"""
    n = len(V)
    perms = [tuple(range(n))]  # identity
    
    def vperm_from_R(R):
        perm = [None] * n
        for i in range(n):
            j = nearest_index(R @ V[i], V, tol=1e-5)
            if j is None: return None
            perm[i] = j
        return tuple(perm)
    
    # Try rotations around various axes
    axes_to_try = []
    # Vertex directions
    for v in V:
        axes_to_try.append(normalize(v))
    # Edge midpoints
    for i in range(n):
        for j in range(i+1, n):
            if np.linalg.norm(V[i] - V[j]) < 2.5:  # likely edge
                axes_to_try.append(normalize((V[i] + V[j])/2))
    # Face centers (approximate)
    for i in range(n):
        for j in range(i+1, n):
            for k in range(j+1, n):
                if (np.linalg.norm(V[i] - V[j]) < 2.5 and 
                    np.linalg.norm(V[j] - V[k]) < 2.5 and
                    np.linalg.norm(V[k] - V[i]) < 2.5):
                    axes_to_try.append(normalize((V[i] + V[j] + V[k])/3))
    
    # Try common angles
    angles = [math.pi/6, math.pi/3, math.pi/2, 2*math.pi/3, math.pi, 4*math.pi/3, 3*math.pi/2, 5*math.pi/3, 2*math.pi/5, 4*math.pi/5]
    
    for axis in axes_to_try:
        for angle in angles:
            if len(perms) >= max_rotations:
                break
            R = rot_axis_angle(axis, angle)
            p = vperm_from_R(R)
            if p is not None and p not in perms:
                perms.append(p)
        if len(perms) >= max_rotations:
            break
    
    return perms

Ico_perms = brute_force_rotations(IcoV, 60)
Dod_perms = brute_force_rotations(DodV, 60)

print(f"Tetrahedron perms: {len(Tet_perms)} (expected 12)")
print(f"Cube perms: {len(Cub_perms)} (expected 24)")
print(f"Octahedron perms: {len(Oct_perms)} (expected 24)")
print(f"Icosahedron perms: {len(Ico_perms)} (expected 60)")
print(f"Dodecahedron perms: {len(Dod_perms)} (expected 60)")

assert len(Tet_perms)==12
assert len(Cub_perms)==24
assert len(Oct_perms)==24
assert len(Ico_perms)==60
assert len(Dod_perms)==60

# Edge permutations
def edge_perms_from_vperms(E, vperms):
    idx = {tuple(sorted(e)):i for i,e in enumerate(E)}
    out=[]
    for p in vperms:
        out.append([idx[tuple(sorted((p[a],p[b])))] for a,b in E])
    return out

TetE_perms = edge_perms_from_vperms(TetE, Tet_perms)
CubE_perms = edge_perms_from_vperms(CubE, Cub_perms)
OctE_perms = edge_perms_from_vperms(OctE, Oct_perms)
IcoE_perms = edge_perms_from_vperms(IcoE, Ico_perms)
DodE_perms = edge_perms_from_vperms(DodE, Dod_perms)

# Compute Burnside counts
def counts_for(name, V,E,eperms,tri):
    print(f"\n=== Starting {name} at {time.strftime('%H:%M:%S')} ===")
    start_time = time.time()
    allc, conn, valid = burnside_counts(V,E,eperms,tri, name)
    elapsed = time.time() - start_time
    print(f"=== Completed {name} in {elapsed:.1f} seconds ===")
    return {
        "V": len(V), "E": len(E), "G": len(eperms),
        "Faces have triangles?": ("Yes" if len(tri)>0 else "No"),
        "All Combinations": allc,
        "All Connected": conn,
        "Valid Incomplete": valid
    }

results = {
    "Tetrahedron":  counts_for("Tetrahedron", TetV, TetE, TetE_perms, TetF_tri),
    "Cube":         counts_for("Cube",        CubV, CubE, CubE_perms, []),
    "Octahedron":   counts_for("Octahedron",  OctV, OctE, OctE_perms, OctF_tri),
    "Dodecahedron": counts_for("Dodecahedron",DodV, DodE, DodE_perms, []),
    "Icosahedron":  counts_for("Icosahedron", IcoV, IcoE, IcoE_perms, IcoF_tri),
}

try:
    import pandas as pd
    df = pd.DataFrame.from_dict(results, orient='index')[
        ["V","E","G","Faces have triangles?","All Combinations","All Connected","Valid Incomplete"]
    ].rename_axis("Platonic Solid").reset_index()
    print(df.to_string(index=False))
except Exception as e:
    print("Results:")
    for k,v in results.items():
        print(k, v)
