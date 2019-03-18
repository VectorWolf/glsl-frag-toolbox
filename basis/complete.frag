// Author: https://github.com/VectorWolf
//
// All basis functions I made in correct order for easy copy pasting.


// Default block from https://thebookofshaders.com/
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// This is the maximum of octaves a fractal noise may have
const int max_oct = 100;


// Generate rotation matrix which rotates coordinate space when multiplied
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

// Return coords translated and scaled
vec2 ts(vec2 st, vec2 t, vec2 s) {
    return (st - t) / s;
}

// Return coords translated and rotated
vec2 tr(vec2 st, vec2 t, float r) {
    return(st - t) * rotate2d(r);
}

// Return coords translated and scaled
vec2 trs(vec2 st, vec2 t, vec2 s) {
    return (st - t) / s;
}

// Return coords translated and rotated
vec2 trs(vec2 st, vec2 t, float r) {
    return(st - t) * rotate2d(r);
}

// Return coords translated, rotated and scaled
vec2 trs(vec2 st, vec2 t, float r, vec2 s) {
    return (st - t) * rotate2d(r) / s;
}

// Return coords rotated around 0,0
vec2 rot(vec2 st, float deg) {
    return st * rotate2d(deg);
}

// Return coords rotated around -center
vec2 rot(vec2 st, float deg, vec2 center) {
    st -= center;
    st *= rotate2d(deg);
    st += center;
    return st;
}

// Generate scaling matrix which scales coordinate space when multiplied
mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}


// Generate a gradient ranging from 0 to 1 with 0.5 in the coordinate center
float gradient(vec2 st, vec2 grad) {
    // Real length and proportional length on the grad vector
    // But only if the length of grad equals 1
    // float x = dot(st,grad);
    
    // Real length on the grad vector
    // float x = dot(st,grad) / length(grad);
    
    // Proportional length on the grad vector
    float x = dot(st,grad) / pow(length(grad),2.);
    // Shift scale from -1 to 1  to  0 to 1
    x = x / 2. + 0.5;
    return x ;
}

// Generate a line with rough edges and infinite length (use box for finite)
float line(vec2 st, float thickness) {
    st = abs(st);
    // Cut space evenly around y axis
    return step(st.y,thickness);
}

// Generate a line with soft edges and infinite length (use box for finite)
float line(vec2 st, float thickness, float smooth) {
    st = abs(st);
    // Cut space evenly around y axis and smooth evenly around border
    return smoothstep(st.y-smooth,st.y+smooth,thickness);
}

// Return a circular distance field
float circle(vec2 st) {
    // Make the possibly rectangular space square shaped
  	st.x *= u_resolution.x/u_resolution.y;
    // Compute the distance to (0,0) coords
    return sqrt(dot(st,st));
}

// Return a circle with rough borders
float circle(vec2 st, float w) {
    // Restrict circular field with a certain width
    return 1.-step(w,circle(st));
}

// Return a circle with soft borders
float circle(vec2 st, float w, float sm) {
    // Restrict circular field with a certain smoothed width
    return 1.-smoothstep(w-sm,w+sm,circle(st));
}

// Generate a box shaped distance field
float box(vec2 st) {
    st = abs(st);
    // The max function on x and y accentuates the diagonal between the axis
    return max(st.x , st.y);
}

// Generate a box with rough borders
float box(vec2 st, vec2 d) {
    st = abs(st);
    // Cut space evenly around x and y axis
    return step(st.x,d.x) * step(st.y,d.y);
}
float box(vec2 st, float d) {return box(st,vec2(d));}

// Generate a box with soft borders
float box(vec2 st, vec2 d, vec2 sm) {
    st = abs(st);
    // Cut space evenly around x and y axis, smooth evenly around border
    return smoothstep(st.x-sm.x,st.x+sm.x,d.x) 
            * smoothstep(st.y-sm.y,st.y+sm.y,d.y);
}
float box(vec2 st, float d, float sm) {return box(st,vec2(d),vec2(sm));}
float box(vec2 st, vec2 d, float sm) {return box(st,d,vec2(sm));}
float box(vec2 st, float d, vec2 sm) {return box(st,vec2(d),sm);}

