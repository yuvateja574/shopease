/* ShopEase 2.0 — Day 4
   File: day4-features/day4-delivery.js
*/

(() => {
    "use strict";

    const D4 = window.ShopEaseDay4;
    if (!D4) return;

    const savedAddresses = () => {
        const addresses = D4.read(D4.KEYS.addresses, []);
        return Array.isArray(addresses) ? addresses : [];
    };

    D4.registerSection("delivery", {
        title: "Delivery information",

        render() {
            const addresses = savedAddresses();

            return `
                <div class="d4-heading">
                    <span class="d4-eyebrow">STEP 02</span>
                    <h2>Where should we deliver?</h2>
                    <p>Choose a saved address or enter demo delivery details.</p>
                </div>

                ${addresses.length ? `
                    <label class="d4-label">Saved addresses</label>
                    <select id="d4-saved-address" class="d4-input">
                        <option value="">Enter a new address</option>
                        ${addresses.map((a, i) => `
                            <option value="${i}">
                                ${D4.escapeHTML(a.label)} —
                                ${D4.escapeHTML(a.city)}
                            </option>
                        `).join("")}
                    </select>
                ` : ""}

                <form id="d4-delivery-form" class="d4-form">
                    <label>Recipient name
                        <input class="d4-input" name="name"
                               maxlength="70" required>
                    </label>

                    <label>Phone number
                        <input class="d4-input" name="phone"
                               type="tel" maxlength="20" required>
                    </label>

                    <label>Full address
                        <textarea class="d4-input" name="address"
                                  rows="3" maxlength="200" required></textarea>
                    </label>

                    <div class="d4-form-row">
                        <label>City
                            <input class="d4-input" name="city"
                                   maxlength="70" required>
                        </label>
                        <label>State
                            <input class="d4-input" name="state"
                                   maxlength="70" required>
                        </label>
                    </div>

                    <label>Postal code
                        <input class="d4-input" name="postal"
                               maxlength="12" required>
                    </label>

                    <div class="d4-actions">
                        <button type="button" class="d4-btn d4-secondary"
                                data-d4-go="cart">← Back to cart</button>
                        <button type="submit" class="d4-btn d4-primary">
                            Save & Continue →
                        </button>
                    </div>
                </form>
            `;
        },

        afterRender(content) {
            const form = content.querySelector("#d4-delivery-form");
            const select = content.querySelector("#d4-saved-address");

            if (select) {
                select.addEventListener("change", () => {
                    const index = Number(select.value);
                    if (select.value === "") {
                        form.reset();
                        return;
                    }

                    const address = savedAddresses()[index];
                    if (!address) return;

                    form.elements.name.value = address.name || "";
                    form.elements.phone.value = address.phone || "";
                    form.elements.address.value = address.line || "";
                    form.elements.city.value = address.city || "";
                    form.elements.state.value = address.state || "";
                    form.elements.postal.value = address.postal || "";
                });
            }

            form.addEventListener("submit", event => {
                event.preventDefault();

                const data = Object.fromEntries(new FormData(form).entries());

                for (const key of [
                    "name", "phone", "address", "city", "state", "postal"
                ]) {
                    data[key] = String(data[key] || "").trim();
                    if (!data[key]) {
                        D4.notify("Please complete all delivery fields.", "error");
                        return;
                    }
                }

                if (data.phone.length < 7) {
                    D4.notify("Please enter a valid demo phone number.", "error");
                    return;
                }

                D4.delivery = data;
                D4.write(D4.KEYS.delivery, data);
                D4.notify("Delivery information saved.");
                D4.show("payment");
            });
        }
    });
})();