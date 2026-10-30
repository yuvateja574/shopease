/* ShopEase 2.0 — Day 3
   File: day3-features/day3-auth.js
*/

(() => {
    "use strict";

    const D3 = window.ShopEaseDay3;
    if (!D3) {
        console.error("Load day3-profile.js before day3-auth.js");
        return;
    }

    let mode = "register";

    const renderForm = () => `
        <div class="d3-page-heading">
            <span class="d3-eyebrow">YOUR SHOPPING SPACE</span>
            <h1>${mode === "register" ? "Create your account." : "Welcome back."}</h1>
            <p>${mode === "register"
                ? "Set up your demo profile in a few steps."
                : "Sign in to your local demo account."}</p>
        </div>

        <div class="d3-auth-toggle">
            <button class="${mode === "register" ? "active" : ""}"
                    data-d3-mode="register">Create account</button>
            <button class="${mode === "login" ? "active" : ""}"
                    data-d3-mode="login">Log in</button>
        </div>

        <form id="d3-auth-form" class="d3-form">
            ${mode === "register" ? `
                <label>Full name
                    <input name="name" type="text" maxlength="70"
                           autocomplete="name" required
                           placeholder="Your name">
                </label>
            ` : ""}

            <label>Email address
                <input name="email" type="email" maxlength="120"
                       autocomplete="email" required
                       placeholder="you@example.com">
            </label>

            <label>Demo password
                <input name="password" type="password" minlength="4"
                       maxlength="80" autocomplete="${mode === "register"
                           ? "new-password" : "current-password"}"
                       required placeholder="Enter a demo password">
            </label>

            <button class="d3-btn d3-btn-primary d3-btn-full" type="submit">
                ${mode === "register" ? "Create demo account →" : "Log in →"}
            </button>

            <p class="d3-form-note">
                Demo only: do not use a real password. This is not secure
                authentication and should not be used for real accounts.
            </p>
        </form>
    `;

    D3.registerTab({
        id: "auth",
        label: "Login / Register",
        icon: "↗",
        render() {
            const user = D3.getUser();

            if (user) {
                return `
                    <div class="d3-page-heading">
                        <span class="d3-eyebrow">ACCOUNT ACCESS</span>
                        <h1>You're signed in.</h1>
                        <p>This browser has a local demo profile for
                           ${D3.escapeHTML(user.email)}.</p>
                    </div>
                    <div class="d3-demo-notice">
                        <strong>Local demo session</strong>
                        <p>This is not a secure session or server login.</p>
                    </div>
                    <button type="button" class="d3-btn d3-btn-secondary"
                            id="d3-logout">Log out of demo</button>
                `;
            }

            return renderForm();
        },
        afterRender(content) {
            const form = content.querySelector("#d3-auth-form");
            const logout = content.querySelector("#d3-logout");

            content.querySelectorAll("[data-d3-mode]").forEach(button => {
                button.addEventListener("click", () => {
                    mode = button.dataset.d3Mode;
                    D3.render();
                });
            });

            if (logout) {
                logout.addEventListener("click", () => {
                    D3.setUser(null);
                    D3.updateSidebar?.();
                    D3.notify("You have logged out of the demo.");
                    D3.open("auth");
                });
            }

            if (!form) return;

            form.addEventListener("submit", event => {
                event.preventDefault();

                const data = new FormData(form);
                const email = String(data.get("email") || "")
                    .trim().toLowerCase();
                const password = String(data.get("password") || "");

                if (!email || !email.includes("@") || password.length < 4) {
                    D3.notify("Enter a valid email and demo password.", "error");
                    return;
                }

                if (mode === "register") {
                    const name = String(data.get("name") || "").trim();

                    if (name.length < 2) {
                        D3.notify("Please enter your name.", "error");
                        return;
                    }

                    // Deliberately do not store the password.
                    D3.setUser({
                        name,
                        email,
                        createdAt: new Date().toISOString()
                    });

                    D3.updateSidebar?.();
                    D3.notify("Demo profile created successfully!");
                    D3.open("profile");
                } else {
                    const user = D3.getUser();

                    // There is no real credential verification.
                    // Login is allowed only for the saved local email.
                    if (!user || user.email !== email) {
                        D3.notify(
                            "No matching local demo profile. Create an account first.",
                            "error"
                        );
                        return;
                    }

                    D3.notify("Local demo profile opened.");
                    D3.updateSidebar?.();
                    D3.open("profile");
                }
            });
        }
    });
})();