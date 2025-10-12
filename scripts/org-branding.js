// ===== ORGANIZATION BRANDING SYSTEM =====
// This script fetches organization settings and applies branding across all pages

console.log('🎨 Organization Branding System initializing...');

const BRANDING_API_URL = window.API_BASE_URL || 'https://studentevents-production.up.railway.app';

// Default branding
const DEFAULT_BRANDING = {
    org_name: 'StudentEvents',
    org_logo_url: '',
    org_primary_color: '#0055de',
    support_phone: '+370 600 00000',
    support_hours: 'Mon-Fri 9:00-17:00',
    support_email: 'support@studentevents.com'
};

// Cache for branding data
let brandingCache = null;

// Fetch branding settings from API
async function fetchBrandingSettings() {
    if (brandingCache) {
        return brandingCache;
    }

    try {
        console.log('🔄 Fetching organization branding settings...');
        const response = await fetch(`${BRANDING_API_URL}/api/settings`);
        
        if (!response.ok) {
            console.warn('⚠️ Failed to fetch branding settings, using defaults');
            return DEFAULT_BRANDING;
        }

        const settings = await response.json();
        console.log('✅ Branding settings loaded:', settings);

        // Map settings array to branding object
        const branding = {
            org_name: settings.find(s => s.key === 'org_name')?.value || DEFAULT_BRANDING.org_name,
            org_logo_url: settings.find(s => s.key === 'org_logo_url')?.value || DEFAULT_BRANDING.org_logo_url,
            org_primary_color: settings.find(s => s.key === 'org_primary_color')?.value || DEFAULT_BRANDING.org_primary_color,
            support_phone: settings.find(s => s.key === 'supportPhone')?.value || DEFAULT_BRANDING.support_phone,
            support_hours: settings.find(s => s.key === 'supportWorkingHours')?.value || DEFAULT_BRANDING.support_hours,
            support_email: settings.find(s => s.key === 'supportEmail')?.value || DEFAULT_BRANDING.support_email
        };

        brandingCache = branding;
        return branding;
    } catch (error) {
        console.error('❌ Error fetching branding settings:', error);
        return DEFAULT_BRANDING;
    }
}

// Apply branding to the current page
async function applyBranding() {
    try {
        const branding = await fetchBrandingSettings();
        
        console.log('🎨 Applying branding to page...');

        // 1. Replace organization name
        replaceOrgName(branding.org_name);

        // 2. Update page title
        updatePageTitle(branding.org_name);

        // 3. Apply logo if provided
        if (branding.org_logo_url) {
            applyLogo(branding.org_logo_url);
        }

        // 4. Apply primary color if provided
        if (branding.org_primary_color && branding.org_primary_color !== DEFAULT_BRANDING.org_primary_color) {
            applyPrimaryColor(branding.org_primary_color);
        }

        // 5. Update support contact info
        updateSupportInfo(branding);

        console.log('✅ Branding applied successfully');
    } catch (error) {
        console.error('❌ Error applying branding:', error);
    }
}

// Replace "StudentEvents" with organization name
function replaceOrgName(orgName) {
    // Find all text nodes and replace "StudentEvents"
    const textNodes = getTextNodes(document.body);
    
    textNodes.forEach(node => {
        if (node.nodeValue && node.nodeValue.includes('StudentEvents')) {
            node.nodeValue = node.nodeValue.replace(/StudentEvents/g, orgName);
        }
    });

    // Update elements with data-org-name attribute
    document.querySelectorAll('[data-org-name]').forEach(el => {
        el.textContent = orgName;
    });

    // Update specific elements by class
    document.querySelectorAll('.org-name, .organization-name').forEach(el => {
        el.textContent = orgName;
    });

    console.log(`✅ Organization name updated to: ${orgName}`);
}

// Update page title
function updatePageTitle(orgName) {
    if (document.title.includes('StudentEvents')) {
        document.title = document.title.replace(/StudentEvents/g, orgName);
        console.log(`✅ Page title updated: ${document.title}`);
    }
}

// Apply organization logo
function applyLogo(logoUrl) {
    // Find logo elements
    document.querySelectorAll('.logo img, .org-logo, [data-org-logo]').forEach(img => {
        img.src = logoUrl;
        img.alt = 'Organization Logo';
    });

    // If logo container exists but no image, create one
    document.querySelectorAll('.logo:not(:has(img))').forEach(logoContainer => {
        const img = document.createElement('img');
        img.src = logoUrl;
        img.alt = 'Organization Logo';
        img.style.maxHeight = '40px';
        logoContainer.prepend(img);
    });

    console.log(`✅ Logo applied: ${logoUrl}`);
}

// Apply primary color to the page
function applyPrimaryColor(color) {
    // Update CSS variables
    document.documentElement.style.setProperty('--primary-500', color);
    document.documentElement.style.setProperty('--primary-color', color);

    // Update specific elements
    document.querySelectorAll('.btn-primary, .primary-bg').forEach(el => {
        el.style.backgroundColor = color;
    });

    console.log(`✅ Primary color applied: ${color}`);
}

// Update support contact information
function updateSupportInfo(branding) {
    // Update email
    document.querySelectorAll('.support-email, [data-support-email]').forEach(el => {
        if (el.tagName === 'A') {
            el.href = `mailto:${branding.support_email}`;
            el.textContent = branding.support_email;
        } else {
            el.textContent = branding.support_email;
        }
    });

    // Update phone
    document.querySelectorAll('.support-phone, [data-support-phone]').forEach(el => {
        if (el.tagName === 'A') {
            el.href = `tel:${branding.support_phone}`;
            el.textContent = branding.support_phone;
        } else {
            el.textContent = branding.support_phone;
        }
    });

    // Update working hours
    document.querySelectorAll('.support-hours, [data-support-hours]').forEach(el => {
        el.textContent = branding.support_hours;
    });

    console.log('✅ Support contact info updated');
}

// Helper: Get all text nodes in a DOM tree
function getTextNodes(node) {
    const textNodes = [];
    const walk = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip script and style tags
                if (node.parentNode.tagName === 'SCRIPT' || 
                    node.parentNode.tagName === 'STYLE' ||
                    node.nodeValue.trim() === '') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentNode;
    while (currentNode = walk.nextNode()) {
        textNodes.push(currentNode);
    }

    return textNodes;
}

// Export functions for manual use
window.OrgBranding = {
    fetch: fetchBrandingSettings,
    apply: applyBranding,
    cache: () => brandingCache
};

// Auto-apply branding when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBranding);
} else {
    applyBranding();
}

console.log('✅ Organization Branding System loaded');

