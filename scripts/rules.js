// ===== RULES & POLICY PAGE JAVASCRIPT =====

class RulesPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupTableOfContents();
        this.setupPrintFunctionality();
        this.trackReadingProgress();
        this.loadContactInfo();
        this.loadPolicyTexts();
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for table of contents links
        const tocLinks = document.querySelectorAll('.toc-link');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const offset = 20; // Additional offset for better visibility
                    const targetPosition = targetElement.offsetTop - headerHeight - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without triggering scroll
                    history.pushState(null, null, `#${targetId}`);
                    
                    // Add focus to target section for accessibility
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    
                    // Remove tabindex after focus
                    setTimeout(() => {
                        targetElement.removeAttribute('tabindex');
                    }, 100);
                }
            });
        });
    }

    setupTableOfContents() {
        // Highlight current section in table of contents
        const sections = document.querySelectorAll('.policy-section');
        const tocLinks = document.querySelectorAll('.toc-link');
        
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    
                    // Remove active class from all TOC links
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Add active class to current section's TOC link
                    const currentTocLink = document.querySelector(`.toc-link[href="#${sectionId}"]`);
                    if (currentTocLink) {
                        currentTocLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupPrintFunctionality() {
        // Add print styles and functionality
        const printButton = document.createElement('button');
        printButton.className = 'btn btn-secondary';
        printButton.innerHTML = '<i class="fas fa-print"></i> Print Policy';
        printButton.onclick = () => this.printPolicy();
        
        // Add print button to page header
        const policyVersion = document.querySelector('.policy-version');
        if (policyVersion) {
            policyVersion.appendChild(printButton);
        }
    }

    printPolicy() {
        // Optimize page for printing
        const originalTitle = document.title;
        document.title = 'StudentEvents - Rules & Policy';
        
        // Print the page
        window.print();
        
        // Restore original title
        document.title = originalTitle;
    }

    trackReadingProgress() {
        // Create reading progress indicator
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
        
        // Add styles for progress bar
        const styles = document.createElement('style');
        styles.textContent = `
            .reading-progress {
                position: fixed;
                top: 64px;
                left: 0;
                width: 100%;
                height: 3px;
                background-color: rgba(99, 102, 241, 0.1);
                z-index: 99;
                transition: opacity 0.3s ease;
            }
            
            .reading-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-500) 0%, var(--secondary-500) 100%);
                width: 0%;
                transition: width 0.1s ease;
            }
            
            @media print {
                .reading-progress {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(progressBar);
        
        // Update progress on scroll
        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressBarElement = progressBar.querySelector('.reading-progress-bar');
            progressBarElement.style.width = Math.min(scrollPercent, 100) + '%';
            
            // Hide progress bar when at top
            progressBar.style.opacity = scrollTop > 100 ? '1' : '0';
        };
        
        window.addEventListener('scroll', updateProgress);
        updateProgress(); // Initial call
    }

    // Utility method to copy section link
    copySectionLink(sectionId) {
        const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                EventTicketingApp.showNotification('Section link copied to clipboard', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(url);
            });
        } else {
            this.fallbackCopyToClipboard(url);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            EventTicketingApp.showNotification('Section link copied to clipboard', 'success');
        } catch (err) {
            EventTicketingApp.showNotification('Unable to copy link', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Search functionality for policy content
    searchPolicy(query) {
        if (!query || query.length < 3) {
            this.clearSearchHighlights();
            return;
        }
        
        const sections = document.querySelectorAll('.section-content');
        let matchCount = 0;
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (text.includes(searchTerm)) {
                matchCount++;
                // Highlight matching text (simplified implementation)
                this.highlightText(section, searchTerm);
            }
        });
        
        if (matchCount > 0) {
            EventTicketingApp.showNotification(`Found ${matchCount} section(s) matching "${query}"`, 'info');
        } else {
            EventTicketingApp.showNotification(`No matches found for "${query}"`, 'info');
        }
    }

    highlightText(element, searchTerm) {
        // Simple text highlighting (in a real implementation, you'd use a more robust solution)
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(searchTerm)) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            const text = textNode.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
            
            const wrapper = document.createElement('span');
            wrapper.innerHTML = highlightedText;
            parent.replaceChild(wrapper, textNode);
        });
    }

    clearSearchHighlights() {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }
    
    loadContactInfo() {
        // Load contact information from localStorage (set by admin)
        const contactEmail = localStorage.getItem('contactEmail');
        const contactPhone = localStorage.getItem('contactPhone');
        
        if (contactEmail) {
            // Update email in contact section
            const emailElements = document.querySelectorAll('#contact-info [href*="mailto:"]');
            emailElements.forEach(element => {
                element.href = `mailto:${contactEmail}`;
                element.textContent = contactEmail;
            });
        }
        
        if (contactPhone) {
            // Update phone in contact section
            const phoneElements = document.querySelectorAll('#contact-info [href*="tel:"]');
            phoneElements.forEach(element => {
                element.href = `tel:${contactPhone}`;
                element.textContent = contactPhone;
            });
        }
    }
    
    loadPolicyTexts() {
        // Load policy texts from localStorage (set by admin)
        const privacyPolicyText = localStorage.getItem('privacyPolicyText');
        const refundPolicyText = localStorage.getItem('refundPolicyText');
        const termsOfServiceText = localStorage.getItem('termsOfServiceText');
        
        if (privacyPolicyText) {
            // Update privacy policy section
            const privacySection = document.querySelector('#privacy-policy .section-content p');
            if (privacySection) {
                privacySection.textContent = privacyPolicyText;
            }
        }
        
        if (refundPolicyText) {
            // Update refund policy section
            const refundSection = document.querySelector('#refund-policy .section-content p');
            if (refundSection) {
                refundSection.textContent = refundPolicyText;
            }
        }
        
        if (termsOfServiceText) {
            // Update terms of service section
            const termsSection = document.querySelector('#code-of-conduct .section-content p');
            if (termsSection) {
                termsSection.textContent = termsOfServiceText;
            }
        }
    }
}

// Initialize rules page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rulesPage = new RulesPage();
    
    // Handle direct links to sections (from URL hash)
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const offset = 20;
                const targetPosition = targetElement.offsetTop - headerHeight - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
});
