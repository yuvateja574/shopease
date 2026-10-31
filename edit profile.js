/* ShopEase 2.0 — Day 3
   File: day3-features/day3-edit-profile.js
*/

(() => {
    "use strict";

    const D3 = window.ShopEaseDay3;
    if (!D3) return;

    D3.registerTab({
        id: "edit",
        label: "Edit Profile",
        icon: "✎",

        render(user) {
            if (!user) {
                return `
                    <div class="d3-page-heading">
                        <h1>Profile settings</h1>
                        <p>Create a demo account before editing your profile.</p>
                    </div>
                    <button class="d3-btn d3-btn-primary"
                            data-d3-action="go-auth">Create account</button>
                `;
            }

            return `
                <div class="d3-page-heading">
                    <span class="d3-eyebrow">PERSONAL INFORMATION</span>
                    <h1>Edit your profile.</h1>
                    <p>Update the details displayed in your account.</p>
                </div>

                <form id="d3-edit-form" class="d3-form">
                    <label>Full name
                        <input name="name" type="text" maxlength="70"
                               value="${D3.escapeHTML(user.name)}" required>
                    </label>

                    <label>Email address
                        <input name="email" type="email" maxlength="120"
                               value="${D3.escapeHTML(user.email)}" required>
                    </label>

                    <div class="d3-form-actions">
                        <button type="button" class="d3-btn d3-btn-secondary"
                                id="d3-edit-cancel">Cancel</button>
                        <button type="submit" class="d3-btn d3-btn-primary">
                            Save changes
                        </button>
                    </div>
                </form>

                <div class="d3-demo-notice">
                    <strong>Privacy note</strong>
                    <p>These details are stored locally in this browser.</p>
                </div>
            `;
        },

        afterRender(content) {
            const form = content.querySelector("#d3-edit-form");
            if (!form) return;

            content.querySelector("#d3-edit-cancel").addEventListener(
                "click", () => D3.open("profile")
            );

            form.addEventListener("submit", event => {
                event.preventDefault();

                const data = new FormData(form);
                const name = String(data.get("name") || "").trim();
                const email = String(data.get("email") || "")
                    .trim().toLowerCase();

                if (name.length < 2 || !email.includes("@")) {
                    D3.notify("Enter a valid name and email address.", "error");
                    return;
                }

                const user = D3.getUser();
                if (!user) {
                    D3.notify("Please create a demo account first.", "error");
                    return;
                }

                D3.setUser({
                    ...user,
                    name,
                    email,
                    updatedAt: new Date().toISOString()
                });

                D3.updateSidebar?.();
                D3.notify("Profile updated!");
                D3.open("profile");
            });
        }
    });
})();