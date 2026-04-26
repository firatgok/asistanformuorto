// Anti-Copy Protection
(function() {
    'use strict';
    
    // Disable right-click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function(e) {
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
            (e.ctrlKey && e.keyCode === 85) // Ctrl+U
        ) {
            e.preventDefault();
            return false;
        }
    });
    
    // DevTools detection
    const devtools = {
        isOpen: false,
        orientation: null
    };
    
    const threshold = 160;
    const emitEvent = (isOpen, orientation) => {
        window.dispatchEvent(new CustomEvent('devtoolschange', {
            detail: { isOpen, orientation }
        }));
    };
    
    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        const orientation = widthThreshold ? 'vertical' : 'horizontal';
        
        if (!(heightThreshold && widthThreshold) &&
            ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
            if (!devtools.isOpen || devtools.orientation !== orientation) {
                emitEvent(true, orientation);
                devtools.isOpen = true;
                devtools.orientation = orientation;
                // Redirect or disable functionality
                document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:Arial;"><h1>Developer tools detected. Please close to continue.</h1></div>';
            }
        } else {
            if (devtools.isOpen) {
                emitEvent(false, null);
                devtools.isOpen = false;
                devtools.orientation = null;
            }
        }
    }, 500);
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable copy
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable cut
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable drag
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Console.log override (hide console messages)
    console.log = function() {};
    console.warn = function() {};
    console.error = function() {};
    console.info = function() {};
    console.debug = function() {};
    
    // Copyright notice
    const copyright = '\n\n© 2024-2026 Ortodonti Form Yazılımı - Tüm Hakları Saklıdır\nYetkisiz kullanım, kopyalama ve dağıtım yasaktır.\n\n';
    console.log('%c' + copyright, 'color: red; font-weight: bold; font-size: 14px;');
    
})();