// Generate a cross shaped distance field
float cross(vec2 st) {
    st = abs(st);
    // The min function on x and y erodes the diagonal between the axis
    return min(st.x, st.y);
}

// Generate a cross with rough borders
float cross(vec2 st, float ratio) {
    // Generate two rects ontop of each other
    return clamp(box(st,vec2(1.,ratio)) + box(st,vec2(ratio,1.)),0.,1.);
}

// Generate a cross with smooth borders
float cross(vec2 st, float ratio, float sm) {
    // Generate two rects ontop of each other
    // Subtract the intersection for uniform smoothness
    return box(st,vec2(1.,ratio),sm) 
            + box(st,vec2(ratio,1.),sm) 
            - box(st,vec2(ratio),sm);
}

// Generate a somewhat cog shaped field 
// (Only visible when restricted by distance to center)
float cogf(vec2 st, int tips, float prop, float base, float rot) {
    // Make the possibly rectangular space square shaped
  	st.x *= u_resolution.x/u_resolution.y;
    // Radius aka. distance to center
    float r = length(st)*2.0;
    // Degree calculation
    float a = atan(st.y,st.x);
    // Generate Sine around center and manipulate it further with smoothstep
    float f = smoothstep(-base,1.0, cos((a+rot)*float(tips)))*prop+(1.-prop);
    
    return f;
}

// Generate a cog with rough borders
float cog(vec2 st, int tips, float prop, float base, float rot) {
    // Make the possibly rectangular space square shaped
  	st.x *= u_resolution.x/u_resolution.y;
    // Radius aka. distance to center
    float r = length(st)*2.0;
    // Degree calculation
    float a = atan(st.y,st.x);
    // Generate Sine around center and manipulate it further with smoothstep
    float f = smoothstep(-base,1.0, cos((a+rot)*float(tips)))*prop+(1.-prop);
    // Restrict field by radius
    return step(r,f);
}

// Generate a cog with smooth borders
float cog(vec2 st, int tips, float prop, float base, float rot, float sm) {
    // Make the possibly rectangular space square shaped
  	st.x *= u_resolution.x/u_resolution.y;
    // Radius aka. distance to center
    float r = length(st)*2.0;
    // Degree calculation
    float a = atan(st.y,st.x);
    // Generate Sine around center and manipulate it further with smoothstep
    float f = smoothstep(-base,1.0, cos((a+rot)*float(tips)))*prop+(1.-prop);
    // Restrict field by radius smoothly
    return smoothstep(r - sm, r + sm,f);
}

// Generate an n-edged field
float shape(vec2 st, int corn, float rot) {

    // Make the possibly rectangular space square shaped
  	st.x *= u_resolution.x/u_resolution.y;

  	// Angle and radius from the current pixel
  	float a = atan(st.x,st.y)+PI;
  	float r = TWO_PI/float(corn);

  	// Shaping function that modulates the distance
  	float d = cos(floor(.5+(a+rot)/r)*r-(a+rot))*length(st);
	return d;
}

// Generate an n-edged shape with rough edges
float shape(vec2 st, int corn, float rot, float size) {
	return 1.-step(size,shape(st,corn,rot));
}

// Generate an n-edged shape with soft edges
float shape(vec2 st, int corn, float rot, float size, float sm) {
	return 1.-smoothstep(size - sm, size + sm,shape(st,corn,rot));
}


// Generate sine pulsing back and forth between min and max with a certain speed
float pulse(float min, float max, float speed) {
    return (sin(u_time * speed) + 1.) / 2. * (max - min) + min;
}

// Generate sine pulsing back and forth between min and max with a certain speed
// Offset input offsets on a scale from 0. to 2 * PI
float pulse(float min, float max, float speed, float offset) {
    return (sin((u_time + offset) * speed) + 1.) / 2. * (max - min) + min;
}

