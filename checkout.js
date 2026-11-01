/* ShopEase 2.0 — Day 4
   File: day4-features/day4-checkout.js
*/

(() => {
    "use strict";

    const KEYS = {
        cart: "shopeaseDay2Cart",
        addresses: "shopeaseDay3Addresses",
        orders: "shopeaseDay4Orders",
        delivery: "shopeaseDay4Delivery",
        payment: "shopeaseDay4Payment"
    };

    const read = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    };

    const write = (key, value) =>
        localStorage.setItem(key, JSON.stringify(value));

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
        })[char]);

    const money = value =>
        "₹" + Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    function normalizeCart() {
        const raw = read(KEYS.cart, []);
        const items = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.items) ? raw.items : [];

        return items.map((item, index) => {
            const price = Number(
                item.price ?? item.currentPrice ??
                item.displayPrice ?? item.amount ?? 0
            );

            const quantity = Math.max(1, Number(
                item.quantity ?? item.qty ?? 1
            ));

            return {
                id: String(item.id ?? item.productId ?? index),
                name: String(
                    item.name ?? item.title ?? item.productName ?? "Product"
                ),
                price: Number.isFinite(price) ? price : 0,
                quantity,
                image: String(item.image ?? item.imageUrl ?? ""),
                category: String(item.category ?? "")
            };
        }).filter(item => item.price >= 0);
    }

    const D4 = {
        KEYS,
        read,
        write,
        escapeHTML,
        money,
        sections: {},
        current: "cart",
        cart: [],
        delivery: null,
        payment: "cod",
        lastOrder: null,

        registerSection(id, section) {
            this.sections[id] = section;
        },

        getCart() {
            return normalizeCart();
        },

        getSubtotal() {
            return this.cart.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            );
        },

        getShipping() {
            return this.getSubtotal() >= 1999 || this.getSubtotal() === 0
                ? 0 : 49;
        },

        getTotal() {
            return this.getSubtotal() + this.getShipping();
        },

        getOrders() {
            const orders = read(KEYS.orders, []);
            return Array.isArray(orders) ? orders : [];
        },

        open(section = "cart") {
            const modal = document.getElementById("d4-modal");
            if (!modal) return;

            this.cart = this.getCart();
            modal.classList.add("d4-visible");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("d4-no-scroll");
            this.show(section);
        },

        close() {
            const modal = document.getElementById("d4-modal");
            if (!modal) return;

            modal.classList.remove("d4-visible");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("d4-no-scroll");
        },

        show(section) {
            this.current = section;

            const content = document.getElementById("d4-content");
            const title = document.getElementById("d4-section-title");
            if (!content || !title) return;

            if (section === "cart") {
                title.textContent = "Your checkout";
                this.renderCart(content);
            } else {
                const panel = this.sections[section];

                if (!panel) {
                    content.innerHTML = "<p>This section is not available.</p>";
                    return;
                }

                title.textContent = panel.title;
                content.innerHTML = panel.render(this);

                if (panel.afterRender) panel.afterRender(content, this);
            }

            document.querySelectorAll("[data-d4-nav]").forEach(button => {
                button.classList.toggle(
                    "active", button.dataset.d4Nav === section
                );
            });
        },

        renderCart(content) {
            this.cart = this.getCart();

            if (!this.cart.length) {
                content.innerHTML = `
                    <div class="d4-empty">
                        <span>🛒</span>
                        <h3>Your cart is empty</h3>
                        <p>Add products to your ShopEase cart before checkout.</p>
                        <button class="d4-btn d4-primary"
                                data-d4-close>Continue shopping</button>
                    </div>
                `;
                return;
            }

            const rows = this.cart.map(item => `
                <article class="d4-cart-item">
                    <div class="d4-cart-image">
                        ${item.image
                            ? `<img src="${escapeHTML(item.image)}"
                                   alt="${escapeHTML(item.name)}">`
                            : "🛍️"}
                    </div>
                    <div class="d4-cart-info">
                        <strong>${escapeHTML(item.name)}</strong>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                    <strong>${money(item.price * item.quantity)}</strong>
                </article>
            `).join("");

            content.innerHTML = `
                <div class="d4-cart-list">${rows}</div>

                <div class="d4-summary">
                    <div><span>Subtotal</span><strong>${money(this.getSubtotal())}</strong></div>
                    <div><span>Delivery</span><strong>${this.getShipping() === 0
                        ? "FREE" : money(this.getShipping())}</strong></div>
                    <div class="d4-grand-total"><span>Total</span>
                        <strong>${money(this.getTotal())}</strong></div>
                </div>

                <button class="d4-btn d4-primary d4-full"
                        data-d4-go="delivery">
                    Continue to delivery →
                </button>
                <p class="d4-small-note">
                    Free delivery on orders of ₹1,999 or more.
                </p>
            `;
        },

        createOrder() {
            this.cart = this.getCart();

            if (!this.cart.length) {
                this.notify("Your cart is empty.", "error");
                this.show("cart");
                return;
            }

            if (!this.delivery) {
                this.notify("Please add delivery details.", "error");
                this.show("delivery");
                return;
            }

            const order = {
                id: "SE" + Date.now().toString().slice(-9),
                date: new Date().toISOString(),
                items: this.cart,
                subtotal: this.getSubtotal(),
                shipping: this.getShipping(),
                total: this.getTotal(),
                delivery: this.delivery,
                payment: this.payment,
                status: "Order placed"
            };

            const orders = this.getOrders();
            orders.unshift(order);
            write(KEYS.orders, orders);

            this.lastOrder = order;

            // Clear only the Day 2 cart storage after successful demo order.
            localStorage.setItem(KEYS.cart, JSON.stringify([]));

            this.show("confirmation");
        },

        notify(message, type = "success") {
            let toast = document.getElementById("d4-toast");

            if (!toast) {
                toast = document.createElement("div");
                toast.id = "d4-toast";
                toast.className = "d4-toast";
                document.body.appendChild(toast);
            }

            toast.textContent = message;
            toast.dataset.type = type;
            toast.classList.add("d4-toast-visible");

            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                toast.classList.remove("d4-toast-visible");
            }, 2600);
        }
    };

    window.ShopEaseDay4 = D4;

    function init() {
        if (document.getElementById("d4-modal")) return;

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "d4-trigger";
        trigger.textContent = "🛒 Checkout";

        const modal = document.createElement("div");
        modal.id = "d4-modal";
        modal.className = "d4-modal";
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <section class="d4-panel" role="dialog"
                     aria-modal="true" aria-labelledby="d4-heading">
                <header class="d4-header">
                    <div>
                        <span class="d4-eyebrow">SHOPEASE 2.0 · DAY 4</span>
                        <h2 id="d4-heading">Checkout & Orders</h2>
                        <p id="d4-section-title">Your checkout</p>
                    </div>
                    <button type="button" class="d4-close"
                            aria-label="Close checkout">×</button>
                </header>

                <nav class="d4-nav" aria-label="Checkout navigation">
                    <button data-d4-nav="cart">🛒 Cart</button>
                    <button data-d4-nav="delivery">📍 Delivery</button>
                    <button data-d4-nav="payment">💳 Payment</button>
                    <button data-d4-nav="orders">📦 My Orders</button>
                </nav>

                <main id="d4-content" class="d4-content"></main>

                <footer class="d4-footer">
                    <span>SHOPEASE 2.0</span>
                    <span>Frontend demo · No real payments</span>
                </footer>
            </section>
        `;

        document.body.append(trigger, modal);

        trigger.addEventListener("click", () => D4.open("cart"));
        modal.querySelector(".d4-close").addEventListener("click", D4.close);

        modal.addEventListener("click", event => {
            if (event.target === modal) D4.close();

            const nav = event.target.closest("[data-d4-nav]");
            if (nav) D4.show(nav.dataset.d4Nav);

            const next = event.target.closest("[data-d4-go]");
            if (next) D4.show(next.dataset.d4Go);

            if (event.target.closest("[data-d4-close]")) D4.close();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") D4.close();
        });

        D4.show("cart");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();