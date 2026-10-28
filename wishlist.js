/* ShopEase Day 2 - Wishlist */
(function () {
    "use strict";

    const D2 = window.ShopEaseDay2;
    if (!D2) return;

    let panel;

    function createPanel() {
        if (document.getElementById("d2-wishlist-panel")) {
            panel = document.getElementById("d2-wishlist-panel");
            return;
        }

        panel = document.createElement("aside");
        panel.id = "d2-wishlist-panel";
        panel.className = "d2-drawer";
        panel.setAttribute("aria-label", "Wishlist");
        panel.setAttribute("aria-hidden", "true");

        panel.innerHTML = `
            <div class="d2-drawer-header">
                <div>
                    <span class="d2-eyebrow">SAVED FOR LATER</span>
                    <h2>My Wishlist <span id="d2-wishlist-count">0</span></h2>
                </div>
                <button class="d2-icon-button" data-d2-close-wishlist
                    aria-label="Close wishlist">&times;</button>
            </div>
            <div id="d2-wishlist-items" class="d2-cart-items"></div>
        `;

        document.body.appendChild(panel);

        panel.addEventListener("click", event => {
            if (event.target.closest("[data-d2-close-wishlist]")) {
                closeWishlist();
                return;
            }

            const button = event.target.closest("[data-d2-wishlist-action]");
            if (!button) return;

            const id = button.dataset.id;
            const action = button.dataset.d2WishlistAction;
            const wishlist = D2.getWishlist();
            const product = wishlist.find(item => item.id === id);

            if (action === "remove") {
                D2.saveWishlist(wishlist.filter(item => item.id !== id));
                D2.notify("Removed from your wishlist.");
            }

            if (action === "add-cart" && product) {
                D2.addToCart(product);
                D2.saveWishlist(wishlist.filter(item => item.id !== id));
                D2.notify("Moved to your cart.");
            }
        });
    }

    function renderWishlist() {
        createPanel();

        const wishlist = D2.getWishlist();
        panel.querySelector("#d2-wishlist-count").textContent = wishlist.length;

        const list = panel.querySelector("#d2-wishlist-items");

        if (!wishlist.length) {
            list.innerHTML = `
                <div class="d2-empty-state">
                    <span>♡</span>
                    <h3>Your wishlist is empty</h3>
                    <p>Save products to find them easily later.</p>
                </div>`;
        } else {
            list.innerHTML = wishlist.map(product => `
                <article class="d2-cart-item">
                    <img src="${D2.escape(product.image)}"
                         alt="${D2.escape(product.name)}"
                         onerror="this.style.visibility='hidden'">
                    <div class="d2-cart-item-info">
                        <h3>${D2.escape(product.name)}</h3>
                        <strong>${D2.money(product.price)}</strong>
                        <div class="d2-wishlist-actions">
                            <button class="d2-small-button"
                                data-d2-wishlist-action="add-cart"
                                data-id="${D2.escape(product.id)}">
                                Add to Cart
                            </button>
                            <button class="d2-remove-button"
                                data-d2-wishlist-action="remove"
                                data-id="${D2.escape(product.id)}">
                                Remove
                            </button>
                        </div>
                    </div>
                </article>
            `).join("");
        }

        document.querySelectorAll(
            "#wishlistCount, #wishlist-count, .wishlist-count, [data-wishlist-count]"
        ).forEach(element => {
            element.textContent = wishlist.length;
        });
    }

    function addToWishlist(product) {
        if (!product) {
            D2.notify("Could not read this product's details.", "error");
            return;
        }

        const wishlist = D2.getWishlist();

        if (wishlist.some(item => item.id === product.id)) {
            D2.notify("This product is already in your wishlist.", "info");
            return;
        }

        wishlist.push(product);
        D2.saveWishlist(wishlist);
        D2.notify(`${product.name} saved to your wishlist.`);
    }

    function openWishlist() {
        createPanel();
        renderWishlist();
        panel.classList.add("d2-drawer-open");
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.add("d2-no-scroll");
    }

    function closeWishlist() {
        if (!panel) return;
        panel.classList.remove("d2-drawer-open");
        panel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("d2-no-scroll");
    }

    document.addEventListener("click", event => {
        const openButton = event.target.closest("[data-d2-open-wishlist]");

        if (openButton) {
            event.preventDefault();
            openWishlist();
            return;
        }

        const saveButton = event.target.closest(
            "[data-d2-save-wishlist], .d2-save-wishlist"
        );

        if (saveButton) {
            event.preventDefault();
            event.stopImmediatePropagation();
            addToWishlist(D2.getProduct(saveButton));
        }
    }, true);

    window.addEventListener("d2:wishlist-updated", renderWishlist);
    window.addEventListener("storage", renderWishlist);

    D2.addToWishlist = addToWishlist;
    D2.openWishlist = openWishlist;
    D2.renderWishlist = renderWishlist;

    createPanel();
    renderWishlist();

    console.log("ShopEase Day 2 wishlist loaded.");
})();