// Generate one to four consecutive "motions" moving linearly from 0 to 1.
// This is really useful for dividing one cycle of movement into several
// distinct movements.
float phase(float speed) {
    return fract(u_time * speed);
}
vec2 phase2(float speed) {
    float time = fract(u_time*speed) * 2.;
    float t1 = step(time, 1.) * time;
    float t2 = step(mod(time + 1.,2.), 1.) * time;
    return vec2(t1,t2);
}
vec3 phase3(float speed) {
    float time = fract(u_time*speed) * 3.;
    float t1 = step(time, 1.) * time;
    float t2 = step(mod(time + 1.,3.), 1.) * time;
    float t3 = step(mod(time + 2.,3.), 1.) * time;
    return vec3(t1,t2,t3);
}
vec4 phase4(float speed) {
    float time = fract(u_time*speed) * 4.;
    float t1 = step(time, 1.) * time;
    float t2 = step(mod(time + 1.,4.), 1.) * time;
    float t3 = step(mod(time + 2.,4.), 1.) * time;
    float t4 = step(mod(time + 3.,4.), 1.) * time;
    return vec4(t1,t2,t3,t4);
}


// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
vec2 tile(vec2 st, float deg) {
    return fract(st * deg);
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
vec2 tile(vec2 st, vec2 deg) {
    return fract(st * deg);
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// Additionaly shift each -ratio row or column by -shift in it's own direction
vec2 tile(vec2 st, vec2 deg, vec2 ratio, vec2 shift) {
    st *= deg;
    /* Old attempt with disrupted column-shift
    st.x -= step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shift.x;
    st.y -= step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shift.y;
    */
    st -= vec2(step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shift.x, 
               step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shift.y);
    return fract(st);
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// Additionaly shift each -ratio row by -shiftx and column by -shifty
vec2 tile(vec2 st, vec2 deg, vec2 ratio, vec2 shiftx, vec2 shifty) {
    st *= deg;
    /* Old attempt with disrupted column-shift
    st -= step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shiftx;
    st -= step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shifty;
    */
    st -= (step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shiftx) 
          + (step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shifty);
    return fract(st);
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// Additionaly shift each -ratio row and column by even and odd
vec2 tile(vec2 st, vec2 deg, vec2 ratio, vec2 xev, vec2 xod, vec2 yev, vec2 yod) {
     st -= xev / deg.x + yev / deg.y;
     return tile(st,deg,ratio,xod-xev,yod-yev);
}

// Subset of function above
vec2 tile(vec2 st, vec2 deg, vec2 ratio, vec4 shift) {
    return tile(st,deg,ratio,vec2(shift.x,0.0),vec2(shift.z,0.0),
                             vec2(0.0,shift.y),vec2(0.0,shift.w));
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// return.wz stores the tile id determined by row and column number
vec4 tileid(vec2 st, float deg) {
    st *= deg;
    return vec4(fract(st),floor(st.x),floor(st.y));
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// return.wz stores the tile id determined by row and column number
vec4 tileid(vec2 st, vec2 deg) {
    st *= deg;
    return vec4(fract(st),floor(st.x),floor(st.y));
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// Additionaly shift each -ratio row or column by -shift in it's own direction
// return.wz stores the tile id determined by row and column number
vec4 tileid(vec2 st, vec2 deg, vec2 ratio, vec2 shift) {
    st *= deg;
    /* Old attempt with disrupted column-shift
    st -= step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shiftx;
    st -= step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shifty;
    */
    st -= vec2(step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shift.x, 
               step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shift.y);
    vec2 id = vec2(st.x,st.y);
    return vec4(fract(st),floor(id.x),floor(id.y));
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// Additionaly shift each -ratio row by -shiftx and column by -shifty
// return.wz stores the tile id determined by row and column number
vec4 tileid(vec2 st, vec2 deg, vec2 ratio, vec2 shiftx, vec2 shifty) {
    st *= deg;
    /* Old attempt with disrupted column-shift
    st -= step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shiftx;
    st -= step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shifty;
    */
    st -= (step(ratio.x - 1.0 , mod(st.y,ratio.x)) * shiftx) 
          + (step(ratio.y - 1.0 , mod(st.x,ratio.y)) * shifty);
    vec2 id = vec2(st.x,st.y);
    return vec4(fract(st),floor(id.x),floor(id.y));
}

// Seperate Space from 0. to 1. into deg tiles ranging from 0 to 1
// Additionaly shift each -ratio row and column by even and odd
// return.wz stores the tile id determined by row and column number
vec4 tileid(vec2 st, vec2 deg, vec2 ratio, vec2 xev, vec2 xod, vec2 yev, vec2 yod) {
    st -= xev / deg.x + yev / deg.y;
    return tileid(st,deg,ratio,xod-xev,yod-yev);
}

// Subset of function above
vec4 tileid(vec2 st, vec2 deg, vec2 ratio, vec4 shift) {
    return tileid(st,deg,ratio,vec2(shift.x,0.0),vec2(shift.z,0.0),
                               vec2(0.0,shift.y),vec2(0.0,shift.w));
}


// Generate determenistic pseudo random values via a float
float rand(float x) {
    return fract(sin(x + 3.9812)*143758.5453);
}

// Generate determenistic pseudo random values via a vec2
float rand(vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Generate determenistic pseudo random values via a vec3
float rand(vec3 _st) {
    return fract(sin(dot(_st.xyz,
                         vec3(12.9898,78.233,37.719)))*
        43758.5453123);
}

// Generate determenistic pseudo random values via a plain float
float rand2(float x) {
    return fract(sin(x + 7.1536)*143758.5453);
}

// Generate determenistic pseudo random values via a vec2
float rand2(vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(39.346, 11.135)))*
        43758.5453123);
}

// Generate determenistic pseudo random values via a vec3
float rand2(vec3 _st) {
    return fract(sin(dot(_st.xyz,
                         vec3(39.346, 11.135, 83.155)))*
        43758.5453123);
}

// Generate determenistic pseudo random values via a float
float rand3(float x) {
    return fract(sin(x + 5.7241)*143758.5453);
}

// Generate determenistic pseudo random values via a vec2
float rand3(vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(73.156, 52.235)))*
        43758.5453123);
}

// Generate determenistic pseudo random values via a vec3
float rand3(vec3 _st) {
    return fract(sin(dot(_st.xyz,
                         vec3(73.156, 52.235, 9.151)))*
        43758.5453123);
}

// Generate a pseudo random vector of length 1
vec2 randgrad(vec2 st) {
    //return vec2(rand(st),rand(dot(st, vec2(0.800,0.410))));
    float x = rand(st) * TWO_PI;
    return vec2(cos(x),sin(x));
}

// Generate uniformly distributed random 3d vector with length 1
vec3 randgrad(vec3 st) {
    // Math formula based
    float o = rand(st) * TWO_PI;
    float z = rand2(st) * 2. - 1.;
    return vec3(sqrt(1. - z * z) * cos(o), sqrt(1. - z * z) * sin(o), z);
}


// 1D Value Noise implementation
float vnoise(float x) {
    float i = floor(x);
    float f = fract(x);
    
    // Smoothen the otherwise linear curve
    float u = f*f*f*(f*(f*6.-15.)+10.);
    
    return mix(rand(i),rand(i + 1.),u);
}

// 1D fractal Value Noise
float vnoise(float x, int octave, float lacunarity, float gain) {   
    float max_val = 0.;
    float val = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += vnoise(x * frequency) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}
float vnoise(float x, int octave) {return vnoise(x,octave,2.,0.5);}

// 2D Value Noise implementation
float vnoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));

    // Smoothen the otherwise linear curve
    vec2 u = f*f*f*(f*(f*6.-15.)+10.);

    // First interpolate vertically between a c and a d
    // Then interpolate between those 2 values horizontally
    return mix( mix(a,c,u.y) ,mix(b,d,u.y),u.x);
}

