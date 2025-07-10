import $ from 'jquery';
import './style.css';
import VanillaTilt from 'vanilla-tilt';
import Granim from 'granim';
// import Choreographer from 'choreographer-js';

$(document).ready(function() {
  document.querySelectorAll('.section p').forEach(p => {
    p.innerHTML = p.innerHTML.replace(/。/g, '。<br>');
  });

  document.querySelectorAll('.section p').forEach(p => {
    VanillaTilt.init(p, {
      scale: 1.15,
      speed: 400,
      glare: false,
      max: 8,
      "full-page-listening": false
    });
  });

  document.querySelectorAll('.section h1').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      console.log('mouseenter h1', el);
      anime({
        targets: el,
        opacity: 1,
        scale: [
          { value: 1.3, duration: 300, easing: 'easeOutCubic' },
          { value: 1.1, duration: 300, easing: 'easeInOutElastic(1, .8)' }
        ],
        rotateZ: [
          { value: 10, duration: 200, easing: 'easeOutCubic' },
          { value: -10, duration: 200, easing: 'easeInOutCubic' },
          { value: 0, duration: 200, easing: 'easeInOutCubic' }
        ],
        color: [
          { value: '#fff', duration: 0 },
          { value: '#ff4081', duration: 600, easing: 'linear' },
          { value: '#fff', duration: 400, easing: 'linear' }
        ],
        duration: 900,
        easing: 'easeOutElastic(1, .8)'
      });
    });
    el.addEventListener('mouseleave', () => {
      el.style.opacity = 0.7;
      el.style.transform = 'scale(1) translateY(0)';
      el.style.color = '';
    });
  });

  const blocLogo = document.querySelector('.bloc-logo');
  if (blocLogo) {
    VanillaTilt.init(blocLogo, {
      scale: 1.08,
      speed: 500,
      max: 25,
      glare: true,
      'max-glare': 0.18
    });
  }
});


// 多色渐变色数组和插值函数（forEach 外部定义）
const colorStops = [
  [29, 22, 248],    // #1d16f8 蓝
  [0, 255, 255],    // 青色
  [0, 255, 0],      // 绿色
  [255, 255, 0],    // 黄色
  [255, 140, 0],    // 橙色
  [255, 0, 0],      // 红色
  [255, 0, 255],    // 品红
  [155, 0, 255],    // 紫色
  [255, 105, 180],  // 粉色
  [255, 230, 0]     // #ffe600 黄
];
function multiColorFade(p) {
  const stops = colorStops;
  const n = stops.length - 1;
  const seg = 1 / n;
  let idx = Math.floor(p / seg);
  if (idx >= n) idx = n - 1;
  const localP = (p - idx * seg) / seg;
  const [r1, g1, b1] = stops[idx];
  const [r2, g2, b2] = stops[idx + 1];
  const r = Math.round(r1 + (r2 - r1) * localP);
  const g = Math.round(g1 + (g2 - g1) * localP);
  const b = Math.round(b1 + (b2 - b1) * localP);
  return `rgb(${r},${g},${b})`;
}

window.addEventListener('DOMContentLoaded', function() {
  // 1. 先将所有 h2 拆分为 span
  document.querySelectorAll('h2').forEach(h2 => {
    if (!h2.dataset.splitted) {
      h2.innerHTML = h2.textContent.split('').map(char =>
        `<span class="wave-letter">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('');
      h2.dataset.splitted = '1';
    }
  });

  document.querySelectorAll('h2').forEach((h2, h2idx) => {
    h2.id = h2.id || `choreo-h2-${h2idx}`;
    const spans = h2.querySelectorAll('.wave-letter');
    spans.forEach((span, idx) => {
      span.style.display = 'inline-block';
      span.style.transition = 'transform 0.3s, color 0.3s, opacity 0.3s';
      span.id = span.id || `wave-h2-${h2idx}-${idx}`;

      // 每个字母一个 colorFade 动画实例（多色渐变）
      span._colorChoreographer = new window.Choreographer({
        customFunctions: {
          colorFade: (data) => {
            let p = data.progress;
            data.node.style.color = multiColorFade(p);
          }
        },
        animations: [
          {
            range: [0, 1],
            selector: `#${span.id}`,
            type: 'colorFade'
          }
        ]
      });

      // 每个字母一个 choreographer 弹跳动画实例
      span._choreographer = new window.Choreographer({
        customFunctions: {
          bounce: (data) => {
            let p = data.progress;
            let scale = 1 + 0.4 * Math.sin(Math.PI * p); // 最大scale 1.4
            let ty = -32 * Math.sin(Math.PI * p); // 最大-32px
            data.node.style.transform = `scale(${scale}) translateY(${ty}px)`;
            data.node.style.opacity = 1;
          }
        },
        animations: [
          {
            range: [0, 1],
            selector: `#${span.id}`,
            type: 'bounce'
          }
        ]
      });
    });

    // 悬停 h2 时，依次延迟触发每个字母的弹跳+颜色渐变
    h2.addEventListener('mouseenter', () => {
      let steps = 48; // 步数更多，动画更平滑
      let duration = 630; // 动画更慢
      let stepTime = duration / steps;
      spans.forEach((span, i) => {
        setTimeout(() => {
          let current = 0;
          function animate() {
            let pos = current / steps;
            span._choreographer.runAnimationsAt(pos);
            span._colorChoreographer.runAnimationsAt(pos);
            current++;
            if (current <= steps) {
              setTimeout(animate, stepTime);
            } else {
              span.style.opacity = 1;
              const [r, g, b] = colorStops[Math.floor(Math.random() * colorStops.length)];
              span.style.color = `rgb(${r},${g},${b})`;
            }
          }
          animate();
        }, i * 40); // 波浪延迟
      });
    });

    // 离开时复原
    h2.addEventListener('mouseleave', () => {
      spans.forEach(span => {
        span.style.transform = 'scale(1) translateY(0)';
        span.style.opacity = 1;
      });
    });
  });
});