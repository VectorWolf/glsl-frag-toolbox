// Author: https://github.com/VectorWolf
//
// Tiling is nice for generating various kind of patterns. By shifting columns
// or adjusting tile "behaviour" by it's index, you can generate really awesome
// effects.
// 
// TODO: Let all simpler functions derive from the most advanced one


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