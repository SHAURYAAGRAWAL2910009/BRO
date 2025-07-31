// BRO - Borewell Rescue Operations JavaScript

// Global variables
let userLocation = null;
let map = null;
let marker = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeGPS();
    initializeEventListeners();
    initializeChatbot();
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// GPS and Location Services
function initializeGPS() {
    getCurrentLocation();
}

function getCurrentLocation() {
    const gpsStatus = document.getElementById('gpsStatus');
    
    if (!navigator.geolocation) {
        gpsStatus.textContent = '❌ GPS not supported';
        return;
    }
    
    gpsStatus.textContent = '📍 Getting location...';
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            
            gpsStatus.innerHTML = `✅ Location found: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;
            initializeMap();
        },
        function(error) {
            let errorMessage = '❌ Location unavailable';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '❌ Location access denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '❌ Location unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = '❌ Location timeout';
                    break;
            }
            gpsStatus.textContent = errorMessage;
            
            // Provide manual location option
            gpsStatus.innerHTML += '<br><button class="btn btn--sm btn--outline" onclick="requestLocationPermission()">Try Again</button>';
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

function requestLocationPermission() {
    getCurrentLocation();
}

function initializeMap() {
    const mapContainer = document.getElementById('map');
    
    if (userLocation) {
        mapContainer.innerHTML = `
            <div class="map-content">
                <div class="map-header">
                    <h4>📍 Your Current Location</h4>
                    <div class="coordinates">
                        <strong>Lat:</strong> ${userLocation.latitude.toFixed(6)}<br>
                        <strong>Lng:</strong> ${userLocation.longitude.toFixed(6)}
                    </div>
                </div>
                <div class="map-actions">
                    <button class="btn btn--sm btn--primary" onclick="openGoogleMaps()">
                        📱 Open in Google Maps
                    </button>
                    <button class="btn btn--sm btn--outline" onclick="copyCoordinates()">
                        📋 Copy Coordinates
                    </button>
                </div>
                <div class="location-accuracy">
                    <small>Accuracy: ±${Math.round(userLocation.accuracy)}m</small>
                </div>
            </div>
        `;
        
        // Style the map content
        mapContainer.style.cssText = `
            padding: 20px;
            text-align: center;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
        `;
    }
}

function openGoogleMaps() {
    if (userLocation) {
        const googleMapsUrl = `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;
        window.open(googleMapsUrl, '_blank');
    }
}

function copyCoordinates() {
    if (userLocation) {
        const coordinates = `${userLocation.latitude}, ${userLocation.longitude}`;
        navigator.clipboard.writeText(coordinates).then(() => {
            showNotification('📋 Coordinates copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('❌ Failed to copy coordinates', 'error');
        });
    }
}

// Emergency Functions
function callEmergency(number) {
    if (confirm(`Call emergency number ${number}?`)) {
        // In a real app, this would initiate a call
        window.open(`tel:${number}`, '_self');
        
        // Log the emergency call
        logEmergencyCall(number);
    }
}

function logEmergencyCall(number) {
    const callLog = {
        number: number,
        timestamp: new Date().toISOString(),
        location: userLocation
    };
    
    console.log('Emergency call logged:', callLog);
    showNotification(`📞 Calling ${number}...`, 'info');
}

// Event Listeners
function initializeEventListeners() {
    // Emergency form submission
    const emergencyForm = document.getElementById('emergencyForm');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', handleEmergencySubmission);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
}

function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(var(--color-surface-rgb, 252, 252, 249), 0.98)';
        header.style.backdropFilter = 'blur(20px)';
    } else {
        header.style.background = 'rgba(var(--color-surface-rgb, 252, 252, 249), 0.95)';
        header.style.backdropFilter = 'blur(20px)';
    }
}

