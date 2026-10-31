/* ShopEase 2.0 — Day 3
   File: day3-features/day3-addresses.js
*/

(() => {
    "use strict";

    const D3 = window.ShopEaseDay3;
    if (!D3) return;

    const KEY = D3.STORAGE.addresses;

    const getAddresses = () => {
        const result = D3.read(KEY, []);
        return Array.isArray(result) ? result : [];
    };

    const renderAddress = address => `
        <article class="d3-address-card">
            <div class="d3-address-top">
                <span class="d3-address-icon">⌖</span>
                <span class="d3-address-label">
                    ${D3.escapeHTML(address.label)}
                </span>
                <button type="button" class="d3-remove-address"
                        data-d3-remove="${D3.escapeHTML(address.id)}"
                        aria-label="Remove address">×</button>
            </div>
            <h3>${D3.escapeHTML(address.name)}</h3>
            <p>${D3.escapeHTML(address.line)}</p>
            <p>${D3.escapeHTML(address.city)}, ${D3.escapeHTML(address.state)}
               — ${D3.escapeHTML(address.postal)}</p>
            <p>Phone: ${D3.escapeHTML(address.phone)}</p>
        </article>
    `;

    D3.registerTab({
        id: "addresses",
        label: "Saved Addresses",
        icon: "⌖",

        render(user) {
            if (!user) {
                return `
                    <div class="d3-page-heading">
                        <h1>Saved addresses.</h1>
                        <p>Create a demo account to manage addresses.</p>
                    </div>
                    <button class="d3-btn d3-btn-primary"
                            data-d3-action="go-auth">Create account</button>
                `;
            }

            const addresses = getAddresses();

            return `
                <div class="d3-page-heading">
                    <span class="d3-eyebrow">DELIVERY DETAILS</span>
                    <h1>Your addresses.</h1>
                    <p>Keep demo delivery locations organized.</p>
                </div>

                <form id="d3-address-form" class="d3-form d3-address-form">
                    <h3>Add a new address</h3>

                    <div class="d3-form-row">
                        <label>Address label
                            <select name="label" required>
                                <option value="Home">Home</option>
                                <option value="College">College</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>
                        <label>Recipient name
                            <input name="name" maxlength="70" required>
                        </label>
                    </div>

                    <label>Address
                        <textarea name="line" rows="2" maxlength="180"
                                  required
                                  placeholder="House number, street, area"></textarea>
                    </label>

                    <div class="d3-form-row">
                        <label>City
                            <input name="city" maxlength="70" required>
                        </label>
                        <label>State
                            <input name="state" maxlength="70" required>
                        </label>
                    </div>

                    <div class="d3-form-row">
                        <label>Postal code
                            <input name="postal" maxlength="12"
                                   autocomplete="off" required>
                        </label>
                        <label>Phone number
                            <input name="phone" type="tel" maxlength="20"
                                   autocomplete="off" required>
                        </label>
                    </div>

                    <button type="submit" class="d3-btn d3-btn-primary">
                        + Save address
                    </button>
                </form>

                <div class="d3-section-heading">
                    <div>
                        <h3>Saved locations</h3>
                        <p>${addresses.length} saved address(es)</p>
                    </div>
                </div>

                <div class="d3-address-list">
                    ${addresses.length
                        ? addresses.map(renderAddress).join("")
                        : `<div class="d3-empty">
                            <span>⌖</span>
                            <strong>No saved addresses yet</strong>
                            <p>Add a demo address using the form above.</p>
                           </div>`}
                </div>
            `;
        },

        afterRender(content, user) {
            if (!user) return;

            const form = content.querySelector("#d3-address-form");

            form.addEventListener("submit", event => {
                event.preventDefault();

                const data = new FormData(form);
                const address = Object.fromEntries(data.entries());

                for (const field of [
                    "name", "line", "city", "state", "postal", "phone"
                ]) {
                    address[field] = String(address[field] || "").trim();
                    if (!address[field]) {
                        D3.notify("Please complete every address field.", "error");
                        return;
                    }
                }

                if (address.phone.length < 7) {
                    D3.notify("Enter a valid demo phone number.", "error");
                    return;
                }

                address.id = (crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`);

                const addresses = getAddresses();
                addresses.push(address);
                D3.write(KEY, addresses);

                D3.notify("Address saved in this browser.");
                D3.render();
            });

            content.querySelectorAll("[data-d3-remove]").forEach(button => {
                button.addEventListener("click", () => {
                    const remaining = getAddresses().filter(
                        address => address.id !== button.dataset.d3Remove
                    );

                    D3.write(KEY, remaining);
                    D3.notify("Address removed.");
                    D3.render();
                });
            });
        }
    });
})();