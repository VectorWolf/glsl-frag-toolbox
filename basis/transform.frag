// Author: https://github.com/VectorWolf
// 
// Using these properly means chaining them in right before passing the pixel-
// coordinate to a function which generates fields or shapes for example.
//
// Translation and scaling usually can be achieved by plain multiplication
// and addition, but since we manipulate the coordinate space itself and not
// the object, we have to divide and subtract. That's counter-intuitive. These
// functions behave more like we'd expect (also take care of proper transform
// execution order).
//
// Use case: Generate box in the center of the 1st quadrant at half size.
//     code: box(trs(coord,vec2(0.5),vec2(0.5)));


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