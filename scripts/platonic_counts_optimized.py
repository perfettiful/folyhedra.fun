#!/usr/bin/env python3
"""
Optimized Platonic Solids Edge Subset Counter
============================================

High-performance implementation using:
- Multiprocessing parallelization
- NumPy vectorization
- Precomputed connectivity matrices
- Early termination strategies
- Memory-efficient algorithms

Usage: python platonic_counts_optimized.py [--workers N] [--solids tetra,cube,octa,ico,dod]
"""

import itertools
import math
import numpy as np
import time
from multiprocessing import Pool, cpu_count
from functools import partial
import argparse
from typing import List, Tuple, Set, Dict, Any

def normalize(v):
    """Normalize vector to unit length."""
    v = np.array(v, dtype=float)
    n = np.linalg.norm(v)
    return v if n == 0 else v / n

def rot_axis_angle(axis, theta):
    """Create rotation matrix around axis by angle theta."""
    axis = normalize(axis)
    x, y, z = axis
    c = math.cos(theta)
    s = math.sin(theta)
    C = 1 - c
    return np.array([
        [c + x*x*C,   x*y*C - z*s, x*z*C + y*s],
        [y*x*C + z*s, c + y*y*C,   y*z*C - x*s],
        [z*x*C - y*s, z*y*C + x*s, c + z*z*C]
    ], dtype=float)

def nearest_index(p, V, tol=1e-5):
    """Find nearest vertex index to point p."""
    distances = np.linalg.norm(V - p, axis=1)
    min_idx = np.argmin(distances)
    return min_idx if distances[min_idx] < tol else None

def cycles_of_perm(perm):
    """Find cycle decomposition of permutation."""
    n = len(perm)
    seen = [False] * n
    cycles = []
    for i in range(n):
        if not seen[i]:
            j = i
            cycle = []
            while not seen[j]:
                seen[j] = True
                cycle.append(j)
                j = perm[j]
            if len(cycle) > 1:  # Only non-trivial cycles
                cycles.append(cycle)
    return cycles

class ConnectivityChecker:
    """Optimized connectivity checking using precomputed adjacency matrices."""
    
    def __init__(self, vertices, edges):
        self.nV = len(vertices)
        self.edges = edges
        self.nE = len(edges)
        
        # Precompute adjacency matrix
        self.adj_matrix = np.zeros((self.nV, self.nV), dtype=bool)
        self.edge_to_vertices = {}
        
        for i, (a, b) in enumerate(edges):
            self.adj_matrix[a, b] = True
            self.adj_matrix[b, a] = True
            self.edge_to_vertices[i] = (a, b)
    
    def get_used_vertices(self, edge_indices):
        """Get vertices used by given edges."""
        if not edge_indices:
            return np.array([], dtype=int)
        
        vertices = set()
        for ei in edge_indices:
            a, b = self.edge_to_vertices[ei]
            vertices.add(a)
            vertices.add(b)
        return np.array(sorted(vertices))
    
    def is_connected_vectorized(self, edge_indices_list):
        """Vectorized connectivity check for multiple edge sets."""
        results = []
        for edge_indices in edge_indices_list:
            if not edge_indices:
                results.append(True)  # Empty set is connected
                continue
                
            used_vertices = self.get_used_vertices(edge_indices)
            if len(used_vertices) <= 1:
                results.append(True)
                continue
            
            # Build subgraph adjacency matrix
            sub_adj = np.zeros((len(used_vertices), len(used_vertices)), dtype=bool)
            vertex_map = {v: i for i, v in enumerate(used_vertices)}
            
            for ei in edge_indices:
                a, b = self.edge_to_vertices[ei]
                if a in vertex_map and b in vertex_map:
                    ia, ib = vertex_map[a], vertex_map[b]
                    sub_adj[ia, ib] = True
                    sub_adj[ib, ia] = True
            
            # BFS connectivity check
            visited = np.zeros(len(used_vertices), dtype=bool)
            queue = [0]
            visited[0] = True
            
            while queue:
                current = queue.pop(0)
                neighbors = np.where(sub_adj[current])[0]
                for neighbor in neighbors:
                    if not visited[neighbor]:
                        visited[neighbor] = True
                        queue.append(neighbor)
            
            results.append(np.all(visited))
        
        return results

