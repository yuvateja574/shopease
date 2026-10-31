/* ShopEase 2.0 — Day 3
   File: day3-features/day3-settings.js
*/

(() => {
    "use strict";

    const D3 = window.ShopEaseDay3;
    if (!D3) return;

    const KEY = D3.STORAGE.settings;

    const getSettings = () => ({
        theme: "dark",
        notifications: true,
        ...D3.read(KEY, {})
    });

    D3.registerTab({
        id: "settings",
        label: "Account Settings",
        icon: "⚙",

        render(user) {
            const settings = getSettings();

            return `
                <div class="d3-page-heading">
                    <span class="d3-eyebrow">PREFERENCES</span>
                    <h1>Make it yours.</h1>
                    <p>Manage the preferences for this browser demo.</p>
                </div>

                <div class="d3-settings-list">
                    <div class="d3-setting-row">
                        <div>
                            <strong>Interface theme</strong>
                            <p>Choose the appearance of the account panel.</p>
                        </div>
                        <select id="d3-theme-select">
                            <option value="dark" ${settings.theme === "dark"
                                ? "selected" : ""}>Dark</option>
                            <option value="light" ${settings.theme === "light"
                                ? "selected" : ""}>Light</option>
                        </select>
                    </div>

                    <div class="d3-setting-row">
                        <div>
                            <strong>Email notification preference</strong>
                            <p>Demo preference only; no emails are sent.</p>
                        </div>
                        <label class="d3-switch">
                            <input id="d3-notifications" type="checkbox"
                                   ${settings.notifications ? "checked" : ""}>
                            <span></span>
                        </label>
                    </div>
                </div>

                <button type="button" class="d3-btn d3-btn-primary"
                        id="d3-save-settings">Save preferences</button>

                <div class="d3-danger-zone">
                    <span class="d3-eyebrow">DEMO DATA</span>
                    <h3>Reset Day 3 data</h3>
                    <p>Removes this demo profile, saved addresses and
                       settings from this browser. It does not clear your
                       Day 1 or Day 2 storage.</p>
                    <button type="button" class="d3-btn d3-btn-danger"
                            id="d3-reset-data">Reset Day 3 data</button>
                </div>

                <div class="d3-demo-notice">
                    <strong>${user ? "Demo profile active" : "Guest mode"}</strong>
                    <p>These settings apply only to this browser.</p>
                </div>
            `;
        },

        afterRender(content) {
            content.querySelector("#d3-save-settings").addEventListener(
                "click", () => {
                    const settings = {
                        theme: content.querySelector("#d3-theme-select").value,
                        notifications: content.querySelector("#d3-notifications")
                            .checked
                    };

                    D3.write(KEY, settings);

                    const panel = document.querySelector(".d3-panel");
                    if (panel) {
                        panel.classList.toggle(
                            "d3-light-theme",
                            settings.theme === "light"
                        );
                    }

                    D3.notify("Preferences saved!");
                }
            );

            content.querySelector("#d3-reset-data").addEventListener(
                "click", () => {
                    const confirmed = window.confirm(
                        "Reset your Day 3 demo profile, addresses and settings?"
                    );

                    if (!confirmed) return;

                    localStorage.removeItem(D3.STORAGE.user);
                    localStorage.removeItem(D3.STORAGE.addresses);
                    localStorage.removeItem(D3.STORAGE.settings);

                    const panel = document.querySelector(".d3-panel");
                    if (panel) panel.classList.remove("d3-light-theme");

                    D3.updateSidebar?.();
                    D3.notify("Day 3 demo data has been reset.");
                    D3.open("profile");
                }
            );
        }
    });
})();