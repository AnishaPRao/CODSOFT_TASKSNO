/**
 * PORTFOLIO INTERACTIVE JAVASCRIPT
 * Developer: Anisha P Rao | CodSoft Task 1
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Theme Switcher (Dark / Light Mode)
    // --------------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load persisted theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn?.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        showToast(`Switched to ${newTheme} theme`, 'info');
    });

    // --------------------------------------------------------------------------
    // 2. Mobile Navigation Hamburger Menu Toggle
    // --------------------------------------------------------------------------
    const mobileToggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggleBtn && navMenu) {
        mobileToggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            mobileToggleBtn.classList.toggle('active');
        });

        // Close menu when clicking outside or clicking any nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggleBtn.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                mobileToggleBtn.classList.remove('active');
            }
        });
    }

    // --------------------------------------------------------------------------
    // 3. Navbar Scroll Shadow & ScrollSpy Active Link Tracking
    // --------------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar blur shift
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (scrollY > 400) {
            backToTopBtn?.classList.add('visible');
        } else {
            backToTopBtn?.classList.remove('visible');
        }

        // ScrollSpy logic
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href*="${sectionId}"]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[href*="${sectionId}"]`)?.classList.remove('active');
            }
        });
    });

    backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --------------------------------------------------------------------------
    // 4. Stat Counter Up Animation
    // --------------------------------------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    function animateStats() {
        statNumbers.forEach(stat => {
            const targetAttr = stat.getAttribute('data-target');
            const target = parseInt(targetAttr, 10) || 5;
            const suffix = stat.innerText.includes('%') ? '%' : '+';
            let count = 0;
            const speed = Math.max(1, target / 30); // speed step

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    stat.innerText = Math.ceil(count) + suffix;
                    setTimeout(updateCount, 40);
                } else {
                    stat.innerText = target + suffix;
                }
            };
            updateCount();
        });
    }

    // Intersection Observer for Stats Counter
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !animated) {
                animateStats();
                animated = true;
            }
        }, { threshold: 0.4 });
        statsObserver.observe(heroSection);
    }

    // --------------------------------------------------------------------------
    // 5. Skill Bars Intersection Observer Fill Animation
    // --------------------------------------------------------------------------
    const skillFills = document.querySelectorAll('.progress-bar-fill');
    const skillsSection = document.getElementById('skills');

    if (skillsSection && skillFills.length > 0) {
        const skillsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                skillFills.forEach(fill => {
                    const progress = fill.getAttribute('data-progress');
                    fill.style.width = progress;
                });
            }
        }, { threshold: 0.3 });

        skillsObserver.observe(skillsSection);
    }

    // --------------------------------------------------------------------------
    // 6. Project Category Filter Logic
    // --------------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || filterValue === category) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    setTimeout(() => { card.style.opacity = '1'; }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --------------------------------------------------------------------------
    // 7. Interactive Project Details Modal
    // --------------------------------------------------------------------------
    const projectData = {
        '1': {
            title: 'Student Performance Analytics System',
            category: 'Web Application / Analytics',
            image: 'assets/project_1.svg',
            description: 'A comprehensive data-driven web application designed to track, analyze, and visualize student academic performance metrics, grade distributions, and progress reports.',
            tech: ['Java', 'Python', 'SQL', 'HTML/CSS'],
            features: [
                'Student academic performance metric tracking',
                'Visual grade charts & report generation',
                'SQL database integration for persistent student records',
                'Clean responsive dashboard interface'
            ],
            github: 'https://github.com/AnishaPRao',
            demo: 'https://github.com/AnishaPRao'
        },
        '2': {
            title: 'Online Quiz Platform',
            category: 'Web Application / Interactive UI',
            image: 'assets/project_2.svg',
            description: 'An interactive web portal enabling users to take timed quizzes, receive instant score reports, and review test answer keys.',
            tech: ['HTML5', 'CSS3', 'JavaScript', 'SQL'],
            features: [
                'Interactive timed examination interface',
                'Instant score calculation and feedback',
                'Database integration for quiz questions',
                'Responsive layout optimized for mobile and desktop'
            ],
            github: 'https://github.com/AnishaPRao',
            demo: 'https://github.com/AnishaPRao'
        },
        '3': {
            title: 'CodSoft Internship Tasks',
            category: 'Frontend Development & UI Design',
            image: 'assets/project_3.svg',
            description: 'A suite of modern, responsive web applications built for the CodSoft Frontend Development Internship featuring dark theme engines, animation, and client-side validation.',
            tech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive Design'],
            features: [
                'Modern glassmorphism UI design system',
                'Dark/Light theme toggle with localStorage persistence',
                'Interactive project category filter & modal views',
                'Real-time form validation & notification toast system'
            ],
            github: 'https://github.com/AnishaPRao',
            demo: 'https://github.com/AnishaPRao'
        }
    };

    const projectModal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');
    const viewDetailBtns = document.querySelectorAll('.view-details-btn');

    function openModal(projectId) {
        const data = projectData[projectId];
        if (!data || !modalBody || !projectModal) return;

        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <span class="tag" style="margin-bottom: 10px; display: inline-block;">${data.category}</span>
                <h2 style="font-size: 1.8rem; margin-bottom: 14px;">${data.title}</h2>
                <img src="${data.image}" alt="${data.title}" style="width: 100%; max-height: 320px; object-fit: fill; border-radius: var(--radius-md); margin-bottom: 20px;" onerror="this.src='assets/project_' + projectId + '.svg';">
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.95rem;">${data.description}</p>
            
            <h4 style="margin-bottom: 10px;">Key Features:</h4>
            <ul style="list-style: disc; padding-left: 20px; margin-bottom: 20px; color: var(--text-secondary); font-size: 0.9rem;">
                ${data.features.map(f => `<li>${f}</li>`).join('')}
            </ul>

            <h4 style="margin-bottom: 10px;">Tech Stack Used:</h4>
            <div class="project-tags" style="margin-bottom: 24px;">
                ${data.tech.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>

            <div style="display: flex; gap: 14px;">
                <a href="${data.github}" target="_blank" class="btn btn-outline btn-sm">
                    <i class="fa-brands fa-github"></i> Source Code
                </a>
                <a href="#contact" onclick="document.getElementById('project-modal').classList.remove('open');" class="btn btn-primary btn-sm">
                    <i class="fa-solid fa-paper-plane"></i> Discuss This Project
                </a>
            </div>
        `;

        projectModal.classList.add('open');
        projectModal.setAttribute('aria-hidden', 'false');
    }

    viewDetailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project');
            openModal(projectId);
        });
    });

    modalCloseBtn?.addEventListener('click', () => {
        projectModal?.classList.remove('open');
        projectModal?.setAttribute('aria-hidden', 'true');
    });

    projectModal?.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.classList.remove('open');
            projectModal.setAttribute('aria-hidden', 'true');
        }
    });

    // --------------------------------------------------------------------------
    // 8. Contact Form Client-Side Validation
    // --------------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const messageInput = document.getElementById('user-message');

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    function setFieldState(inputElement, isSuccess) {
        const group = inputElement.closest('.form-group');
        if (!group) return;
        
        if (isSuccess) {
            group.classList.remove('error');
            group.classList.add('success');
        } else {
            group.classList.remove('success');
            group.classList.add('error');
        }
    }

    // Real-time listener for name
    nameInput?.addEventListener('input', () => {
        if (nameInput.value.trim().length >= 2) {
            setFieldState(nameInput, true);
        } else {
            setFieldState(nameInput, false);
        }
    });

    // Real-time listener for email
    emailInput?.addEventListener('input', () => {
        if (validateEmail(emailInput.value.trim())) {
            setFieldState(emailInput, true);
        } else {
            setFieldState(emailInput, false);
        }
    });

    // Real-time listener for message
    messageInput?.addEventListener('input', () => {
        if (messageInput.value.trim().length >= 10) {
            setFieldState(messageInput, true);
        } else {
            setFieldState(messageInput, false);
        }
    });

    // Form Submission Event
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = nameInput.value.trim().length >= 2;
        const isEmailValid = validateEmail(emailInput.value.trim());
        const isMessageValid = messageInput.value.trim().length >= 10;

        setFieldState(nameInput, isNameValid);
        setFieldState(emailInput, isEmailValid);
        setFieldState(messageInput, isMessageValid);

        if (isNameValid && isEmailValid && isMessageValid) {
            showToast('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
            
            // Clear success status rings
            document.querySelectorAll('.form-group').forEach(g => {
                g.classList.remove('success', 'error');
            });
        } else {
            showToast('Please fix the errors in the form before submitting.', 'error');
        }
    });

    // --------------------------------------------------------------------------
    // 9. Download Resume CV Toast Trigger
    // --------------------------------------------------------------------------
    const downloadCvBtns = [
        document.querySelector('.nav-cv-btn'),
        document.getElementById('hero-download-cv'),
        document.getElementById('resume-section-download')
    ];

    downloadCvBtns.forEach(btn => {
        btn?.addEventListener('click', () => {
            showToast('Downloading Anisha P Rao Resume (PDF)...', 'info');
        });
    });

    // --------------------------------------------------------------------------
    // 10. Toast Notification Manager
    // --------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
});