// Emergency Form Handling
function handleEmergencySubmission(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        contact: document.getElementById('contact').value,
        location: document.getElementById('location').value,
        details: document.getElementById('details').value,
        gpsCoordinates: userLocation,
        timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!formData.name || !formData.contact) {
        showNotification('❌ Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '📤 Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (in real app, this would send to server/email)
    setTimeout(() => {
        sendEmergencyEmail(formData);
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Clear form
        event.target.reset();
        
        showNotification('✅ Emergency report sent successfully!', 'success');
    }, 2000);
}

function sendEmergencyEmail(formData) {
    // Create email content
    const emailContent = {
        subject: '🚨 EMERGENCY: Borewell Rescue Required',
        body: `
EMERGENCY BOREWELL RESCUE REQUEST

Name: ${formData.name}
Contact: ${formData.contact}
Location Description: ${formData.location || 'Not provided'}
Emergency Details: ${formData.details || 'Not provided'}

GPS COORDINATES:
Latitude: ${formData.gpsCoordinates?.latitude || 'Not available'}
Longitude: ${formData.gpsCoordinates?.longitude || 'Not available'}
Accuracy: ±${formData.gpsCoordinates?.accuracy ? Math.round(formData.gpsCoordinates.accuracy) + 'm' : 'Unknown'}

Google Maps Link: ${formData.gpsCoordinates ? 
    `https://www.google.com/maps?q=${formData.gpsCoordinates.latitude},${formData.gpsCoordinates.longitude}` : 
    'Location not available'}

Timestamp: ${new Date(formData.timestamp).toLocaleString()}

---
This is an automated emergency report from BRO Rescue Operations.
Please respond immediately.
        `
    };
    
    // In a real application, this would integrate with an email service
    console.log('Emergency email prepared:', emailContent);
    
    // For demonstration, create a mailto link
    const mailtoLink = `mailto:emergency@bro-rescue.com?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
}

// Chatbot Functionality
function initializeChatbot() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    chatbot.classList.toggle('active');
    
    if (chatbot.classList.contains('active')) {
        document.getElementById('chatInput').focus();
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatbotMessages');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    chatInput.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const botResponse = generateBotResponse(message);
        addChatMessage(botResponse, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageP = document.createElement('p');
    messageP.textContent = message;
    messageDiv.appendChild(messageP);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('emergency') || message.includes('help') || message.includes('rescue')) {
        return "🚨 For immediate emergencies, call 112 or use our GPS-enabled emergency form. I can help you understand our rescue process and technology.";
    } else if (message.includes('gps') || message.includes('location')) {
        return "📍 Our system uses GPS tracking to pinpoint exact locations. Make sure to allow location access for accurate positioning during emergencies.";
    } else if (message.includes('robot') || message.includes('bro')) {
        return "🤖 BRO is our AI-powered robotic rescue system with advanced arms, live camera feed, oxygen supply, and precision extraction capabilities.";
    } else if (message.includes('team') || message.includes('contact')) {
        return "👥 Our team includes Shaurya Agarwal (Team Captain) and Rohan Jain (Controller) from The Emerald Heights International School - TEAM EM.TECH.";
    } else if (message.includes('how') || message.includes('work')) {
        return "⚙️ BRO works by deploying robotic arms into borewells with live video feed, environmental sensors, and oxygen supply to safely extract victims.";
    } else if (message.includes('features')) {
        return "✨ Key features: Real-time monitoring, multi-functional rescue arm, AI integration, safe extraction protocols, and GPS tracking.";
    } else {
        return "I'm here to help with information about BRO rescue operations, emergency procedures, and our technology. What would you like to know?";
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 16px 20px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        max-width: 300px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add type-specific styling
    if (type === 'success') {
        notification.style.borderColor = 'var(--color-success)';
        notification.style.backgroundColor = 'rgba(var(--color-success-rgb), 0.1)';
        notification.style.color = 'var(--color-success)';
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--color-error)';
        notification.style.backgroundColor = 'rgba(var(--color-error-rgb), 0.1)';
        notification.style.color = 'var(--color-error)';
    } else if (type === 'warning') {
        notification.style.borderColor = 'var(--color-warning)';
        notification.style.backgroundColor = 'rgba(var(--color-warning-rgb), 0.1)';
        notification.style.color = 'var(--color-warning)';
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Allow manual dismissal
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Advanced Features
function initializeAdvancedFeatures() {
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out';
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(animationStyle);
}

// Emergency Location Tracking
function startLocationTracking() {
    if (!navigator.geolocation) {
        showNotification('❌ GPS tracking not supported', 'error');
        return;
    }
    
    const watchId = navigator.geolocation.watchPosition(
        function(position) {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            
            // Update location display
            const gpsStatus = document.getElementById('gpsStatus');
            if (gpsStatus) {
                gpsStatus.innerHTML = `✅ Live tracking: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`;
            }
            
            console.log('Location updated:', userLocation);
        },
        function(error) {
            console.error('Location tracking error:', error);
            showNotification('❌ Location tracking failed', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000
        }
    );
    
    return watchId;
}

// Initialize advanced features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeAdvancedFeatures, 1000);
});

// Error handling
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
});

// Service worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker would be registered here in a full implementation
        console.log('Service Worker support detected');
    });
}