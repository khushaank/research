document.addEventListener("DOMContentLoaded", async () => {
  // === 1. SUPABASE CLIENT & CONSTANTS ===
  const SUPABASE_URL = "https://lhuqfvfornizpiahesyi.supabase.co";
  const SUPABASE_KEY = "sb_publishable_q-v2zqt3ER-BkB88HJVPTQ_157odZJe";
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const PROTECTED_LINKS = [
    "research.html",
    "give-feedback.html",
    "account-settings.html",
    "notifications.html",
  ];
  const FAVICON_LIGHT = "White_KGR.png";
  const FAVICON_DARK = "Black_KGR.png";

  // === 2. UTILITIES ===
  function safeFeatherReplace() {
    try {
      if (window.feather && typeof window.feather.replace === "function") {
        window.feather.replace();
      }
    } catch (e) {
      console.warn("feather.replace failed:", e);
    }
  }

  function escapeHtml(s) {
    if (!s && s !== 0) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Utility: ensures the given user has a profile row.
   * This prevents race conditions where an auth user is created but their profile row isn't yet.
   */
  async function ensureProfileRow(user) {
    if (!user || !user.id) return;
    try {
      const { data: existing } = await supabaseClient
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      if (!existing) {
        const { error: insErr } = await supabaseClient.from("profiles").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
        });
        if (insErr) {
          console.warn("profiles insert warning:", insErr.message || insErr);
        }
      }
    } catch (err) {
      console.error("ensureProfileRow error:", err);
    }
  }

  // === 3. THEME LOGIC ===
  function applyTheme(theme) {
    const htmlEl = document.documentElement;
    const classes = ["light-theme", "dark-theme", "black-theme"];
    htmlEl.classList.remove(...classes);
    htmlEl.classList.add(theme);

    const currentRadio = document.getElementById(theme);
    if (currentRadio) currentRadio.checked = true;

    const favicon = document.getElementById("favicon");
    if (favicon) {
      favicon.href = theme === "light-theme" ? FAVICON_LIGHT : FAVICON_DARK;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.warn("localStorage is not available.", e);
    }
  }

  function loadTheme() {
    const t = localStorage.getItem("theme") || "dark-theme";
    applyTheme(t);
  }

  function setupThemeSwitcher() {
    const themeRadios = document.getElementsByName("themes");
    themeRadios.forEach((r) =>
      r.addEventListener("change", function () {
        applyTheme(this.id);
        saveTheme(this.id);
      })
    );
  }

  // === 4. UI UPDATE LOGIC ===
  async function updateAuthUI(session) {
    const authContainer = document.getElementById("auth-link-container");
    if (!authContainer) return;

    if (session) {
      authContainer.innerHTML = `<a href="#" id="menu-logout-button" style="color:#dc3545;"><i data-feather="log-out"></i>Logout</a>`;
      safeFeatherReplace();
      const logoutBtn = document.getElementById("menu-logout-button");
      logoutBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
      });
    } else {
      authContainer.innerHTML = `<a href="auth.html"><i data-feather="log-in"></i>Login / Sign Up</a>`;
      safeFeatherReplace();
    }
  }

  async function updateNotificationBadge(session) {
    const badge = document.getElementById("notification-badge");
    if (!badge || !session) return;

    const { count, error } = await supabaseClient
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      console.warn("updateNotificationBadge error:", error.message || error);
      return;
    }

    if (count && count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  // === 5. CORE PAGE INITIALIZATION ===
  async function loadHeaderAndFooter() {
    const hp = document.getElementById("header-placeholder");
    const fp = document.getElementById("footer-placeholder");

    if (hp) {
      const headerText = await fetch("fragments/header.html").then((r) =>
        r.text()
      );
      hp.innerHTML = headerText;
    }
    if (fp) {
      const footerText = await fetch("fragments/footer.html").then((r) =>
        r.text()
      );
      fp.innerHTML = footerText;
    }
    safeFeatherReplace();
  }

  async function initializeHeader() {
    loadTheme();
    setupThemeSwitcher();
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    updateAuthUI(session);
    updateNotificationBadge(session);
    setupProtectedLinks();

    const menuCheckbox = document.getElementById("menuCheckbox");
    const mainContent = document.querySelector("main");
    if (menuCheckbox && mainContent) {
      menuCheckbox.addEventListener("change", () => {
        if (menuCheckbox.checked) {
          mainContent.addEventListener(
            "click",
            () => {
              menuCheckbox.checked = false;
            },
            { once: true }
          );
        }
      });
    }
  }

  async function setupProtectedLinks() {
    const modal = document.getElementById("access-modal");
    if (!modal) return;

    document.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && PROTECTED_LINKS.includes(href)) {
        link.addEventListener("click", async (e) => {
          e.preventDefault();
          const {
            data: { session },
          } = await supabaseClient.auth.getSession();
          if (session) {
            window.location.href = href;
          } else {
            const modalTitle = document.getElementById("modal-title");
            const modalMessage = document.getElementById("modal-message");
            const modalLoginBtn = document.getElementById("modal-login-btn");

            if (href.includes("research.html")) {
              modalTitle.textContent = "Access Our Research";
              modalMessage.textContent =
                "Hi, we have some amazing researches waiting for you. Please log in to continue.";
            } else if (href.includes("give-feedback.html")) {
              modalTitle.textContent = "Share Your Feedback";
              modalMessage.textContent =
                "Hey! We would love to know what you think about us and our researches. Please log in to continue.";
            } else {
              modalTitle.textContent = "Login Required";
              modalMessage.textContent =
                "You need to be logged in to access this page.";
            }

            modalLoginBtn.href = `auth.html?redirectTo=${href}`;
            modal.classList.remove("hidden");
            safeFeatherReplace();
          }
        });
      }
    });

    const closeModalBtn = document.getElementById("close-modal-btn");
    closeModalBtn?.addEventListener("click", () =>
      modal.classList.add("hidden")
    );
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  }

  // === 6. PAGE-SPECIFIC HANDLERS ===
  async function handleAuthForms() {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const authMessage = document.getElementById("auth-message");
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const tabs = document.querySelectorAll(".auth-tabs button");
    const forms = document.querySelectorAll(".auth-form");

    // Handle Login
    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      authMessage.textContent = "";
      const email = document.getElementById("login-email")?.value.trim();
      const password = document.getElementById("login-password")?.value;
      if (!email || !password) {
        authMessage.textContent = "Please enter email and password.";
        return;
      }
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          authMessage.textContent = "Error: " + error.message;
        } else {
          await ensureProfileRow(data.user);
          window.location.href = redirectTo || "account-settings.html";
        }
      } catch (err) {
        console.error("Login error:", err);
        authMessage.textContent = "An unexpected error occurred during login.";
      }
    });

    // Handle Signup
    signupForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      authMessage.textContent = "";
      const fullName = document.getElementById("signup-fullname")?.value;
      const email = document.getElementById("signup-email")?.value;
      const password = document.getElementById("signup-password")?.value;
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        authMessage.textContent = "Error: " + error.message;
      } else {
        await ensureProfileRow(data.user);
        authMessage.textContent =
          "Success! Please check your email for a confirmation link.";
        signupForm.reset();
      }
    });

    // Handle Forgot Password
    forgotPasswordLink?.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email")?.value.trim();
      if (!email) {
        authMessage.textContent =
          "Please enter your email in the login box above.";
        return;
      }
      authMessage.textContent = "";
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth.html`,
      });
      if (error) {
        authMessage.textContent = "Error sending reset email: " + error.message;
      } else {
        authMessage.textContent =
          "Password reset email sent! Check your inbox.";
      }
    });

    // Handle Auth Tabs UI
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        forms.forEach((f) => f.classList.remove("active"));
        tab.classList.add("active");
        const form = document.getElementById(tab.dataset.form);
        if (form) form.classList.add("active");
        if (authMessage) authMessage.textContent = "";
      });
    });
  }

  async function handleNotificationsPage() {
    const listContainer = document.getElementById("notification-list-full");
    if (!listContainer) return;
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (!session) {
      listContainer.innerHTML =
        "<p>Please log in to view your notifications.</p>";
      return;
    }
    try {
      const { data: notifications, error } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("handleNotificationsPage error:", error);
        listContainer.innerHTML = "<p>Unable to load notifications.</p>";
        return;
      }
      listContainer.innerHTML = notifications.length
        ? notifications
            .map(
              (n) =>
                `<div class="notification-item ${
                  n.is_read ? "" : "unread"
                }"><p>${escapeHtml(
                  n.message
                )}</p><span class="notification-time">${new Date(
                  n.created_at
                ).toLocaleString()}</span></div>`
            )
            .join("")
        : "<p>You have no notifications yet.</p>";

      await supabaseClient
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session.user.id)
        .eq("is_read", false);
    } catch (err) {
      console.error("handleNotificationsPage error:", err);
      listContainer.innerHTML = "<p>An unexpected error occurred.</p>";
    }
  }

  async function handleProfilePage() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) return;
    await ensureProfileRow(user);

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const fullNameEl = document.getElementById("full-name");
    if (fullNameEl)
      fullNameEl.value =
        profile?.full_name || user.user_metadata?.full_name || "";
    const designationSelect = document.getElementById("designation");
    if (designationSelect)
      designationSelect.value = profile?.designation || "Common Person";
    const triggerText = document.querySelector(
      "#designation-select .custom-select-trigger span"
    );
    if (triggerText)
      triggerText.textContent = profile?.designation || "Common Person";

    const sidebarUsername = document.getElementById("sidebar-username");
    if (sidebarUsername)
      sidebarUsername.textContent =
        profile?.full_name || user.email.split("@")[0];
    const sidebarEmail = document.getElementById("sidebar-email");
    if (sidebarEmail) sidebarEmail.textContent = user.email;

    const emailAddress = document.getElementById("email-address");
    if (emailAddress) emailAddress.value = user.email; // Corrected: Always use user.email

    const avatarImg = document.getElementById("sidebar-avatar-img");
    if (avatarImg)
      avatarImg.src = profile?.avatar_url
        ? `${SUPABASE_URL}/storage/v1/object/public/avatars/${
            profile.avatar_url
          }?t=${Date.now()}`
        : "avatar.png";

    const emailUpdates = document.getElementById("email-updates");
    if (emailUpdates)
      emailUpdates.checked = profile?.notifications_on_new_research ?? true;
    const feedbackResponses = document.getElementById("feedback-responses");
    if (feedbackResponses)
      feedbackResponses.checked =
        profile?.notifications_on_feedback_responses ?? false;

    // Form submission handlers
    document
      .getElementById("profile-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const { error } = await supabaseClient
          .from("profiles")
          .update({
            full_name: fullNameEl?.value,
            designation: designationSelect?.value,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (error) alert("Error: " + error.message);
        else alert("Profile saved!");
      });
    document
      .getElementById("avatar-upload-input")
      ?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const filePath = `${user.id}/${Date.now()}.${file.name
          .split(".")
          .pop()}`;
        const { error: uploadError } = await supabaseClient.storage
          .from("avatars")
          .upload(filePath, file);
        if (uploadError)
          return alert("Error uploading avatar: " + uploadError.message);
        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({
            avatar_url: filePath,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        if (updateError)
          return alert("Error saving avatar URL: " + updateError.message);
        window.location.reload();
      });
    document
      .getElementById("email-updates")
      ?.addEventListener("change", async (e) => {
        await supabaseClient
          .from("profiles")
          .update({ notifications_on_new_research: e.target.checked })
          .eq("id", user.id);
      });
    document
      .getElementById("feedback-responses")
      ?.addEventListener("change", async (e) => {
        await supabaseClient
          .from("profiles")
          .update({ notifications_on_feedback_responses: e.target.checked })
          .eq("id", user.id);
      });
    document
      .getElementById("delete-account-link")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        const userName = fullNameEl?.value || "a user";
        const subject = "Account Deletion Request";
        const body = `Hi, this is ${userName}. I would like to request the deletion of my account associated with the email ${user.email}.`;
        window.location.href = `mailto:guptakhushaank@gmail.com?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`;
      });
    document
      .getElementById("logout-button")
      ?.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
      });
  }

  async function autofillFeedbackForm() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    if (nameEl) {
      nameEl.value = profile?.full_name || user.user_metadata?.full_name || "";
      nameEl.setAttribute("readonly", "");
    }
    if (emailEl) {
      emailEl.value = user.email;
      emailEl.setAttribute("readonly", "");
    }
  }

  async function personalizeHomepage() {
    const welcomeMessage = document.getElementById("welcome-message");
    if (!welcomeMessage) return;
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (session) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      const name =
        profile?.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.email.split("@")[0];
      welcomeMessage.textContent = `Hi, ${name}`;
    }
  }

  function loadResearchIndex() {
    const container = document.querySelector(".research-index");
    if (!container) return;
    fetch("research-manifest.json")
      .then((r) => (r.ok ? r.json() : Promise.reject("manifest failed")))
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        const renderItems = (filteredItems) => {
          container.innerHTML = filteredItems.length
            ? filteredItems
                .map((item) => {
                  const isExternal = item.type === "external";
                  const href = isExternal
                    ? item.file
                    : `viewer.html?file=${encodeURIComponent(item.file)}`;
                  const target = isExternal
                    ? 'target="_blank" rel="noopener noreferrer"'
                    : "";
                  const icon = isExternal ? "external-link" : "arrow-right";
                  return `<a href="${href}" ${target} class="research-item-link"><article class="research-item"><h2>${escapeHtml(
                    item.title || ""
                  )} <i data-feather="${icon}" class="link-icon"></i></h2><p class="research-meta">${escapeHtml(
                    item.meta || ""
                  )}</p><p>${escapeHtml(item.summary || "")}</p></article></a>`;
                })
                .join("")
            : "<p>No results found.</p>";
          safeFeatherReplace();
        };
        renderItems(items);
        const searchInput = document.getElementById("searchInput");
        searchInput?.addEventListener("input", (e) => {
          const q = (e.target.value || "").toLowerCase();
          const filtered = items.filter(
            (it) =>
              (it.title || "").toLowerCase().includes(q) ||
              (it.summary || "").toLowerCase().includes(q) ||
              (it.meta || "").toLowerCase().includes(q)
          );
          renderItems(filtered);
        });
        document.querySelectorAll(".trending-btn").forEach((btn) =>
          btn.addEventListener("click", () => {
            const si = document.getElementById("searchInput");
            if (si) {
              si.value = btn.textContent;
              si.dispatchEvent(new Event("input"));
            }
          })
        );
      })
      .catch((e) => {
        console.error("loadResearchIndex error", e);
        container.innerHTML = "<p>Unable to load research index.</p>";
      });
  }

  function initializeCustomDropdowns() {
    document.querySelectorAll(".custom-select-wrapper").forEach((wrapper) => {
      const trigger = wrapper.querySelector(".custom-select-trigger");
      const options = wrapper.querySelectorAll(".custom-option");
      const hiddenSelect = wrapper.nextElementSibling;
      const triggerText = trigger?.querySelector("span");
      trigger?.addEventListener("click", () =>
        wrapper.classList.toggle("open")
      );
      options.forEach((option) =>
        option.addEventListener("click", () => {
          const v = option.getAttribute("data-value");
          if (triggerText) triggerText.textContent = v;
          if (hiddenSelect) hiddenSelect.value = v;
          wrapper.classList.remove("open");
        })
      );
    });
    window.addEventListener("click", (e) => {
      document
        .querySelectorAll(".custom-select-wrapper.open")
        .forEach((wrapper) => {
          if (!wrapper.contains(e.target)) wrapper.classList.remove("open");
        });
    });
  }

  // === 7. MAIN INITIALIZATION FUNCTION ===
  async function initializeApp() {
    await loadHeaderAndFooter();
    await initializeHeader();

    const currentPage = (
      window.location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();

    if (currentPage.includes("index.html")) await personalizeHomepage();
    if (currentPage.includes("research.html")) loadResearchIndex();
    if (currentPage.includes("auth.html")) handleAuthForms();
    if (currentPage.includes("account-settings.html"))
      await handleProfilePage();
    if (currentPage.includes("give-feedback.html"))
      await autofillFeedbackForm();
    if (currentPage.includes("notifications.html"))
      await handleNotificationsPage();

    if (currentPage.match(/give-feedback\.html|account-settings\.html/)) {
      initializeCustomDropdowns();
    }
  }

  // Listen for auth state changes globally
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session);
    updateNotificationBadge(session);
  });

  // Start the application
  await initializeApp();
});
