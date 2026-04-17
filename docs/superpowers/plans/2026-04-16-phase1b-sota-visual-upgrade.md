# Eigen CF Explorer — Phase 1b: SOTA Visual Upgrade

> **Status:** Pendiente · Requiere nueva sesión con contexto fresco
> **Prerequisito:** Evaluar React Three Fiber antes de commitear al stack 3D

**Goal:** Elevar la visualización de arquitecturas de 2D React Flow a una experiencia 3D con WebGPU, al nivel de sitios premiados en Awwwards 2026.

## Stack Propuesto (por evaluar)

- Three.js r171+ con WebGPU renderer
- React Three Fiber (@react-three/fiber) — Three.js como componentes React
- @react-three/drei — helpers (Float, Stars, MeshDistortMaterial, etc.)
- @react-three/postprocessing — bloom, chromatic aberration, film grain
- CPPN shader generativo para backgrounds
- WebGPU default, fallback a WebGL

## Lo que se haría

### Opción A: Híbrido (recomendado para evaluar)
- Mantener React Flow 2D como vista funcional principal
- Agregar una vista alternativa "3D" con Three.js como toggle
- El usuario prueba ambas y decide cuál prefiere
- Menor riesgo, permite evaluar R3F sin comprometer

### Opción B: Full 3D
- Reemplazar React Flow completamente con Three.js
- Nodos como objetos 3D (icosahedrons por categoría)
- Edges como beams de luz con partículas instanciadas
- Camera orbital con controls
- Post-processing pipeline completo
- Reorganización con spring physics al cambiar arquitectura

### Elementos visuales SOTA
1. CPPN shader background (neural generative art)
2. Instanced mesh particles (100K+ via WebGPU compute)
3. Bloom post-processing en beams y nodos seleccionados
4. Film grain GPU-based
5. Chromatic aberration sutil en hover
6. Physics-based node reorganization (cannon-es o rapier)
7. Volumetric light beams en edges

## Decisiones Pendientes
- [ ] ¿Raúl se siente cómodo con Three.js/R3F después de evaluarlo?
- [ ] ¿Híbrido (A) o full 3D (B)?
- [ ] ¿WebGPU only o con WebGL fallback?
- [ ] ¿Mobile: versión 2D obligatoria o intenta 3D?

## Referencia
- Three.js + WebGPU: https://www.utsubo.com/blog/threejs-2026-what-changed
- R3F: https://r3f.docs.pmnd.rs/
- Awwwards Three.js: https://www.awwwards.com/websites/three-js/
- Paper Shaders (ya instalado): https://shaders.paper.design/
