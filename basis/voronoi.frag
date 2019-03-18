// Author: https://github.com/VectorWolf
//
// These are my own implementations of voronoi noise or worley noise by Steven
// Worley. It's described really well in his paper "A Cellular Texture Basis
// Function" published here:
// http://www.rhythmiccanvas.com/research/papers/worley.pdf
//
// The two most powerful 3D voronoi implementations also have a fractal variant
// when called with additional parameters.
//
// TODO: Having a fractal variant of all possible voronois would be great. Also
//       some basic variations are missing. I don't want to clutter this with
//       nearly identic code snippets, but letting all variations derive from
//       the most powerful function would be a waste. I'll think about it.
//
// NOTE: Don't forget to add the random.frag functions before this. Voronoi also
//       relies on the pseudo random value generators supplied there.
//
//       Also don't forget that the scale of the voronoi is bound to the coord-
//       space scale. So you will propably want to multiply the first parameter
//       with your desired scale.


// This is the maximum of octaves a fractal voronoi may have
const int max_oct = 100;

// 2D voronoi returning F1 value
float voronoi(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float min_dist = 2.;
    // Iterate over the current and the 8 bounding cells
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            // The identity of each cell are the integer coordinates
            vec2 point = i + vec2(k,j);
            // Using the identity as a seed we get a uniqe position in a cell
            // by adding (k,j) we make the position local to our pixel coord
            point = vec2(rand(point),rand2(point)) + vec2(k,j);
            // Thus we can simply determin the distance and only store the
            // minimum value
            min_dist = min(min_dist, length(f - point));
        }
    }
    return min_dist;
}

// 3D voronoi returning F1 value
float voronoi(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    float min_dist = 2.;
    // Iterate over the current and the 26 bounding cells
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            for(int l = -1; l < 2; l++) {
                // The identity of each cell are the integer coordinates
                vec3 point = i + vec3(l,k,j);
                // Using the identity as a seed we get a uniqe position in a cell
                // by adding (k,j) we make the position local to our pixel coord
                point = vec3(rand(point),rand2(point),rand3(point)) + vec3(l,k,j);
                // Thus we can simply determin the distance and only store the
                // minimum value
                min_dist = min(min_dist, length(f - point));
            }
        }
    }
    return min_dist;
}

// 2D metaballs can be achieved by a slight change in voronoi
float metaballs(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float min_dist = 1.;
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            vec2 point = i + vec2(k,j);
            point = vec2(rand(point),rand2(point)) + vec2(k,j);
            // Here's the change     v                          v
            min_dist = min(min_dist, min_dist * length(f - point));
        }
    }
    return min_dist;
}

// 3D metaballs can be achieved by a slight change in voronoi
float metaballs(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    float min_dist = 1.;
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            for(int l = -1; l < 2; l++) {
                vec3 point = i + vec3(l,k,j);
                point = vec3(rand(point),rand2(point),rand3(point)) + vec3(l,k,j);
                // Here's the change     v                          v
                min_dist = min(min_dist, min_dist * length(f - point));
            }
        }
    }
    return min_dist;
}

// 2D voronoi supplying F1 and its id value per cell
vec2 voronoiid(vec2 st, float jitter) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float min_dist = 2.;
    vec2 id;
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            vec2 point = i + vec2(k,j);
            point = vec2 (0.5)
                    + jitter * (vec2(rand(point),rand2(point))-0.5) 
                    + vec2(k,j);
            float len = length(f - point);
            if( len < min_dist) {
                min_dist = len;
                id = point + i;
            }
        }
    }
    return vec2(min_dist, rand(id));
}
vec2 voronoiid(vec2 st) {return voronoiid(st, 1.);}

