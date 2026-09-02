function createParticles() {
  const container = document.getElementById('particleContainer');
  if (!container) return;
  const count = 60;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.width = (Math.random() * 3 + 1) + 'px';
    p.style.height = p.style.width;
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (Math.random() * 5 + 5) + 's';
    p.style.opacity = Math.random() * 0.5 + 0.2;
    container.appendChild(p);
  }
}

document.addEventListener('DOMContentLoaded', createParticles);