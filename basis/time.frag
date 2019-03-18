// Author: https://github.com/VectorWolf
//
// These functions are useful for animating a shader. You usually get away
// coding from scratch, but with these it's usally a bit more convenient.


// We need this since motion can only exist in correlation to time
uniform float u_time;

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