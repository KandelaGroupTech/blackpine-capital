const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const mouse = { x: null, y: null, radius: 150 };
const spacing = 65; // Increased spacing for ~60% fewer particles

// Resize canvas to fill the window
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init(); // Re-initialize lattice on resize
}
window.addEventListener('resize', resize);

// Mouse event listeners
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Particle class representing a pine triangle
class PineParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 6; // Fixed size for lattice uniformity
        this.baseX = x;
        this.baseY = y;
        this.density = 10;
        this.angle = 0;
        // Black and semi-transparent
        this.color = 'rgba(0, 0, 0, 0.3)'; 
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.beginPath();
        // Draw an upward-pointing triangle (like a simple pine tree)
        ctx.moveTo(0, -this.size * 1.5); // Top peak
        ctx.lineTo(this.size, this.size); // Bottom right
        ctx.lineTo(-this.size, this.size); // Bottom left
        ctx.closePath();
        
        // Solid styling
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.restore();
    }

    update() {
        // Mouse interaction: repulsion
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            // Prevent NaN if distance is 0
            if (distance === 0) distance = 0.1;

            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
                // Add a slight rotation effect when pushed
                this.angle = force * 0.8;
            } else {
                // Return to original angle
                this.angle *= 0.9;
                
                // Slowly return to base position
                if (this.x !== this.baseX) {
                    let dxBase = this.x - this.baseX;
                    this.x -= dxBase / 10;
                }
                if (this.y !== this.baseY) {
                    let dyBase = this.y - this.baseY;
                    this.y -= dyBase / 10;
                }
            }
        } else {
             // Return to original angle if mouse leaves
             this.angle *= 0.9;
             if (this.x !== this.baseX) {
                 let dxBase = this.x - this.baseX;
                 this.x -= dxBase / 10;
             }
             if (this.y !== this.baseY) {
                 let dyBase = this.y - this.baseY;
                 this.y -= dyBase / 10;
             }
        }

        this.draw();
    }
}

function init() {
    particles = [];
    // Create a fixed lattice grid
    for (let y = 0; y < height + spacing; y += spacing) {
        for (let x = 0; x < width + spacing; x += spacing) {
            // Optional: offset every other row for a hex-like grid
            let offsetX = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
            particles.push(new PineParticle(x + offsetX, y));
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
    requestAnimationFrame(animate);
}

// Initial setup
resize();
animate();
