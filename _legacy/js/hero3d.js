/* hero3d.js — 3D-сцена героя курса на Three.js: робот обходит квадрат на сетке,
   оставляя светящийся след («цикл в действии», но в 3D).
   Прогрессивное улучшение: если Three.js не загрузился или произошла ошибка —
   тихо остаётся 2D-canvas (#heroCanvas), страница не ломается. */
(function () {
  'use strict';
  function init() {
    if (!window.THREE) return;                 // CDN недоступен → остаётся 2D
    var mount = document.getElementById('hero3d');
    var canvas2d = document.getElementById('heroCanvas');
    if (!mount) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var THREE = window.THREE;
    try {
      var w = mount.clientWidth || 520, h = mount.clientHeight || 420;
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      mount.appendChild(renderer.domElement);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      camera.position.set(7, 7.5, 9);
      camera.lookAt(0, 0.6, 0);

      scene.add(new THREE.AmbientLight(0xcfe6ff, 0.75));
      var dir = new THREE.DirectionalLight(0xffffff, 0.95); dir.position.set(6, 12, 6); scene.add(dir);
      var pt = new THREE.PointLight(0x22d3ee, 1.1, 50); pt.position.set(-6, 6, -2); scene.add(pt);

      var grid = new THREE.GridHelper(16, 16, 0x4f8cff, 0x7f97bf);
      grid.material.opacity = 0.4; grid.material.transparent = true;
      scene.add(grid);

      var S = 3;
      var C = [
        new THREE.Vector3(-S, 0, -S), new THREE.Vector3(S, 0, -S),
        new THREE.Vector3(S, 0, S), new THREE.Vector3(-S, 0, S)
      ];

      var trail = new THREE.Group(); scene.add(trail);
      var trailMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x16b6d6, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.35 });
      function addEdge(a, b) {
        var len = a.distanceTo(b);
        var m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.2), trailMat);
        m.position.set((a.x + b.x) / 2, 0.07, (a.z + b.z) / 2);
        m.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2;
        trail.add(m);
      }
      function clearTrail() { while (trail.children.length) { var c = trail.children[0]; trail.remove(c); c.geometry.dispose(); } }

      // робот
      var robot = new THREE.Group();
      var bodyMat = new THREE.MeshStandardMaterial({ color: 0x5b9bff, emissive: 0x16356e, emissiveIntensity: 0.45, metalness: 0.45, roughness: 0.3 });
      var body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), bodyMat); body.position.y = 0.85; robot.add(body);
      var trim = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.16, 1.12), trailMat); trim.position.y = 0.45; robot.add(trim);
      var eyeMat = new THREE.MeshStandardMaterial({ color: 0x05111f, emissive: 0x0a2540, emissiveIntensity: 0.5 });
      var e1 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), eyeMat); e1.position.set(0.26, 0.95, 0.55);
      var e2 = e1.clone(); e2.position.x = -0.26; robot.add(e1, e2);
      var glowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 });
      var g1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), glowMat); g1.position.set(0.30, 0.99, 0.62);
      var g2 = g1.clone(); g2.position.x = -0.22; robot.add(g1, g2);
      var ant = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 10), bodyMat); ant.position.y = 1.6; robot.add(ant);
      var ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.9 })); ball.position.y = 1.85; robot.add(ball);
      scene.add(robot);

      var p = 0, shown = 0, speed = 0.55;
      var clock = new THREE.Clock();
      function place() {
        var rp = p >= 4 ? 0 : p;
        var e = Math.floor(rp), t = rp - e;
        var a = C[e % 4], b = C[(e + 1) % 4];
        robot.position.x = a.x + (b.x - a.x) * t;
        robot.position.z = a.z + (b.z - a.z) * t;
        robot.position.y = Math.abs(Math.sin(t * Math.PI * 2)) * 0.16;
        robot.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
      }
      place();

      var raf = 0;
      function frame() {
        var dt = Math.min(clock.getDelta(), 0.05);
        if (!reduce) {
          p += dt * speed;
          var ce = Math.min(Math.floor(p), 4);
          while (shown < ce) { addEdge(C[shown % 4], C[(shown + 1) % 4]); shown++; }
          if (p >= 4.7) { p = 0; shown = 0; clearTrail(); }
          place();
          var a = clock.elapsedTime * 0.16;
          camera.position.x = 7 + Math.cos(a) * 0.7;
          camera.position.z = 9 + Math.sin(a) * 0.7;
          camera.lookAt(0, 0.6, 0);
          ball.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(clock.elapsedTime * 3)) * 0.6;
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      function resize() {
        var W = mount.clientWidth, H = mount.clientHeight;
        if (!W || !H) return;
        renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      }
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(mount);
      window.addEventListener('resize', resize);

      // успех → прячем 2D-fallback и показываем 3D
      if (canvas2d) canvas2d.style.display = 'none';
      mount.classList.add('on');

      // пауза, когда герой вне экрана (экономия ресурсов)
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { if (!raf) { clock.getDelta(); raf = requestAnimationFrame(frame); } }
            else { cancelAnimationFrame(raf); raf = 0; }
          });
        }, { threshold: 0 }).observe(mount);
      }
    } catch (err) {
      if (window.console) console.warn('3D-герой недоступен, используется 2D:', err);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
