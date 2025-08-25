// script.js

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Command copy functionality
    document.querySelectorAll('pre code').forEach(block => {
        // Create copy button
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        
        // Add button to pre element
        block.parentNode.appendChild(button);

        // Add click handler
        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                // Reset button text after 2 seconds
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                button.textContent = 'Failed to copy';
            }
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Add expand/collapse functionality for solution steps
    document.querySelectorAll('.card-content').forEach(content => {
        const header = content.previousElementSibling;
        if (header) {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                content.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
            });
        }
    });

    // Add tooltips for commands
    document.querySelectorAll('.command-card pre').forEach(command => {
        command.setAttribute('title', 'Click to copy command');
    });

    // Add dynamic status indicator
    function updateStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator';
        indicator.innerHTML = `
            <div class="status-dot online"></div>
            <span>Guide Status: Online</span>
        `;
        document.querySelector('.hero-content').appendChild(indicator);
    }
    updateStatusIndicator();

    // Add animation for cards on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
        card.classList.add('fade-in');
    });
});

// Add to your CSS (in index.html style section):
/*
.copy-button {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 5px 10px;
    background: #232f3e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.copy-button.copied {
    background: #00cc00;
}

.fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.status-dot.online {
    background: #00cc00;
    box-shadow: 0 0 8px #00cc00;
}

pre {
    position: relative;
}
*/