// 2D Fractal Value Noise implementation
float vnoise(vec2 st, int octave, float lacunarity, float gain) {
    float max_val = 0.;
    float val = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += vnoise(st * frequency) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}
float vnoise(vec2 st, int octave) {return vnoise(st,octave,2.,0.5);}

// 3D Value Noise implementation
float vnoise(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    // Eight corners in 3D of a tile cube
    float a = rand(i);
    float b = rand(i + vec3(1.0, 0.0, 0.0));
    float c = rand(i + vec3(0.0, 1.0, 0.0));
    float d = rand(i + vec3(1.0, 1.0, 0.0));
    
    float a2 = rand(i + vec3(0.0, 0.0, 1.0));
    float b2 = rand(i + vec3(1.0, 0.0, 1.0));
    float c2 = rand(i + vec3(0.0, 1.0, 1.0));
    float d2 = rand(i + vec3(1.0, 1.0, 1.0));

    // Smoothen the otherwise linear curve
    vec3 u = f*f*f*(f*(f*6.-15.)+10.);

    // First interpolate vertically between a c and a d
    // Then interpolate between those 2 values horizontally
    // Lastly interpolate between the front and the back rectangle
    float front = mix( mix(a,c,u.y) ,mix(b,d,u.y),u.x);
    float back = mix( mix(a2,c2,u.y) ,mix(b2,d2,u.y),u.x);
    return mix(front,back,u.z);
}

