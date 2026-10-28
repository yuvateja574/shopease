/* ShopEase Day 2 - Advanced Shopping Cart */
(function () {
    "use strict";

    const D2 = window.ShopEaseDay2;
    if (!D2) {
        console.error("Load day2-notifications.js before day2-cart.js");
        return;
    }

    const DELIVERY_CHARGE = 49;
    let drawer;

    function createDrawer() {
        if (document.getElementById("d2-cart-drawer")) {
            drawer = document.getElementById("d2-cart-drawer");
            return;
        }

        drawer = document.createElement("aside");
        drawer.id = "d2-cart-drawer";
        drawer.className = "d2-drawer";
        drawer.setAttribute("aria-label", "Shopping cart");
        drawer.setAttribute("aria-hidden", "true");

        drawer.innerHTML = `
            <div class="d2-drawer-header">
                <div>
                    <span class="d2-eyebrow">YOUR SHOPPING BAG</span>
                    <h2>Your Cart <span id="d2-cart-count">0</span></h2>
                </div>
                <button class="d2-icon-button" data-d2-close-cart
                    aria-label="Close cart">&times;</button>
            </div>

            <div id="d2-cart-items" class="d2-cart-items"></div>

            <div id="d2-cart-footer" class="d2-cart-footer">
                <div class="d2-total-row">
                    <span>Subtotal</span><strong id="d2-subtotal">₹0</strong>
                </div>
                <div class="d2-total-row">
                    <span>Delivery</span><strong id="d2-delivery">₹0</strong>
                </div>
                <div class="d2-total-row d2-grand-total">
                    <span>Total</span><strong id="d2-total">₹0</strong>
                </div>
                <p class="d2-small-note">Demo cart — no payment is collected.</p>
                <button class="d2-primary-button" data-d2-checkout>
                    Continue to Checkout
                </button>
            </div>
        `;

        document.body.appendChild(drawer);

        drawer.addEventListener("click", event => {
            const close = event.target.closest("[data-d2-close-cart]");
            const action = event.target.closest("[data-d2-cart-action]");

            if (close) closeCart();

            if (action) {
                const id = action.dataset.id;
                const type = action.dataset.d2CartAction;
                const cart = D2.getCart();
                const item = cart.find(product => product.id === id);

                if (!item) return;

                if (type === "increase") item.quantity++;
                if (type === "decrease") item.quantity--;
                if (type === "remove" || item.quantity < 1) {
                    D2.saveCart(cart.filter(product => product.id !== id));
                    D2.notify("Product removed from cart.");
                    return;
                }

                D2.saveCart(cart);
            }

            if (event.target.closest("[data-d2-checkout]")) {
                D2.notify(
                    "Your cart is ready. Connect your checkout flow to continue.",
                    "info"
                );
            }
        });
    }

    function openCart() {
        createDrawer();
        renderCart();
        drawer.classList.add("d2-drawer-open");
        drawer.setAttribute("aria-hidden", "false");
        document.body.classList.add("d2-no-scroll");
    }

    function closeCart() {
        if (!drawer) return;
        drawer.classList.remove("d2-drawer-open");
        drawer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("d2-no-scroll");
    }

    function renderCart() {
        createDrawer();

        const cart = D2.getCart();
        const list = drawer.querySelector("#d2-cart-items");
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );
        const delivery = subtotal === 0 || subtotal >= 999 ? 0 : DELIVERY_CHARGE;
        const total = subtotal + delivery;

        drawer.querySelector("#d2-cart-count").textContent = count;
        drawer.querySelector("#d2-subtotal").textContent = D2.money(subtotal);
        drawer.querySelector("#d2-delivery").textContent = D2.money(delivery);
        drawer.querySelector("#d2-total").textContent = D2.money(total);

        if (!cart.length) {
            list.innerHTML = `
                <div class="d2-empty-state">
                    <span>🛒</span>
                    <h3>Your cart is empty</h3>
                    <p>Explore the store and add something you love.</p>
                    <button class="d2-secondary-button" data-d2-close-cart>
                        Continue Shopping
                    </button>
                </div>`;
        } else {
            list.innerHTML = cart.map(item => `
                <article class="d2-cart-item">
                    <img src="${D2.escape(item.image)}"
                         alt="${D2.escape(item.name)}"
                         onerror="this.style.visibility='hidden'">
                    <div class="d2-cart-item-info">
                        <h3>${D2.escape(item.name)}</h3>
                        <strong>${D2.money(item.price)}</strong>
                        <div class="d2-quantity-control">
                            <button data-d2-cart-action="decrease"
                                data-id="${D2.escape(item.id)}"
                                aria-label="Decrease quantity">−</button>
                            <span>${item.quantity}</span>
                            <button data-d2-cart-action="increase"
                                data-id="${D2.escape(item.id)}"
                                aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                    <button class="d2-remove-button"
                        data-d2-cart-action="remove"
                        data-id="${D2.escape(item.id)}">Remove</button>
                </article>
            `).join("");
        }

        // Update a common cart-count badge if your existing page has one.
        document.querySelectorAll(
            "#cartCount, #cart-count, .cart-count, [data-cart-count]"
        ).forEach(element => {
            element.textContent = count;
        });
    }

    function addToCart(product) {
        if (!product) return;

        const cart = D2.getCart();
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        D2.saveCart(cart);
        D2.notify(`${product.name} added to your Day 2 cart.`);
    }

    document.addEventListener("click", event => {
        if (event.target.closest("[data-d2-open-cart]")) {
            openCart();
            return;
        }

        const button = event.target.closest(
            "[data-d2-add-cart], .d2-add-to-cart"
        );

        if (button) {
            event.preventDefault();
            event.stopImmediatePropagation();
            addToCart(D2.getProduct(button));
            return;
        }

        // Open the Day 2 cart when the existing cart button is clicked.
        const existingCartButton = event.target.closest(
            "#cartButton, #cartBtn, .cart-button, .cart-icon-button"
        );

        if (existingCartButton && !existingCartButton.hasAttribute("data-d2-ignore")) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openCart();
        }
    }, true);

    window.addEventListener("d2:cart-updated", renderCart);
    window.addEventListener("storage", renderCart);

    D2.addToCart = addToCart;
    D2.openCart = openCart;
    D2.renderCart = renderCart;

    createDrawer();
    renderCart();

    console.log("ShopEase Day 2 cart loaded.");
})();