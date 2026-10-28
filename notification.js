/* ShopEase Day 2 - Shared Utilities and Notifications */
(function () {
    "use strict";

    const D2 = window.ShopEaseDay2 = window.ShopEaseDay2 || {};

    D2.cartKey = "shopeaseDay2Cart";
    D2.wishlistKey = "shopeaseDay2Wishlist";

    D2.read = function (key, fallback = []) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch {
            return fallback;
        }
    };

    D2.write = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };

    D2.money = function (amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number(amount) || 0);
    };

    D2.escape = function (value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    };

    D2.notify = function (message, type = "success") {
        let container = document.querySelector(".d2-toast-container");

        if (!container) {
            container = document.createElement("div");
            container.className = "d2-toast-container";
            container.setAttribute("aria-live", "polite");
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `d2-toast d2-toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("d2-toast-visible"));

        setTimeout(() => {
            toast.classList.remove("d2-toast-visible");
            setTimeout(() => toast.remove(), 250);
        }, 2800);
    };

    D2.getProductFromCard = function (card) {
        if (!card) return null;

        const image = card.querySelector("img");
        const titleElement = card.querySelector(
            ".product-title, .product-name, h2, h3, h4"
        );
        const priceElement = card.querySelector(
            ".product-price, .price, [data-price]"
        );

        const title = (
            card.dataset.name ||
            card.dataset.title ||
            titleElement?.textContent ||
            ""
        ).trim();

        const rawPrice =
            card.dataset.price ||
            priceElement?.dataset.price ||
            priceElement?.textContent ||
            "";

        const priceMatch = String(rawPrice).replace(/,/g, "").match(/\d+(?:\.\d+)?/);

        if (!title || !priceMatch) return null;

        const imageUrl = image?.currentSrc || image?.src || "";

        return {
            id: String(card.dataset.id || card.dataset.productId || title),
            name: title,
            price: Number(priceMatch[0]),
            image: imageUrl,
            description: (
                card.dataset.description ||
                card.querySelector(".product-description, .description")
                    ?.textContent ||
                ""
            ).trim(),
            rating: Number(card.dataset.rating || 4.5)
        };
    };

    D2.findProductCard = function (element) {
        return element.closest(
            "[data-product-id], [data-id].product-card, .product-card, .product-item, .product"
        );
    };

    D2.getProduct = function (element) {
        const card = D2.findProductCard(element);
        return D2.getProductFromCard(card);
    };

    D2.getCart = function () {
        return D2.read(D2.cartKey);
    };

    D2.saveCart = function (cart) {
        D2.write(D2.cartKey, cart);
        window.dispatchEvent(new CustomEvent("d2:cart-updated", {
            detail: { cart }
        }));
    };

    D2.getWishlist = function () {
        return D2.read(D2.wishlistKey);
    };

    D2.saveWishlist = function (wishlist) {
        D2.write(D2.wishlistKey, wishlist);
        window.dispatchEvent(new CustomEvent("d2:wishlist-updated", {
            detail: { wishlist }
        }));
    };

    console.log("ShopEase Day 2 utilities loaded.");
})();