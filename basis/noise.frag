// Author: https://github.com/VectorWolf
//
// These are my own implementations of value noise and perlin's gradient noise,
// based on reading the theory and not the code itself. They may not be the
// most efficient possible, I rather tried to make the code the easiest to
// understand the inner workings of noise.
//
// I'm still not sure how much the impact a quintic interpolation instead of
// a cubic interpolation has. I simply slapped on a quintic everywhere for
// good measure.
//
// Smoothen the otherwise linear curve
// float u = smoothstep(0.,1.,f);
// Same as cubic interpolation
// float r = f*f*(3.0-2.0*f);
// Better is quintic interpolation
// float u = f*f*f*(f*(f*6.-15.)+10.);
//
// Each 1D - 3D value and gradient noise implementation also has a fractal
// noise variant when called with additional parameters.
//
// TODO: Add an improved 2D and 3D value noise variant which rotates inbetween
//       octaves to get a still cheap fractal noise with far less "blockyness".
//
// NOTE: Don't forget to add the random.frag functions before this. Noise relies
//       on the pseudo random value generators supplied there.
//
//       Also don't forget that the scale of the noise is bound to the coord-
//       space scale. So you will propably want to multiply the first parameter
//       with your desired scale.


// This is the maximum of octaves a fractal noise may have
const int max_oct = 100;


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
