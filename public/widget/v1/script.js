
/**
 * AI Chat Widget Loader Script
 * This is an ultra-lightweight loader script that dynamically injects the main widget script
 */

(function() {
  // Configuration from data attributes
  const script = document.currentScript;
  const widgetId = script.getAttribute('data-widget-id');
  if (!widgetId) {
    console.error('AI Chat Widget: Missing required data-widget-id attribute');
    return;
  }

  // Only initialize once
  if (window.AIChatWidget) {
    return;
  }

  // Base URL for loading resources
  const baseUrl = (function() {
    const scriptSrc = script.src;
    return scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget/v1/'));
  })();
  
  // Track initialization state
  let initialized = false;
  
  // Function to load the full widget script
  const loadWidget = () => {
    if (initialized) return;
    initialized = true;
    
    // Create script element
    const mainScript = document.createElement('script');
    mainScript.src = `${baseUrl}/widget/v1/widget-main.js`;
    mainScript.async = true;
    
    // Copy data attributes from loader script to main script
    Array.from(script.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        mainScript.setAttribute(attr.name, attr.value);
      }
    });
    
    // Handle loading errors
    mainScript.onerror = () => {
      console.error('AI Chat Widget: Failed to load widget script');
      initialized = false;
    };
    
    // Append to document
    document.body.appendChild(mainScript);
  };
  
  // Expose API to window
  window.AIChatWidget = {
    load: loadWidget,
    isLoaded: () => initialized
  };
  
  // Auto-load the widget if not in preload mode
  if (script.getAttribute('data-preload') !== 'true') {
    // Load the widget when page becomes idle or after a short delay
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadWidget, { timeout: 2000 });
    } else {
      setTimeout(loadWidget, 500);
    }
  }
})();
