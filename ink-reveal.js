document.addEventListener('DOMContentLoaded', () => {
    console.log("Ink reveal script loaded");
    const heroSection = document.getElementById('home');
    const inkCanvas = document.createElement('canvas');
    inkCanvas.id = 'ink-reveal-canvas';
    inkCanvas.style.position = 'absolute';
    inkCanvas.style.top = '0';
    inkCanvas.style.left = '0';
    inkCanvas.style.width = '100%';
    inkCanvas.style.height = '100%';
    inkCanvas.style.zIndex = '1'; // Above background, below text
    inkCanvas.style.pointerEvents = 'none';

    // Add canvas to hero section
    heroSection.style.position = 'relative';
    heroSection.style.overflow = 'hidden';
    heroSection.insertBefore(inkCanvas, heroSection.firstChild);

    const ctx = inkCanvas.getContext('2d');
let width, height;

function resizeInkCanvas() {
    const rect = heroSection.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    inkCanvas.width = width;
    inkCanvas.height = height;
    
    // Fill with dark mask
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(15, 23, 42, 1)'; // Slate-900 color mask
    ctx.fillRect(0, 0, width, height);
}

window.addEventListener('resize', resizeInkCanvas);
resizeInkCanvas();

// Store strokes
const strokes = [];

// Listen for mouse movement on the hero section
heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    strokes.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 80 + Math.random() * 40,
        alpha: 1,
        life: 0
    });
});

function animateInk() {
    // Redraw mask slightly every frame to make it fade back? 
    // "expand and fade, producing a natural paint-stroke feel"
    // Let's slowly fade back the mask.
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    // Erase strokes
    ctx.globalCompositeOperation = 'destination-out';
    
    for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        
        stroke.radius += (stroke.maxRadius - stroke.radius) * 0.1;
        stroke.life += 0.02;
        stroke.alpha = Math.max(0, 1 - stroke.life);
        
        if (stroke.alpha <= 0) {
            strokes.splice(i, 1);
            continue;
        }
        
        // Use radial gradient for soft edge
        const gradient = ctx.createRadialGradient(stroke.x, stroke.y, 0, stroke.x, stroke.y, stroke.radius);
        gradient.addColorStop(0, `rgba(0,0,0,${stroke.alpha})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(stroke.x, stroke.y, stroke.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    requestAnimationFrame(animateInk);
}

animateInk();
});
