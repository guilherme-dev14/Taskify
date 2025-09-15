/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useCallback } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
}

const fragmentShaderOptimized = `
precision mediump float; 

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 30;
const float u_line_width = 7.0;
const float u_line_blur = 5.0; 

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.3;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.15); 

    float time_scaled = time / 15.0 + (mouse.x - 0.5) * 0.5; 
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 3.0), 
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 2.5) / 3.0, 
        st.x * 0.25 
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude; 

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.5))), 
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p * 0.5), 
            p,
            PI * p, 
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal * 0.8); 
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const Threads: React.FC<ThreadsProps> = ({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const mousePosition = useRef<[number, number]>([0.5, 0.5]);
  const targetMouse = useRef<[number, number]>([0.5, 0.5]);

  const throttledMouseMove = useCallback(
    (() => {
      let timeout: number | null = null;
      return (e: MouseEvent) => {
        if (timeout) return;
        timeout = setTimeout(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          targetMouse.current = [
            Math.max(0, Math.min(1, x)),
            Math.max(0, Math.min(1, y)),
          ];
          timeout = null;
        }, 16);
      };
    })(),
    []
  );

  const debouncedResize = useCallback(
    (() => {
      let timeout: number;
      return (resizeFn: () => void) => {
        clearTimeout(timeout);
        timeout = setTimeout(resizeFn, 100);
      };
    })(),
    []
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;

    if (!gl) {
      console.warn("WebGL não suportado, usando fallback");
      container.innerHTML =
        '<div class="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800"></div>';
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShaderOptimized,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = clientWidth;
      program.uniforms.iResolution.value.g = clientHeight;
      program.uniforms.iResolution.value.b = clientWidth / clientHeight;
    }

    const handleResize = () => debouncedResize(resize);
    window.addEventListener("resize", handleResize);
    resize();

    function handleMouseLeave() {
      targetMouse.current = [0.5, 0.5];
    }

    if (enableMouseInteraction) {
      container.addEventListener("mousemove", throttledMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    function update(currentTime: number) {
      const deltaTime = currentTime - lastFrameTime.current;

      if (deltaTime < 33.33) {
        animationFrameId.current = requestAnimationFrame(update);
        return;
      }

      lastFrameTime.current = currentTime;

      if (enableMouseInteraction) {
        const smoothing = 0.03;
        mousePosition.current[0] +=
          smoothing * (targetMouse.current[0] - mousePosition.current[0]);
        mousePosition.current[1] +=
          smoothing * (targetMouse.current[1] - mousePosition.current[1]);
        program.uniforms.uMouse.value[0] = mousePosition.current[0];
        program.uniforms.uMouse.value[1] = mousePosition.current[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      program.uniforms.iTime.value = currentTime * 0.0008;

      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }

    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);

      if (enableMouseInteraction) {
        container.removeEventListener("mousemove", throttledMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    color,
    amplitude,
    distance,
    enableMouseInteraction,
    throttledMouseMove,
    debouncedResize,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      {...rest}
    />
  );
};

export default Threads;
