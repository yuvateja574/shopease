/* ShopEase Day 2 - Product Quick View */
(function () {
    "use strict";

    const D2 = window.ShopEaseDay2;
    if (!D2) return;

    let modal;

    function createModal() {
        if (document.getElementById("d2-quickview")) {
            modal = document.getElementById("d2-quickview");
            return;
        }

        modal = document.createElement("div");
        modal.id = "d2-quickview";
        modal.className = "d2-modal";
        modal.setAttribute("aria-hidden", "true");

        modal.innerHTML = `
            <section class="d2-modal-card" role="dialog"
                aria-modal="true" aria-labelledby="d2-qv-title">
                <button class="d2-modal-close" data-d2-close-qv
                    aria-label="Close product details">&times;</button>

                <div class="d2-qv-layout">
                    <div class="d2-qv-image-wrap">
                        <img id="d2-qv-image" src="" alt="">
                    </div>
                    <div class="d2-qv-content">
                        <span class="d2-eyebrow">SHOPEASE COLLECTION</span>
                        <h2 id="d2-qv-title"></h2>
                        <div id="d2-qv-rating" class="d2-rating"></div>
                        <p id="d2-qv-price" class="d2-qv-price"></p>
                        <p id="d2-qv-description" class="d2-qv-description"></p>

                        <div class="d2-qv-actions">
                            <button class="d2-primary-button" data-d2-qv-add>
                                Add to Cart
                            </button>
                            <button class="d2-secondary-button" data-d2-qv-save>
                                ♡ Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;

        document.body.appendChild(modal);

        modal.addEventListener("click", event => {
            if (
                event.target === modal ||
                event.target.closest("[data-d2-close-qv]")
            ) {
                closeQuickView();
                return;
            }

            if (event.target.closest("[data-d2-qv-add]")) {
                if (modal._product) D2.addToCart(modal._product);
                closeQuickView();
            }

            if (event.target.closest("[data-d2-qv-save]")) {
                if (modal._product) D2.addToWishlist(modal._product);
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeQuickView();
        });
    }

    function openQuickView(product) {
        if (!product) {
            D2.notify("Could not load this product's details.", "error");
            return;
        }

        createModal();
        modal._product = product;

        const image = modal.querySelector("#d2-qv-image");
        image.src = product.image || "";
        image.alt = product.name;

        image.onerror = function () {
            this.style.visibility = "hidden";
        };

        image.onload = function () {
            this.style.visibility = "visible";
        };

        modal.querySelector("#d2-qv-title").textContent = product.name;
        modal.querySelector("#d2-qv-price").textContent =
            D2.money(product.price);

        modal.querySelector("#d2-qv-rating").textContent =
            `★ ${Math.min(5, Math.max(0, Number(product.rating) || 4.5)).toFixed(1)} / 5`;

        modal.querySelector("#d2-qv-description").textContent =
            product.description || "Discover this product from the ShopEase collection.";

        modal.classList.add("d2-modal-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("d2-no-scroll");
        modal.querySelector("[data-d2-close-qv]").focus();
    }

    function closeQuickView() {
        if (!modal) return;
        modal.classList.remove("d2-modal-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("d2-no-scroll");
    }

    document.addEventListener("click", event => {
        const button = event.target.closest(
            "[data-d2-quickview], .d2-quick-view"
        );

        if (!button) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        openQuickView(D2.getProduct(button));
    }, true);

    D2.openQuickView = openQuickView;
    D2.closeQuickView = closeQuickView;

    createModal();

    console.log("ShopEase Day 2 quick view loaded.");
})();