class TriangleChecker:
    """Optimized triangle detection using precomputed triangle sets."""
    
    def __init__(self, edges, triangular_faces):
        self.edges = edges
        self.triangular_faces = triangular_faces
        
        # Precompute edge sets for each triangle
        edge_to_idx = {tuple(sorted(e)): i for i, e in enumerate(edges)}
        self.triangle_edge_sets = []
        
        for a, b, c in triangular_faces:
            triangle_edges = []
            for edge_pair in [(a, b), (b, c), (c, a)]:
                edge_key = tuple(sorted(edge_pair))
                if edge_key in edge_to_idx:
                    triangle_edges.append(edge_to_idx[edge_key])
            if len(triangle_edges) == 3:
                self.triangle_edge_sets.append(set(triangle_edges))
    
    def contains_triangle_vectorized(self, edge_indices_list):
        """Vectorized triangle detection for multiple edge sets."""
        results = []
        for edge_indices in edge_indices_list:
            edge_set = set(edge_indices)
            has_triangle = any(triangle_edges.issubset(edge_set) 
                             for triangle_edges in self.triangle_edge_sets)
            results.append(has_triangle)
        return results

def process_permutation_chunk(args):
    """Process a chunk of permutations for parallel computation."""
    cycsets_chunk, vertices, edges, triangular_faces, chunk_id = args
    
    # Recreate checkers in worker process (avoid pickling issues)
    connectivity_checker = ConnectivityChecker(vertices, edges)
    triangle_checker = TriangleChecker(edges, triangular_faces)
    
    chunk_all = 0
    chunk_conn = 0
    chunk_valid = 0
    
    print(f"  Chunk {chunk_id}: Processing {len(cycsets_chunk)} permutations...")
    
    for perm_idx, cycsets in enumerate(cycsets_chunk):
        if perm_idx % 10 == 0 and perm_idx > 0:
            print(f"    Chunk {chunk_id}: {perm_idx}/{len(cycsets_chunk)} permutations")
        
        c = len(cycsets)
        chunk_all += 2**c
        
        # Early termination for very large cycle counts
        if c > 20:  # 2^20 = ~1M subsets, still manageable
            print(f"    Chunk {chunk_id}: Skipping permutation with {c} cycles (too large)")
            continue
        
        # Generate all subset combinations efficiently
        total_subsets = 1 << c
        
        # Batch process subsets for vectorization
        batch_size = min(1000, total_subsets)
        
        for batch_start in range(0, total_subsets, batch_size):
            batch_end = min(batch_start + batch_size, total_subsets)
            
            # Generate batch of edge index lists
            edge_indices_batch = []
            for mask in range(batch_start, batch_end):
                subset_edges = set()
                for i in range(c):
                    if (mask >> i) & 1:
                        subset_edges.update(cycsets[i])
                edge_indices_batch.append(sorted(subset_edges))
            
            # Vectorized connectivity check
            connectivity_results = connectivity_checker.is_connected_vectorized(edge_indices_batch)
            
            # Count connected subsets
            connected_indices = [i for i, connected in enumerate(connectivity_results) if connected]
            chunk_conn += len(connected_indices)
            
            if triangle_checker.triangle_edge_sets:  # Only if triangles exist
                # Vectorized triangle check for connected subsets only
                connected_edge_lists = [edge_indices_batch[i] for i in connected_indices]
                triangle_results = triangle_checker.contains_triangle_vectorized(connected_edge_lists)
                
                # Count valid (connected, no triangles) subsets
                valid_count = sum(1 for has_triangle in triangle_results if not has_triangle)
                chunk_valid += valid_count
            else:
                # No triangles to check, all connected are valid
                chunk_valid += len(connected_indices)
    
    print(f"  Chunk {chunk_id}: Completed!")
    return chunk_all, chunk_conn, chunk_valid

