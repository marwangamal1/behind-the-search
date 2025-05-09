(function () {
  // Create securityWarningManager first so it's available globally in our scope
  const securityWarningManager = {
    activeWarnings: {},
    showWarning(type, message, duration = 0) {
      let el = document.getElementById(`security-warning-${type}`);
      if (el) {
        el.innerHTML = message;
        return el;
      }

      el = document.createElement("div");
      el.id = `security-warning-${type}`;
      this.activeWarnings[type] = el;

      if (type === "fullscreen") {
        Object.assign(el.style, {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(35, 35, 47, 0.96)",
          backdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          zIndex: "99999",
          fontSize: "20px",
          fontWeight: "bold",
        });

        el.innerHTML = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--Error)" stroke-width="2"/>
            <path d="M12 8V12" stroke="var(--Error)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1" fill="var(--Error)"/>
          </svg>
          <p style="margin: 20px 0; max-width: 80%;">${message}</p>
        `;

        const btn = document.createElement("button");
        btn.innerText = "Acknowledge";
        Object.assign(btn.style, {
          marginTop: "20px",
          padding: "10px 20px",
          background: "var(--Error)",
          border: "none",
          borderRadius: "4px",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        });
        btn.addEventListener("click", () => {
          if (!checkDevToolsStatus()) {
            this.hideWarning(type);
          } else {
            showFullscreenWarning("⚠️ Please close DevTools first to continue.");
          }
        });
        el.appendChild(btn);
      } else {
        Object.assign(el.style, {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          padding: "20px",
          background: "var(--Error)",
          color: "white",
          textAlign: "center",
          zIndex: "9999",
          fontSize: "16px",
        });
        el.innerHTML = message;
      }

      document.body.appendChild(el);
      if (duration > 0) setTimeout(() => this.hideWarning(type), duration);
      return el;
    },
    hideWarning(type) {
      const el = document.getElementById(`security-warning-${type}`);
      if (el) {
        el.remove();
        delete this.activeWarnings[type];
      }
    },
    hideAllWarnings() {
      Object.keys(this.activeWarnings).forEach((type) =>
        this.hideWarning(type)
      );
    },
  };

  // Define showFullscreenWarning before it's used
  const showFullscreenWarning = (msg = "Security Alert: Unauthorized action detected.") => {
    return securityWarningManager.showWarning("fullscreen", msg);
  };

  // Make these available to the window scope
  window.securityWarningManager = securityWarningManager;
  window.showFullscreenWarning = showFullscreenWarning;

  const logSecurityEvent = async (type, description) => {
    try {
      const response = await fetch('/users/api/log-security-event/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, description })
      });
      return await response.json();
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const applyNoBlur = () => {
    document.documentElement.style.filter = "none";
    if (document.body) document.body.style.filter = "none";
  };

  const checkDevToolsStatus = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    const devToolsOpen = widthThreshold || heightThreshold;

    if (devToolsOpen) {
      logSecurityEvent("devtools", "DevTools detected on page load");
      // showFullscreenWarning("⚠️ DevTools must be closed to access this site.");
      return true;
    }
    return false;
  };

  // Apply initial styles and checks
  applyNoBlur();

  // Inject style to override any blur filters
  const noBlurStyle = document.createElement("style");
  noBlurStyle.textContent = `
    html, body {
      filter: none !important;
      -webkit-filter: none !important;
    }
  `;
  document.head.appendChild(noBlurStyle);

  try {
    sessionStorage.removeItem("devToolsDetected");
  } catch {}

  // Check immediately when script loads
  if (checkDevToolsStatus()) {
    document.documentElement.style.visibility = 'hidden';
    window.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.visibility = '';
    });
  }
  const onDOMReady = () => {
    // Initial check on page load
    checkDevToolsStatus();

    // Regular interval check - without showing fullscreen warning
    setInterval(() => {
      checkDevToolsStatus();
    }, 1000);    // Prevent right-click
    document.addEventListener("contextmenu", (e) => {
      const tag = e.target.tagName;
      if (["INPUT", "TEXTAREA"].includes(tag) || (tag === "A" && e.target.href))
        return;
      e.preventDefault();
      checkDevToolsStatus(); // Just check but don't show warning
    });

    // Prevent text selection
    document.querySelectorAll(".protect-content").forEach((el) => {
      Object.assign(el.style, {
        userSelect: "none",
        webkitUserSelect: "none",
        msUserSelect: "none",
        mozUserSelect: "none",
      });
    });

    // Block copy/cut
    ["copy", "cut"].forEach((evt) => {
      document.addEventListener(evt, (e) => {
        if (!e.target.closest(".allow-copy")) e.preventDefault();
      });
    });

    // Prevent dev tools shortcuts
    document.addEventListener("keydown", (e) => {
      const blockedKeys = [
        [123],
        [17, 73],
        [17, 74],
        [17, 67],
        [17, 85],
        [17, 83],
        [17, 16, 83],
      ];
      const keyCombo = [e.ctrlKey && 17, e.shiftKey && 16, e.keyCode].filter(
        Boolean
      );
      if (blockedKeys.some((k) => k.every((code) => keyCombo.includes(code))))
        e.preventDefault();

      if (
        e.ctrlKey &&
        [67, 86, 88].includes(e.keyCode) &&
        ["INPUT", "TEXTAREA"].includes(e.target.tagName)
      )
        return true;
    });

    // Screenshot detection
    document.addEventListener("keyup", (e) => {
      if (e.key === "PrintScreen") {
        logSecurityEvent("screenshot", "Screen capture attempt detected");
        showFullscreenWarning("Screen capture detected. This action has been logged.");
      }
    });

    // Security event handling
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      // Ctrl + S
      if (key === "s" && event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        logSecurityEvent("save_attempt", "Page save attempt (Ctrl + S)");
        showFullscreenWarning("⚠️ Attempted to save the page (Ctrl + S). Logged.");
      }

      // Ctrl + P (Print)
      if (key === "p" && event.ctrlKey) {
        event.preventDefault();
        logSecurityEvent("print_attempt", "Print command detected (Ctrl + P)");
        showFullscreenWarning("⚠️ Print command detected (Ctrl + P). Logged.");
      }      // Ctrl + Shift + I (DevTools)
      if (key === "i" && event.ctrlKey && event.shiftKey) {
        event.preventDefault();
        logSecurityEvent("devtools", "DevTools access attempt (Ctrl + Shift + I)");
        // DevTools warning removed to fix iPhone issues
      }
      
      // F12 (DevTools)
      if (event.key === "F12") {
        event.preventDefault();
        logSecurityEvent("devtools", "DevTools access attempt (F12)");
        // DevTools warning removed to fix iPhone issues
      }
    });

    // Detect screen recording
    if (navigator.mediaDevices?.getDisplayMedia) {
      const original = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = function (constraints) {
        logSecurityEvent("screen_recording", "Screen recording attempt detected");
        showFullscreenWarning("Screen recording attempt detected. This has been logged.");
        return original.call(this, constraints);
      };
    }

    // Prevent image dragging
    document.querySelectorAll("img:not(.allow-save)").forEach((img) => {
      img.addEventListener("dragstart", (e) => e.preventDefault());
      Object.assign(img.style, {
        webkitUserDrag: "none",
        userDrag: "none",
        webkitTouchCallout: "none",
      });
    });

    setTimeout(() => devToolsDetector.check(), 2000);    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      applyNoBlur();
      checkDevToolsStatus(); // Just check but don't show warning
      resizeTimeout = setTimeout(() => devToolsDetector.check(), 500);
    });

    setInterval(() => {
      if (!devToolsDetector.isOpen) applyNoBlur();
    }, 5000);

    console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold;");
    console.log("%cThis is a protected website.", "font-size: 20px;");
    console.log("%cContent is protected by copyright law.", "font-size: 15px;");
  };
  // Add load event listener
  window.addEventListener('load', () => {
    checkDevToolsStatus(); // Just check without showing warning
  });

  document.addEventListener("DOMContentLoaded", onDOMReady);

  window.addEventListener("focus", () => {
    applyNoBlur();
    if (!checkDevToolsStatus()) {
      window.securityWarningManager?.hideWarning("devtools");
    }
  });
})();