// 3D Fractal Value Noise implementation
float vnoise(vec3 st, int octave, float lacunarity, float gain) {
    float max_val = 0.;
    float val = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += vnoise(st * frequency) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}
float vnoise(vec3 st, int octave) {return vnoise(st,octave,2.,0.5);}

// 1D Gradient Noise implementation
float gnoise(float x) {
    float i = floor(x);
    float f = fract(x);
    
    // Generate two random elevation values in the range -1 to 1
    // a is left and b right of x
    float a = rand(i) * 2. -1.;
    float b = rand(i + 1.) * 2. -1.;
    
    // Smoothen the otherwise linear curve
    float u = f*f*f*(f*(f*6.-15.)+10.);
    
    // Determine the point of x on each elevation curve 
    // and interpolate between both curves by distance
    // Values are in range -0.5 -- 0.5, we normalize by adding 0.5
    return mix(f * a,(f - 1.) * b,u)+0.5;
}

// 1D fractal Gradient Noise
float gnoise(float x, int octave, float lacunarity, float gain) {   
    float max_val = 0.;
    float val = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += gnoise(x * frequency) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}
float gnoise(float x, int octave) {return gnoise(x,octave,2.,0.5);}

// 2D Gradient Noise implementation
float gnoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile each get a random gradient with length 1
    vec2 a = randgrad(i);
    vec2 b = randgrad(i + vec2(1.0, 0.0));
    vec2 c = randgrad(i + vec2(0.0, 1.0));
    vec2 d = randgrad(i + vec2(1.0, 1.0));
    
    // To calculate the color value of each gradient in correlation to the current pixel
    // we have to form each vector with the origin from the corner, pointing to the pixel
    vec2 corn_a = f;
    vec2 corn_b = f - vec2(1.0, 0.0);
    vec2 corn_c = f - vec2(0.0, 1.0);
    vec2 corn_d = f - vec2(1.0, 1.0);
    
    // By forming the dot product between the gradient vector and the pixel vector which is now
    // local to the gradients origin, we get the projected position of the pixel on the gradient.
    //
    // If the projection hits the base, we have a color value of 0, if it hits the tip, we get
    // a 1 instead. If its in the middle, we get a 0.something value.
    //
    // This only works properly, since the gradients are of length 1, otherwise we'd have to
    // divide by the gradient vector length (two times)
    vec4 col;
    col.x = dot(corn_a,a);
    col.y = dot(corn_b,b);
    col.z = dot(corn_c,c);
    col.w = dot(corn_d,d);
    
    // Values in the bounds of the vector range from -1 to 1,
    // we want them to be 0.5 in the origin, ranging from 0 to 1
    col = col / 2. + 0.5;

    // Smoothen the otherwise linear curve
    vec2 u = f*f*f*(f*(f*6.-15.)+10.);

    // First interpolate vertically between a c and a d
    // Then interpolate between those 2 values horizontally
    return mix( mix(col.x,col.z,u.y) ,mix(col.y,col.w,u.y),u.x);
}