def burnside_counts_optimized(V, E, edge_perms, tri_faces, solid_name="", num_workers=None):
    """Optimized Burnside counting with parallelization and vectorization."""
    print(f"Computing optimized Burnside counts for {solid_name}...")
    
    if num_workers is None:
        num_workers = min(cpu_count(), len(edge_perms))
    
    # Precompute cycle decompositions
    print(f"  Computing {len(edge_perms)} cycle decompositions...")
    cycsets_per_perm = []
    for i, perm in enumerate(edge_perms):
        if i % 20 == 0:
            print(f"    Cycles: {i+1}/{len(edge_perms)}")
        
        cycles = cycles_of_perm(perm)
        cycsets = [set(cycle) for cycle in cycles]  # Keep as edge indices, not edge tuples
        cycsets_per_perm.append(cycsets)
    
    # Split permutations into chunks for parallel processing
    chunk_size = max(1, len(cycsets_per_perm) // num_workers)
    chunks = []
    for i in range(0, len(cycsets_per_perm), chunk_size):
        chunk = cycsets_per_perm[i:i + chunk_size]
        chunks.append((chunk, V, E, tri_faces, len(chunks)))
    
    print(f"  Processing {len(chunks)} chunks with {num_workers} workers...")
    
    # Parallel processing
    if num_workers > 1:
        with Pool(num_workers) as pool:
            results = pool.map(process_permutation_chunk, chunks)
    else:
        results = [process_permutation_chunk(chunk) for chunk in chunks]
    
    # Aggregate results
    total_all = sum(r[0] for r in results)
    total_conn = sum(r[1] for r in results)
    total_valid = sum(r[2] for r in results)
    
    G = len(edge_perms)
    print(f"  Completed {solid_name}!")
    
    return total_all // G, total_conn // G, total_valid // G

# Geometry definitions (same as original but organized)
def get_platonic_solid_data():
    """Get geometric data for all Platonic solids."""
    phi = (1 + 5**0.5) / 2
    
    # Tetrahedron
    tet_vertices = np.array([normalize(v) for v in [
        (1, 1, 1), (-1, -1, 1), (-1, 1, -1), (1, -1, -1)
    ]], dtype=float)
    tet_edges = sorted(tuple(sorted(e)) for e in itertools.combinations(range(4), 2))
    tet_triangles = [(0, 1, 2), (0, 1, 3), (0, 2, 3), (1, 2, 3)]
    
    # Cube
    cube_vertices = np.array([normalize(v) for v in itertools.product([-1, 1], repeat=3)], dtype=float)
    cube_edges = []
    for i in range(8):
        for j in range(i + 1, 8):
            if np.sum(np.abs(cube_vertices[i] - cube_vertices[j]) > 1e-6) == 1:
                cube_edges.append((i, j))
    cube_edges = sorted(cube_edges)
    cube_triangles = []  # Cube has no triangular faces
    
    # Octahedron
    oct_vertices = np.array([normalize(v) for v in [
        (1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)
    ]], dtype=float)
    oct_edges = []
    for i in range(6):
        for j in range(i + 1, 6):
            if np.isclose(np.dot(oct_vertices[i], oct_vertices[j]), 0.0, atol=1e-9):
                oct_edges.append((i, j))
    oct_edges = sorted(oct_edges)
    oct_triangles = [
        (0, 2, 4), (0, 2, 5), (0, 3, 4), (0, 3, 5),
        (1, 2, 4), (1, 2, 5), (1, 3, 4), (1, 3, 5)
    ]
    
    # Icosahedron
    ico_vertices = np.array([normalize(v) for v in [
        (0, -1, -phi), (0, -1, phi), (0, 1, -phi), (0, 1, phi),
        (-1, -phi, 0), (-1, phi, 0), (1, -phi, 0), (1, phi, 0),
        (-phi, 0, -1), (phi, 0, -1), (-phi, 0, 1), (phi, 0, 1),
    ]], dtype=float)
    ico_edges = edges_from_vertices(ico_vertices)
    ico_triangles = get_triangular_faces(ico_vertices, ico_edges)
    
    # Dodecahedron (simplified - use icosahedron dual)
    dod_vertices = []
    for a, b, c in ico_triangles:
        center = normalize((ico_vertices[a] + ico_vertices[b] + ico_vertices[c]) / 3.0)
        dod_vertices.append(center)
    dod_vertices = unique_rows(np.array(dod_vertices))
    dod_edges = edges_from_vertices(dod_vertices)
    dod_triangles = []  # Dodecahedron has pentagonal faces, no triangles
    
    return {
        'tetrahedron': (tet_vertices, tet_edges, tet_triangles),
        'cube': (cube_vertices, cube_edges, cube_triangles),
        'octahedron': (oct_vertices, oct_edges, oct_triangles),
        'icosahedron': (ico_vertices, ico_edges, ico_triangles),
        'dodecahedron': (dod_vertices, dod_edges, dod_triangles)
    }

def edges_from_vertices(vertices):
    """Find edges as minimal distance pairs."""
    V = np.array(vertices)
    n = len(V)
    distances = []
    for i in range(n):
        for j in range(i + 1, n):
            d = np.linalg.norm(V[i] - V[j])
            distances.append((d, i, j))
    
    distances.sort()
    edges = set()
    min_d = distances[0][0]
    
    for d, i, j in distances:
        if abs(d - min_d) < 1e-6:
            edges.add((i, j))
        else:
            break
    
    return sorted(tuple(sorted(e)) for e in edges)

def get_triangular_faces(vertices, edges):
    """Find triangular faces from vertices and edges."""
    edge_set = set(tuple(sorted(e)) for e in edges)
    triangles = []
    
    n = len(vertices)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if (tuple(sorted((i, j))) in edge_set and
                    tuple(sorted((j, k))) in edge_set and
                    tuple(sorted((k, i))) in edge_set):
                    triangles.append((i, j, k))
    
    return sorted(triangles)

def unique_rows(a, tol=1e-8):
    """Remove duplicate rows from array."""
    out = []
    for r in a:
        if not any(np.allclose(r, q, atol=tol) for q in out):
            out.append(r)
    return np.array(out)

def generate_rotation_group_fast(vertices, max_rotations=120):
    """Fast rotation group generation using optimized search."""
    n = len(vertices)
    V = np.array(vertices)
    perms = [tuple(range(n))]  # Identity
    
    def vperm_from_R(R):
        perm = [None] * n
        rotated = R @ V.T
        for i in range(n):
            j = nearest_index(rotated[:, i], V)
            if j is None:
                return None
            perm[i] = j
        return tuple(perm)
    
    # Optimized axis generation
    axes = []
    # Vertex directions
    axes.extend([normalize(v) for v in V])
    # Edge midpoints (only for close vertices)
    for i in range(n):
        for j in range(i + 1, n):
            if np.linalg.norm(V[i] - V[j]) < 2.5:
                axes.append(normalize((V[i] + V[j]) / 2))
    
    # Common angles for Platonic solids
    angles = [math.pi/6, math.pi/3, math.pi/2, 2*math.pi/3, math.pi, 
              4*math.pi/3, 3*math.pi/2, 2*math.pi/5, 4*math.pi/5]
    
    for axis in axes:
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

def edge_perms_from_vperms(edges, vertex_perms):
    """Convert vertex permutations to edge permutations."""
    edge_to_idx = {tuple(sorted(e)): i for i, e in enumerate(edges)}
    edge_perms = []
    
    for vperm in vertex_perms:
        edge_perm = []
        for a, b in edges:
            new_a, new_b = vperm[a], vperm[b]
            new_edge = tuple(sorted((new_a, new_b)))
            edge_perm.append(edge_to_idx[new_edge])
        edge_perms.append(edge_perm)
    
    return edge_perms

def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description='Optimized Platonic Solids Counter')
    parser.add_argument('--workers', type=int, default=None, 
                       help='Number of worker processes (default: auto)')
    parser.add_argument('--solids', type=str, 
                       default='tetrahedron,cube,octahedron,icosahedron,dodecahedron',
                       help='Comma-separated list of solids to compute')
    
    args = parser.parse_args()
    
    if args.workers is None:
        args.workers = cpu_count()
    
    print(f"Using {args.workers} worker processes")
    
    # Get solid data
    solid_data = get_platonic_solid_data()
    requested_solids = [s.strip() for s in args.solids.split(',')]
    
    results = {}
    
    for solid_name in requested_solids:
        if solid_name not in solid_data:
            print(f"Unknown solid: {solid_name}")
            continue
        
        print(f"\n{'='*50}")
        print(f"Processing {solid_name.capitalize()}")
        print(f"{'='*50}")
        
        vertices, edges, triangles = solid_data[solid_name]
        
        # Generate rotation group
        print(f"Generating rotation group...")
        vertex_perms = generate_rotation_group_fast(vertices)
        edge_perms = edge_perms_from_vperms(edges, vertex_perms)
        
        print(f"  Vertices: {len(vertices)}")
        print(f"  Edges: {len(edges)}")
        print(f"  Rotations: {len(edge_perms)}")
        print(f"  Triangular faces: {len(triangles)}")
        
        # Compute counts
        start_time = time.time()
        all_count, conn_count, valid_count = burnside_counts_optimized(
            vertices, edges, edge_perms, triangles, solid_name.capitalize(), args.workers
        )
        elapsed = time.time() - start_time
        
        results[solid_name.capitalize()] = {
            "V": len(vertices),
            "E": len(edges), 
            "G": len(edge_perms),
            "Triangular Faces": len(triangles),
            "All Combinations": all_count,
            "All Connected": conn_count,
            "Valid Incomplete": valid_count,
            "Time (seconds)": f"{elapsed:.1f}"
        }
        
        print(f"Completed in {elapsed:.1f} seconds")
    
    # Display results
    print(f"\n{'='*80}")
    print("FINAL RESULTS")
    print(f"{'='*80}")
    
    try:
        import pandas as pd
        df = pd.DataFrame.from_dict(results, orient='index')
        print(df.to_string())
    except ImportError:
        for solid, data in results.items():
            print(f"\n{solid}:")
            for key, value in data.items():
                print(f"  {key}: {value}")

if __name__ == "__main__":
    main()
