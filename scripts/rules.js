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
    
    async loadPolicyTexts() {
        try {
            const API_BASE_URL = window.CONFIG?.API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
            const response = await fetch(`${API_BASE_URL}/api/policy`);
            
            if (response.ok) {
                const policy = await response.json();
                console.log('📄 Policy loaded from API:', policy);
                
                // Handle both old and new structure
                const metadata = policy.metadata || { version: policy.version, lastUpdated: policy.lastUpdated };
                const sections = policy.sections || [];
                
                // Update version and date
                const versionBadge = document.querySelector('.version-badge');
                const lastUpdated = document.querySelector('.last-updated');
                if (versionBadge) versionBadge.textContent = `Version ${metadata.version}`;
                if (lastUpdated) {
                    const date = new Date(metadata.lastUpdated);
                    lastUpdated.textContent = `Last updated: ${date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}`;
                }
                
                // Update sections - new structure
                if (sections.length > 0) {
                    sections.forEach(section => {
                        if (section.visible) {
                            this.updateSection(section.id, section.content);
                        }
                    });
                } else {
                    // Fallback for old structure
                    this.updateSection('terms-of-service', policy.termsOfService);
                    this.updateSection('privacy-policy', policy.privacyPolicy);
                    this.updateSection('event-guidelines', policy.eventGuidelines);
                    this.updateSection('ticket-policy', policy.ticketPolicy);
                    this.updateSection('refund-policy', policy.refundPolicy);
                    this.updateSection('code-of-conduct', policy.codeOfConduct);
                }
            } else {
                console.warn('Failed to load policy from API, using default content');
            }
        } catch (error) {
            console.error('Error loading policy texts:', error);
            // Keep default hardcoded content if API fails
        }
    }
    
    updateSection(sectionId, content) {
        if (!content) return;
        
        const section = document.querySelector(`#${sectionId} .section-content`);
        if (section) {
            // Preserve the section structure but update the first paragraph
            const firstP = section.querySelector('p');
            if (firstP) {
                firstP.textContent = content;
            } else {
                // If no paragraph exists, create one
                const p = document.createElement('p');
                p.textContent = content;
                section.insertBefore(p, section.firstChild);
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