// 2D Fractal Gradient Noise implementation
float gnoise(vec2 st, int octave, float lacunarity, float gain) {
    float max_val = 0.;
    float val = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += gnoise(st * frequency) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}
float gnoise(vec2 st, int octave) {return gnoise(st,octave,2.,0.5);}

// 3D Gradient Noise implementation
float gnoise(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    // Eight corners in 3D of a tile each get a random gradient with length 1
    vec3 grad_a = randgrad(i);
    vec3 grad_b = randgrad(i + vec3(1.0, 0.0, 0.0));
    vec3 grad_c = randgrad(i + vec3(0.0, 1.0, 0.0));
    vec3 grad_d = randgrad(i + vec3(1.0, 1.0, 0.0));
    
    vec3 grad_a2 = randgrad(i + vec3(0.0, 0.0, 1.0));
    vec3 grad_b2 = randgrad(i + vec3(1.0, 0.0, 1.0));
    vec3 grad_c2 = randgrad(i + vec3(0.0, 1.0, 1.0));
    vec3 grad_d2 = randgrad(i + vec3(1.0, 1.0, 1.0));
    
    // To calculate the color value of each gradient in correlation to the current pixel
    // we have to form each vector with the origin from the corner, pointing to the pixel
    vec3 corn_a = f;
    vec3 corn_b = f - vec3(1.0, 0.0, 0.0);
    vec3 corn_c = f - vec3(0.0, 1.0, 0.0);
    vec3 corn_d = f - vec3(1.0, 1.0, 0.0);
    
    vec3 corn_a2 = f - vec3(0.0, 0.0, 1.0);
    vec3 corn_b2 = f - vec3(1.0, 0.0, 1.0);
    vec3 corn_c2 = f - vec3(0.0, 1.0, 1.0);
    vec3 corn_d2 = f - vec3(1.0, 1.0, 1.0);
    
    // By forming the dot product between the gradient vector and the pixel vector which is now
    // local to the gradients origin, we get the projected position of the pixel on the gradient.
    //
    // If the projection hits the base, we have a color value of 0, if it hits the tip, we get
    // a 1 instead. If its in the middle, we get a 0.something value.
    //
    // This only works properly, since the gradients are of length 1, otherwise we'd have to
    // divide by the gradient vector length (two times)
    vec4 col;
    col.x = dot(corn_a,grad_a);
    col.y = dot(corn_b,grad_b);
    col.z = dot(corn_c,grad_c);
    col.w = dot(corn_d,grad_d);
    
    vec4 col2;
    col2.x = dot(corn_a2,grad_a2);
    col2.y = dot(corn_b2,grad_b2);
    col2.z = dot(corn_c2,grad_c2);
    col2.w = dot(corn_d2,grad_d2);
    
    // Values in the bounds of the vector range from -1 to 1,
    // we want them to be 0.5 in the origin, ranging from 0 to 1
    col = col / 2. + 0.5;
    col2 = col2 / 2. + 0.5;

    // Smoothen the otherwise linear curve
    vec3 u = f*f*f*(f*(f*6.-15.)+10.);

    // First interpolate vertically between a c and a d
    // Then interpolate between those 2 values horizontally
    float front = mix( mix(col.x,col.z,u.y) ,mix(col.y,col.w,u.y),u.x);
    float back = mix( mix(col2.x,col2.z,u.y) ,mix(col2.y,col2.w,u.y),u.x);
    return mix(front,back,u.z);
}

// 3D Fractal Gradient Noise implementation
float gnoise(vec3 st, int octave, float lacunarity, float gain) {
    float max_val = 0.;
    float val = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    for(int i = 1;i < max_oct; i++) {
        if(i > octave) {break;}
        val += gnoise(st * frequency) * amplitude;
        max_val += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
	return val / max_val;
}
float gnoise(vec3 st, int octave) {return gnoise(st,octave,2.,0.5);}


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