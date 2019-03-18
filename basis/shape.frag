// Author: https://github.com/VectorWolf
//
// These various shapes come in handy for constructing icons and other more
// complex shapes.
//
// They are all generated in the coordinate center, to make rotation easier.
// So usually you will have to translate them to the image center via trs() or
// by subtracting vec2(0.5).


// PI is a must for constructing circles and other circular shapes
#define PI 3.14159265359
#define TWO_PI 6.28318530718

// We need this for scaling circular shapes so that they won't distort by non
// square resolution ratio
uniform vec2 u_resolution;

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