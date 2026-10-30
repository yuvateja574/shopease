/* ShopEase 2.0 — Day 3
   File: day3-features/day3-profile.js
*/

(() => {
    "use strict";

    const STORAGE = {
        user: "shopeaseDay3User",
        addresses: "shopeaseDay3Addresses",
        settings: "shopeaseDay3Settings"
    };

    const read = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    };

    const write = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const escapeHTML = (value = "") =>
        String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const api = {
        STORAGE,
        read,
        write,
        escapeHTML,
        tabs: [],
        activeTab: "profile",
        registerTab(tab) {
            if (!this.tabs.some(item => item.id === tab.id)) {
                this.tabs.push(tab);
            }
        },
        getUser() {
            return read(STORAGE.user, null);
        },
        setUser(user) {
            write(STORAGE.user, user);
        },
        notify(message, type = "success") {
            let toast = document.getElementById("d3-toast");

            if (!toast) {
                toast = document.createElement("div");
                toast.id = "d3-toast";
                toast.className = "d3-toast";
                document.body.appendChild(toast);
            }

            toast.textContent = message;
            toast.dataset.type = type;
            toast.classList.add("d3-toast-visible");

            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                toast.classList.remove("d3-toast-visible");
            }, 2800);
        },
        open(tab = "profile") {
            const modal = document.getElementById("d3-account-modal");
            if (!modal) return;

            this.activeTab = tab;
            modal.classList.add("d3-visible");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("d3-no-scroll");
            this.render();
        },
        close() {
            const modal = document.getElementById("d3-account-modal");
            if (!modal) return;

            modal.classList.remove("d3-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("d3-no-scroll");
        },
        render() {
            const content = document.getElementById("d3-account-content");
            const nav = document.getElementById("d3-account-nav");
            if (!content || !nav) return;

            const user = this.getUser();

            nav.innerHTML = this.tabs.map(tab => `
                <button
                    type="button"
                    class="d3-nav-item ${this.activeTab === tab.id ? "active" : ""}"
                    data-d3-tab="${escapeHTML(tab.id)}">
                    <span>${tab.icon}</span>
                    <span>${escapeHTML(tab.label)}</span>
                </button>
            `).join("");

            const active = this.tabs.find(tab => tab.id === this.activeTab)
                || this.tabs[0];

            if (!active) {
                content.innerHTML = "<p>Account features are loading.</p>";
                return;
            }

            content.innerHTML = active.render(user);

            if (typeof active.afterRender === "function") {
                active.afterRender(content, user);
            }
        }
    };

    window.ShopEaseDay3 = api;

    function init() {
        if (document.getElementById("d3-account-modal")) return;

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "d3-account-trigger";
        trigger.innerHTML = `
            <span class="d3-trigger-icon">♙</span>
            <span>My Account</span>
        `;
        trigger.setAttribute("aria-label", "Open My Account");

        const modal = document.createElement("div");
        modal.id = "d3-account-modal";
        modal.className = "d3-modal";
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <section class="d3-panel" role="dialog"
                     aria-modal="true" aria-labelledby="d3-title">
                <header class="d3-header">
                    <div>
                        <span class="d3-eyebrow">SHOPEASE MEMBER SPACE</span>
                        <h2 id="d3-title">Your Account</h2>
                        <p>Manage your profile and preferences.</p>
                    </div>
                    <button type="button" class="d3-close"
                            aria-label="Close account">×</button>
                </header>

                <div class="d3-layout">
                    <aside class="d3-sidebar">
                        <div class="d3-mini-user">
                            <div class="d3-avatar" id="d3-avatar">S</div>
                            <div>
                                <strong id="d3-sidebar-name">Guest User</strong>
                                <span id="d3-sidebar-email">Welcome to ShopEase</span>
                            </div>
                        </div>
                        <nav id="d3-account-nav"
                             class="d3-account-nav"
                             aria-label="Account sections"></nav>
                        <div class="d3-sidebar-note">
                            <span>✦</span>
                            <p>Your shopping space, all in one place.</p>
                        </div>
                    </aside>

                    <main id="d3-account-content" class="d3-content"></main>
                </div>

                <footer class="d3-footer">
                    <span>SHOPEASE 2.0</span>
                    <span>Account demo · Day 3</span>
                </footer>
            </section>
        `;

        document.body.append(trigger, modal);

        trigger.addEventListener("click", () => api.open());

        modal.querySelector(".d3-close").addEventListener("click", api.close);

        modal.addEventListener("click", event => {
            if (event.target === modal) api.close();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") api.close();
        });

        modal.querySelector("#d3-account-nav").addEventListener("click", event => {
            const button = event.target.closest("[data-d3-tab]");
            if (!button) return;
            api.open(button.dataset.d3Tab);
        });

        api.registerTab({
            id: "profile",
            label: "My Profile",
            icon: "♙",
            render(user) {
                if (!user) {
                    return `
                        <div class="d3-welcome">
                            <span class="d3-eyebrow">WELCOME TO SHOPEASE</span>
                            <h1>Your shopping,<br><span>your way.</span></h1>
                            <p>Create a demo account to manage your profile,
                               addresses and shopping preferences.</p>
                            <button class="d3-btn d3-btn-primary"
                                    data-d3-action="go-auth">Get Started →</button>
                        </div>
                    `;
                }

                const name = escapeHTML(user.name || "ShopEase Member");
                const email = escapeHTML(user.email || "");
                const joined = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Recently";

                return `
                    <div class="d3-page-heading">
                        <span class="d3-eyebrow">ACCOUNT OVERVIEW</span>
                        <h1>Welcome back, ${name.split(" ")[0]}.</h1>
                        <p>Here's your ShopEase profile at a glance.</p>
                    </div>

                    <div class="d3-profile-hero">
                        <div class="d3-avatar d3-avatar-large">
                            ${escapeHTML(name.charAt(0).toUpperCase())}
                        </div>
                        <div class="d3-profile-identity">
                            <h2>${name}</h2>
                            <p>${email}</p>
                            <span class="d3-status"><i></i> Demo account</span>
                        </div>
                        <button class="d3-btn d3-btn-secondary"
                                data-d3-action="go-edit">Edit Profile</button>
                    </div>

                    <div class="d3-stats-grid">
                        <article class="d3-stat-card">
                            <span>MEMBER SINCE</span>
                            <strong>${escapeHTML(joined)}</strong>
                            <small>Your ShopEase journey</small>
                        </article>
                        <article class="d3-stat-card">
                            <span>SAVED ADDRESSES</span>
                            <strong>${read(STORAGE.addresses, []).length}</strong>
                            <small>Delivery locations</small>
                        </article>
                        <article class="d3-stat-card">
                            <span>ACCOUNT STATUS</span>
                            <strong>Active</strong>
                            <small>Stored in this browser</small>
                        </article>
                    </div>

                    <div class="d3-section-heading">
                        <div>
                            <h3>Quick actions</h3>
                            <p>Jump straight to what you need.</p>
                        </div>
                    </div>

                    <div class="d3-quick-grid">
                        <button data-d3-action="go-edit">
                            <span>✎</span><strong>Edit profile</strong>
                            <small>Update your details</small>
                        </button>
                        <button data-d3-action="go-addresses">
                            <span>⌖</span><strong>Addresses</strong>
                            <small>Manage delivery locations</small>
                        </button>
                        <button data-d3-action="go-settings">
                            <span>⚙</span><strong>Settings</strong>
                            <small>Personalize your account</small>
                        </button>
                    </div>

                    <div class="d3-demo-notice">
                        <strong>Demo mode</strong>
                        <p>Your account data is saved only in this browser.
                           It is not synced across devices.</p>
                    </div>
                `;
            }
        });

        document.getElementById("d3-account-content").addEventListener("click", event => {
            const button = event.target.closest("[data-d3-action]");
            if (!button) return;

            const actions = {
                "go-auth": "auth",
                "go-edit": "edit",
                "go-addresses": "addresses",
                "go-settings": "settings"
            };

            if (actions[button.dataset.d3Action]) {
                api.open(actions[button.dataset.d3Action]);
            }
        });

        api.render();
        api.updateSidebar = () => {
            const user = api.getUser();
            const name = user?.name || "Guest User";
            document.getElementById("d3-sidebar-name").textContent = name;
            document.getElementById("d3-sidebar-email").textContent =
                user?.email || "Welcome to ShopEase";
            document.getElementById("d3-avatar").textContent =
                name.charAt(0).toUpperCase();
        };
        api.updateSidebar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();