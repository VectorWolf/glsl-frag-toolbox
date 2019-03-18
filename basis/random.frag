// Author: https://github.com/VectorWolf
//
// These snippets are mainly a prerequisite for the more complex noise functions
//
// The different rand variants are mainly taken from:
// https://thebookofshaders.com and https://www.ronja-tutorials.com
//
// TODO: Swap the rand functions with nicer "linear congruential generators"


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