// 3D voronoi supplying F1 and its id value per cell
vec2 voronoiid(vec3 st, float jitter) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    float min_dist = 2.;
    vec3 id;
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            for(int l = -1; l < 2; l++) {
                vec3 point = i + vec3(l,k,j);
                point = vec3(0.5) 
                    + jitter * (vec3(rand(point),rand2(point),rand3(point))-0.5) 
                    + vec3(l,k,j);
                float len = length(f - point);
                if( len < min_dist) {
                    min_dist = len;
                    id = point + i;
                }
            }
        }
    }
    return vec2(min_dist,rand(id));
}
vec2 voronoiid(vec3 st) {return voronoiid(st, 1.);}

// 2D voronoi supplying F1 and F2 and each id value
vec4 voronoi2id(vec2 st, float jitter) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float min_dist = 2.;
    float min_dist2 = 2.;
    vec2 id;
    vec2 id2;
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            vec2 point = i + vec2(k,j);
            point = vec2 (0.5) 
                + jitter * (vec2(rand(point),rand2(point))-0.5) 
                + vec2(k,j);
            float len = length(f - point);
            if( len < min_dist) {
                min_dist2 = min_dist;
                id2 = id;
                min_dist = len;
                id = point + i;
            }
            else if( len < min_dist2) {
                min_dist2 = len;
                id2 = point + i;
            }
        }
    }
    return vec4(min_dist, rand(id), min_dist2, rand(id2));
}
vec4 voronoi2id(vec2 st) {return voronoi2id(st, 1.);}

// 3D voronoi supplying F1 and F2 and each id value
vec4 voronoi2id(vec3 st, float jitter) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    float min_dist = 2.;
    float min_dist2 = 2.;
    vec3 id;
    vec3 id2;
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            for(int l = -1; l < 2; l++) {
                vec3 point = i + vec3(l,k,j);
                point = vec3(0.5) 
                    + jitter * (vec3(rand(point),rand2(point),rand3(point))-0.5)
                    + vec3(l,k,j);
                float len = length(f - point);
                if( len < min_dist) {
                    min_dist2 = min_dist;
                    id2 = id;
                    min_dist = len;
                    id = point + i;
                }
                else if( len < min_dist2) {
                    min_dist2 = len;
                    id2 = point + i;
                }
            }
        }
    }
    return vec4(min_dist, rand(id), min_dist2, rand(id2));
}
vec4 voronoi2id(vec3 st) {return voronoi2id(st, 1.);}

// 3D voronoi supplying F1, F2, F3 and F4 values
vec4 voronoi4(vec3 st, float jitter) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    vec4 min_dist = vec4(2.);
    for(int j = -1; j < 2; j++) {
        for(int k = -1; k < 2; k++) {
            for(int l = -1; l < 2; l++) {
                vec3 point = i + vec3(l,k,j);
                point = vec3(0.5) 
                    + jitter * (vec3(rand(point),rand2(point),rand3(point))-0.5)
                    + vec3(l,k,j);
                float len = length(f - point);
                if( len < min_dist.x) {
                    min_dist.w = min_dist.z;
                    min_dist.z = min_dist.y;
                    min_dist.y = min_dist.x;
                    min_dist.x = len;
                }
                else if( len < min_dist.y) {
                    min_dist.w = min_dist.z;
                    min_dist.z = min_dist.y;
                    min_dist.y = len;
                }
                else if( len < min_dist.z) {
                    min_dist.w = min_dist.z;
                    min_dist.z = len;
                }
                else if( len < min_dist.w) {
                    min_dist.w = len;
                }
            }
        }
    }
    return min_dist;
}

// 3D fractal voronoi with all 4 F values
vec4 voronoi4(vec3 st, float jitter, int octave, float lacunarity, float gain) {
    float max_val = 0.;
    vec4 val = vec4(0.);
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += voronoi4(st * frequency,jitter) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}

// 3D fractal voronoi with F1, F2 and each ID (although using ID in a fractal is
// a bit strange).
vec2 voronoiid(vec3 st, float jitter, int octave, float lacunarity, float gain) {
    float max_val = 0.;
    vec2 val = vec2(0.);
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += voronoiid(st * frequency,jitter) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}