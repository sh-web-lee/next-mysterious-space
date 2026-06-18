uniform float uTime;
  uniform vec2 uResolution;
  uniform sampler2D uNoiseTexture;
  
  // Rendering parameters
  #define CAMERA_FOCAL_LENGTH	3.0
  #define CAMERA_SPEED		10.0
  #define RAY_STEP_MAX		100.0
  #define RAY_STEP_DIST		0.3
  #define RAY_LENGTH_MAX		20.0
  #define NOISE_FACTOR		6.0
  #define NOISE_FREQUENCY		0.4
  #define NOISE_TEXTURE_SIZE	64.0
  #define CLOUDS_SPACING		1.0
  #define DENSITY_STEP_MAX	1.0
  #define DENSITY_FACTOR		0.05
  #define COLOR_CLOUDS_A		vec3 (0.2, 0.2, 0.4)
  #define COLOR_CLOUDS_B		vec3 (0.95, 0.9, 1.0)
  #define COLOR_SKY_A			vec3 (0.95, 0.95, 1.0)
  #define COLOR_SKY_B			vec3 (0.4, 0.4, 0.6)
  #define COLORIZE
  
  // Math constants
  #define PI 3.14159265359
  
  // PRNG
  float rand (in vec2 seed) {
    return fract (sin (dot (seed, vec2 (11.9898, 78.233))) * 137.5453);
  }
  
  // Noise (纯软件实现，不依赖纹理)
  float noise (in vec3 p) {
    vec3 f = fract (p);
    f = f * f * (3.0 - 2.0 * f);
    p = floor (p);
    p.xy += p.z * vec2 (37.0, 17.0);
    
    vec2 q = p.xy - vec2 (37.0, 17.0);
    vec2 n = vec2 (1.0, 0.0) + 0.5;
    float a = rand (q + n.yy);
    float b = rand (q + n.xy);
    float c = rand (q + n.yx);
    float d = rand (q + n.xx);
    float x1 = mix (a, b, f.x);
    float x2 = mix (c, d, f.x);
    float y1 = mix (rand (p.xy + n.yy), rand (p.xy + n.xy), f.x);
    float y2 = mix (rand (p.xy + n.yx), rand (p.xy + n.xx), f.x);
    
    return mix (mix (x1, x2, f.y), mix (y1, y2, f.y), f.z);
  }
  
  // FBM
  float fbm (in vec3 p) {
    return (noise (p) + noise (p * 2.0) / 2.0 + noise (p * 4.0) / 4.0) / (1.0 + 1.0 / 2.0 + 1.0 / 4.0);
  }
  
  // Distance to the scene
  float distScene (in vec3 p, in float noiseVal) {
    return CLOUDS_SPACING - abs (p.y + noiseVal);
  }
  
  // HSV to RGB
  vec3 hsv2rgb (in vec3 hsv) {
    hsv.yz = clamp (hsv.yz, 0.0, 1.0);
    return hsv.z * (1.0 + hsv.y * clamp (abs (fract (hsv.x + vec3 (0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 2.0, -1.0, 0.0));
  }
  
  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 iResolution = uResolution;
    float iTime = uTime;
    
    // Define the position and orientation of the camera
    vec3 rayOrigin = vec3 (0.0, 1.5 * cos (iTime * 0.5), CAMERA_SPEED * iTime);
    float cameraAngleY = PI * 0.6 * cos(iTime * 0.3);
    vec3 cameraForward = vec3 (sin (cameraAngleY), 0.0, cos (cameraAngleY));
    vec3 cameraUp = vec3 (sin (iTime * 0.2), 1.0, 0.0);
    mat3 cameraOrientation;
    cameraOrientation [2] = normalize (cameraForward);
    cameraOrientation [0] = normalize (cross (cameraUp, cameraForward));
    cameraOrientation [1] = cross (cameraOrientation [2], cameraOrientation [0]);
    vec3 rayDirection = cameraOrientation * normalize (vec3 ((2.0 * fragCoord.xy - iResolution.xy) / iResolution.y, CAMERA_FOCAL_LENGTH));
    
    // Define the colors
    float colorMix = smoothstep (-0.4, 0.4, cos (iTime * 0.2));
    vec3 colorClouds = mix (COLOR_CLOUDS_A, COLOR_CLOUDS_B, colorMix);
    vec3 colorSky = mix (COLOR_SKY_A, COLOR_SKY_B, colorMix);
    
    // Ray marching
    #ifdef COLORIZE
      vec3 color = vec3 (0.0);
      float colorCloudsValue = max (max (colorClouds.x, colorClouds.y), colorClouds.z);
      float colorCloudsSaturation = colorCloudsValue > 0.0 ? 1.0 - min (min (colorClouds.x, colorClouds.y), colorClouds.z) / colorCloudsValue : 0.0;
    #endif
    float densityTotal = 0.0;
    float rayLength = 0.0;
    for (float rayStep = 0.0; rayStep < RAY_STEP_MAX; ++rayStep) {
      
      // Compute the maximum density
      float densityMax = 1.0 - rayLength / max (RAY_LENGTH_MAX, RAY_STEP_MAX * RAY_STEP_DIST);
      if (densityTotal >= densityMax) {
        break;
      }
      
      // Get the distance to the scene
      vec3 p = rayOrigin + rayDirection * rayLength;
      float f = NOISE_FACTOR * (fbm (p * NOISE_FREQUENCY) - 0.5);
      float dist = distScene (p, f);
      if (dist < 0.0) {
        
        // Compute the local density
        float densityLocal = min (-dist, DENSITY_STEP_MAX) * DENSITY_FACTOR;
        densityLocal *= densityMax - densityTotal;
        
        #ifdef COLORIZE
          // Update the color
          color += hsv2rgb (vec3 (noise (p * 0.2), colorCloudsSaturation, densityLocal * colorCloudsValue));
        #endif
        
        // Update the total density
        densityTotal += densityLocal;
      }
      
      // Go ahead
      rayLength += max (RAY_STEP_DIST, dist - NOISE_FACTOR);
    }
    #ifdef COLORIZE
      color += colorSky * (1.0 - densityTotal);
    #else
      vec3 color = mix (colorSky, colorClouds, densityTotal);
    #endif
    
    // Set the fragment color
    gl_FragColor = vec4 (color, 1.0);
  }