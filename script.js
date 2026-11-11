"use strict";

/* =========================================================
   ShopEase 4.0 — Electronics storefront
   Data is stored in this browser using localStorage.
   No real payment processing or backend is included.
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE = {
  cart: "shopease4_cart",
  wishlist: "shopease4_wishlist",
  users: "shopease4_users",
  session: "shopease4_session",
  orders: "shopease4_orders"
};

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("Browser storage is unavailable or full.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function imageURL(id, width = 650) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

const categories = [
  {
    name: "Smartphones",
    icon: "▣",
    color: "#9278ff",
    image: "photo-1511707171634-5f897ff02aa9",
    names: [
      "Apple iPhone 16", "Samsung Galaxy S25", "OnePlus 13", "Google Pixel 9",
      "Xiaomi 14", "Nothing Phone 3", "Samsung Galaxy A56", "iPhone 16 Pro",
      "OnePlus Nord 5", "Motorola Edge 60", "Redmi Note 14 Pro", "iPhone 16 Plus",
      "Samsung Galaxy S25 Ultra", "Vivo V50", "Realme GT 7 Pro"
    ]
  },
  {
    name: "Laptops",
    icon: "▱",
    color: "#58b7ff",
    image: "photo-1496181133206-80ce9b88a853",
    names: [
      "MacBook Air M4", "MacBook Pro M4", "Dell XPS 14", "HP Pavilion Plus",
      "Lenovo IdeaPad Slim 5", "ASUS Zenbook 14", "Acer Swift Go 14", "ASUS ROG Zephyrus G16",
      "HP Victus 15", "Lenovo LOQ Gaming", "Dell Inspiron 14", "Acer Aspire 7",
      "Microsoft Surface Laptop", "Samsung Galaxy Book5", "MSI Thin 15"
    ]
  },
  {
    name: "Tablets",
    icon: "▯",
    color: "#7ed8c2",
    image: "photo-1544244015-0df4b3ffc6b0",
    names: [
      "Apple iPad Air", "Apple iPad Pro", "Samsung Galaxy Tab S10", "Samsung Galaxy Tab A9+",
      "OnePlus Pad 2", "Xiaomi Pad 7", "Lenovo Tab P12", "Redmi Pad Pro",
      "Honor Pad 9", "Apple iPad mini", "Samsung Galaxy Tab S10 FE", "Realme Pad 2",
      "Lenovo Tab M11", "OnePlus Pad Go", "Nokia T21 Tablet"
    ]
  },
  {
    name: "Audio & Headphones",
    icon: "♫",
    color: "#d39aff",
    image: "photo-1505740420928-5e560c06d30b",
    names: [
      "Sony WH-1000XM5", "Bose QuietComfort Ultra", "Apple AirPods Pro 2", "Samsung Galaxy Buds3 Pro",
      "JBL Tune 770NC", "Nothing Ear", "Sony WF-1000XM5", "JBL Flip 6 Speaker",
      "Bose SoundLink Flex", "Sennheiser Momentum 4", "OnePlus Buds Pro 3", "JBL Live 670NC",
      "Apple AirPods 4", "Marshall Emberton III", "Boat Nirvana 751 ANC"
    ]
  },
  {
    name: "Smartwatches",
    icon: "◷",
    color: "#ffad83",
    image: "photo-1523275335684-37898b6baf30",
    names: [
      "Apple Watch Series 10", "Samsung Galaxy Watch 7", "Google Pixel Watch 3", "OnePlus Watch 2",
      "Garmin Venu 3", "Amazfit Balance", "Noise ColorFit Pro 5", "Fitbit Versa 4",
      "Apple Watch Ultra 2", "Samsung Galaxy Watch Ultra", "CMF Watch Pro 2", "Titan Smart Pro",
      "Fossil Gen 6 Smartwatch", "Huawei Watch GT 5", "boAt Lunar Oasis"
    ]
  },
  {
    name: "Gaming",
    icon: "⌁",
    color: "#ff8eaa",
    image: "photo-1593305841991-05c297ba4575",
    names: [
      "PlayStation 5 Slim", "Xbox Series X", "Nintendo Switch OLED", "Logitech G502 Gaming Mouse",
      "Razer BlackWidow Keyboard", "HyperX Cloud III Headset", "Xbox Wireless Controller", "DualSense Edge Controller",
      "Logitech G Pro X Superlight", "Razer Kishi Mobile Controller", "SteelSeries Arctis Nova 7", "Elgato Stream Deck",
      "Corsair K70 RGB Keyboard", "ASUS TUF Gaming Mouse", "8BitDo Ultimate Controller"
    ]
  },
  {
    name: "Monitors & Displays",
    icon: "▭",
    color: "#78aaff",
    image: "photo-1527443224154-c4a3942d3acf",
    names: [
      "LG UltraGear 27-inch Monitor", "Samsung Odyssey G5", "Dell UltraSharp 27", "ASUS ProArt Display",
      "Acer Nitro 24-inch Monitor", "BenQ MOBIUZ EX2710", "LG 4K UHD Monitor", "Samsung Smart Monitor M8",
      "MSI MAG 32-inch Monitor", "Gigabyte M27Q Gaming Monitor", "Lenovo ThinkVision 24", "HP Series 5 Monitor",
      "ViewSonic VX Gaming Monitor", "AOC 27G4 Monitor", "Portable 15.6-inch Monitor"
    ]
  },
  {
    name: "Accessories",
    icon: "⌘",
    color: "#e6c17c",
    image: "photo-1498049794561-7780e7231661",
    names: [
      "Anker 65W USB-C Charger", "Samsung 25W Fast Charger", "Anker 20K Power Bank", "SanDisk 1TB Portable SSD",
      "Logitech MX Master 3S Mouse", "Keychron K2 Keyboard", "Anker USB-C Hub", "TP-Link Wi-Fi 6 Router",
      "Belkin 3-in-1 Charging Stand", "Portronics Laptop Stand", "Logitech Brio 4K Webcam", "Amazon Basics HDMI Cable",
      "Samsung T7 Shield SSD", "JBL USB-C Cable", "Ugreen 100W USB-C Cable"
    ]
  }
];

// Category-level fallback images used when a product has no local image.

const photoByCategory = [
  "photo-1511707171634-5f897ff02aa9",
  "photo-1496181133206-80ce9b88a853",
  "photo-1544244015-0df4b3ffc6b0",
  "photo-1505740420928-5e560c06d30b",
  "photo-1523275335684-37898b6baf30",
  "photo-1593305841991-05c297ba4575",
  "photo-1527443224154-c4a3942d3acf",
  "photo-1498049794561-7780e7231661"
];

// Individual product images.
// Keep these names and filenames exactly the same as your actual files.
const photoByProduct = {
  "Wireless Headphones": "./images/products/wireless-headphones.jpg",
  "Smart Watch": "./images/products/smart-watch.jpg",
  "Bluetooth Speaker": "./images/products/bluetooth-speaker.jpg",
  "Mechanical Keyboard": "./images/products/mechanical-keyboard.jpg",
  "Wireless Mouse": "./images/products/wireless-mouse.jpg",
  "Portable Charger": "./images/products/portable charger.jpg",
  "USB-C Hub": "./images/products/USB-c hub.webp",
  "Webcam HD": "./images/products/webcam hd.jpg",
  "Gaming Controller": "./images/products/game controller.jpg",
  "Desk Lamp": "./images/products/desk lamp.jpg",
  "Tablet Stand": "./images/products/tablet stand.jpg",
  "Laptop Sleeve": "./images/products/laptop sleeve.jpg",
  "Earbuds Pro": "./images/products/earbuds pro.jpg",
  "Power Bank": "./images/products/power bank.jpg",
  "Monitor Light": "./images/products/monitor light.jpg"
};

const products = categories.flatMap((category, categoryIndex) =>
  category.names.map((name, itemIndex) => {
    const id = categoryIndex * 15 + itemIndex + 1;
    const priceRanges = [
      [6999, 59999], [24999, 149999], [8999, 89999], [799, 34999],
      [1499, 49999], [999, 89999], [5999, 79999], [299, 24999]
    ];
    const [minPrice, maxPrice] = priceRanges[categoryIndex];
    const price = minPrice + ((id * 137 + categoryIndex * 89) % (maxPrice - minPrice + 1));
    const discount = [10, 15, 20, 25][id % 4];

    return {
      id,
      name,
      category: category.name,
      categoryIndex,
      price,
      oldPrice: Math.round(price / (1 - discount / 100)),
      discount,
      rating: Number((4.0 + ((id * 7) % 10) / 10).toFixed(1)),
      reviews: 12 + ((id * 19) % 430),
      image: photoByProduct[name] ||
        imageURL(photoByCategory[categoryIndex] || category.image),
      description:
        `${name} from our ${category.name} collection. ` +
        "Explore key specifications, compare your options and find the right technology for your everyday needs.",
      badge: id % 7 === 0 ? "POPULAR" : id % 5 === 0 ? "GREAT FIND" : ""
    };
  })
);

// Debug check for the first mapped product.
console.log(
  "Wireless Headphones image:",
  photoByProduct["Wireless Headphones"]
);

console.log(
  "Generated product:",
  products.find(product => product.name === "Wireless Headphones")
);

let cart = readStore(STORAGE.cart, []);
let wishlist = readStore(STORAGE.wishlist, []);
let orders = readStore(STORAGE.orders, []);
let users = readStore(STORAGE.users, []);
let session = readStore(STORAGE.session, null);

let activeCategory = "All Products";
let wishlistOnly = false;
let visibleLimit = 16;
let authMode = "login";
let toastTimer;
let currentOverlay = null;

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function getProduct(id) {
  return products.find(product => product.id === Number(id));
}

function productImage(product, width = 650) {
  const source = product.image.startsWith("https://images.unsplash.com/")
    ? product.image.replace("w=650", `w=${width}`)
    : product.image;

  return escapeHTML(source);
}

// Fallback for broken images in product cards, cart, wishlist and quick view.
document.addEventListener("error", event => {
  const img = event.target;

  if (
    img instanceof HTMLImageElement &&
    !img.dataset.fallbackApplied
  ) {
    img.dataset.fallbackApplied = "true";
    img.src = "https://placehold.co/650x650/19192c/c9bbff?text=ShopEase";
  }
}, true);
function saveCart() {
  writeStore(STORAGE.cart, cart);
  updateCounts();
}

function saveWishlist() {
  writeStore(STORAGE.wishlist, wishlist);
  updateCounts();
}

function updateCounts() {
  $("#cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  $("#wishlistCount").textContent = wishlist.length;
}

function isWished(id) {
  return wishlist.includes(Number(id));
}

/* ---------------- Categories and filters ---------------- */

function renderCategories() {
  $("#categoryGrid").innerHTML = categories.map(category => `
    <button
      class="category-card"
      data-category="${escapeHTML(category.name)}"
      style="--glow:${category.color}"
    >
      <span class="category-icon">${category.icon}</span>
      <strong>${escapeHTML(category.name)}</strong>
      <small>15 products ↗</small>
    </button>
  `).join("");
}

function renderFilters() {
  const names = [
    "All Products",
    ...categories.map(category => category.name)
  ];

  $("#filterRow").innerHTML = names.map(name => `
    <button
      class="filter-chip ${name === activeCategory ? "active" : ""}"
      data-filter="${escapeHTML(name)}"
    >
      ${escapeHTML(name)}
    </button>
  `).join("");
}

function getFilteredProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();

  let result = products.filter(product => {
    const categoryMatch =
      activeCategory === "All Products" ||
      product.category === activeCategory;

    const wishlistMatch =
      !wishlistOnly || isWished(product.id);

    const queryMatch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return categoryMatch && wishlistMatch && queryMatch;
  });

  switch ($("#sortSelect").value) {
    case "price-low":
      result.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      result.sort((a, b) => b.price - a.price);
      break;

    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;

    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;

    default:
      result.sort((a, b) => a.id - b.id);
  }

  return result;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  const visible = filtered.slice(0, visibleLimit);

  $("#resultCount").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;

  $("#emptyState").classList.toggle(
    "hidden",
    filtered.length !== 0
  );

  $("#productGrid").classList.toggle(
    "hidden",
    filtered.length === 0
  );

  $("#loadMoreBtn").classList.toggle(
    "hidden",
    filtered.length <= visibleLimit
  );

  $("#productGrid").innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image-wrap" data-view="${product.id}">

        <img
          src="${productImage(product)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          data-product-image="${product.id}"
        >

        ${
          product.badge
            ? `<span class="product-badge">${escapeHTML(product.badge)}</span>`
            : ""
        }

        <button
          class="wish-toggle ${isWished(product.id) ? "active" : ""}"
          data-wish="${product.id}"
          aria-label="Toggle wishlist"
        >
          ${isWished(product.id) ? "♥" : "♡"}
        </button>

        <button class="quick-view" data-view="${product.id}">
          Quick view ↗
        </button>
      </div>

      <div class="product-info">
        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>

        <h3 class="product-name" data-view="${product.id}">
          ${escapeHTML(product.name)}
        </h3>

        <div class="product-rating">
          ★ ${product.rating}
          <span>(${product.reviews} reviews)</span>
        </div>

        <div class="product-bottom">
          <div>
            <span class="product-price">
              ${money(product.price)}
            </span>

            <span class="product-old-price">
              ${money(product.oldPrice)}
            </span>
          </div>

          <button class="add-btn" data-add="${product.id}">
            + Add
          </button>
        </div>
      </div>
    </article>
  `).join("");

  renderFilters();

  $$(".category-card").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === activeCategory
    );
  });
}

function setCategory(category) {
  activeCategory = category;
  wishlistOnly = false;
  visibleLimit = 16;
  renderProducts();
}

function resetFilters() {
  activeCategory = "All Products";
  wishlistOnly = false;
  visibleLimit = 16;

  $("#searchInput").value = "";
  $("#sortSelect").value = "featured";

  renderProducts();
}

/* ---------------- Cart ---------------- */

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const existing = cart.find(
    item => item.id === product.id
  );

  if (existing) {
    existing.qty = Math.min(existing.qty + 1, 99);
  } else {
    cart.push({
      id: product.id,
      qty: 1
    });
  }

  saveCart();
  renderCart();

  showToast(`${product.name} added to your cart.`);
}

function changeQty(id, amount) {
  const item = cart.find(
    entry => entry.id === Number(id)
  );

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(
      entry => entry.id !== Number(id)
    );
  } else {
    item.qty = Math.min(item.qty, 99);
  }

  saveCart();
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    return sum + (
      product ? product.price * item.qty : 0
    );
  }, 0);
}

function renderCart() {
  cart = cart.filter(
    item => getProduct(item.id) && item.qty > 0
  );

  saveCart();

  const container = $("#cartItems");
  const footer = $("#cartFooter");

  if (!cart.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <span>🛍</span>
        <h3>Your cart is waiting.</h3>
        <p>Discover something you'll love.</p>
        <button class="primary-btn" data-shop-now>
          Explore products
        </button>
      </div>
    `;

    footer.innerHTML = "";
    return;
  }

  container.innerHTML = cart.map(item => {
    const product = getProduct(item.id);

    return `
      <div class="cart-line">
        <img
          src="${productImage(product, 180)}"
          alt="${escapeHTML(product.name)}"
        >

        <div>
          <h4>${escapeHTML(product.name)}</h4>
          <p>${money(product.price)}</p>

          <div class="line-controls">
            <button
              data-qty="-1"
              data-id="${product.id}"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>${item.qty}</span>

            <button
              data-qty="1"
              data-id="${product.id}"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <button class="remove-btn" data-remove="${product.id}">
          Remove
        </button>
      </div>
    `;
  }).join("");

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 1999 ? 0 : 99;

  footer.innerHTML = `
    <div class="summary-row">
      <span>Subtotal</span>
      <strong>${money(subtotal)}</strong>
    </div>

    <div class="summary-row">
      <span>Shipping estimate</span>
      <strong>
        ${shipping === 0 ? "FREE" : money(shipping)}
      </strong>
    </div>

    <div class="summary-row total">
      <span>Total</span>
      <strong>${money(subtotal + shipping)}</strong>
    </div>

    <p class="fine-print">
      Demo checkout only. No real payment will be processed.
    </p>

    <button class="primary-btn full-btn" data-checkout>
      Continue to checkout ↗
    </button>
  `;
}

/* ---------------- Wishlist ---------------- */

function toggleWishlist(id) {
  id = Number(id);

  const product = getProduct(id);
  if (!product) return;

  if (isWished(id)) {
    wishlist = wishlist.filter(
      savedId => savedId !== id
    );

    showToast("Removed from your wishlist.");
  } else {
    wishlist.push(id);
    showToast("Added to your wishlist.");
  }

  saveWishlist();
  renderProducts();
  renderWishlist();
}

function renderWishlist() {
  const container = $("#wishlistItems");

  if (!wishlist.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <span>♡</span>
        <h3>Nothing saved just yet.</h3>
        <p>Tap the heart on any product to save it here.</p>
        <button class="primary-btn" data-shop-now>
          Discover products
        </button>
      </div>
    `;

    return;
  }

  container.innerHTML = wishlist.map(id => {
    const product = getProduct(id);

    if (!product) return "";

    return `
      <div class="wishlist-line">
        <img
          src="${productImage(product, 180)}"
          alt="${escapeHTML(product.name)}"
        >

        <div>
          <h4>${escapeHTML(product.name)}</h4>
          <p>${money(product.price)}</p>

          <div class="line-controls">
            <button data-add="${product.id}">
              + Add to cart
            </button>
          </div>
        </div>

        <button class="remove-btn" data-wish="${product.id}">
          Remove
        </button>
      </div>
    `;
  }).join("");
}
/* ---------------- Drawer and modal handling ---------------- */

function openPanel(element) {
  closePanels();

  currentOverlay = element;

  $("#overlay").classList.remove("hidden");
  element.classList.remove("hidden");

  document.body.classList.add("locked");
}

function closePanels() {
  $("#overlay").classList.add("hidden");

  $$(".drawer, .modal").forEach(element => {
    element.classList.add("hidden");
  });

  document.body.classList.remove("locked");
  currentOverlay = null;
}

function openCart() {
  renderCart();
  openPanel($("#cartDrawer"));
}

function openWishlist() {
  renderWishlist();
  openPanel($("#wishlistDrawer"));
}

/* ---------------- Product quick view ---------------- */

function openProduct(id) {
  const product = getProduct(id);
  if (!product) return;

  $("#productDetails").innerHTML = `
    <div class="product-detail-layout">
      <img
        class="product-detail-image"
        src="${productImage(product, 900)}"
        alt="${escapeHTML(product.name)}"
      >

      <div>
        <span class="eyebrow">
          ${escapeHTML(product.category.toUpperCase())}
        </span>

        <h2>${escapeHTML(product.name)}</h2>

        <div class="product-rating">
          ★ ${product.rating}
          <span>(${product.reviews} reviews)</span>
        </div>

        <div class="detail-price">
          ${money(product.price)}
          <span class="product-old-price">
            ${money(product.oldPrice)}
          </span>
        </div>

        <p>${escapeHTML(product.description)}</p>

        <p>
          ✓ Carefully selected everyday essential<br>
          ✓ Easy to add to your shopping bag<br>
          ✓ Demo storefront item
        </p>

        <div class="detail-actions">
          <button class="primary-btn" data-add="${product.id}">
            Add to cart
          </button>

          <button class="secondary-btn" data-wish="${product.id}">
            ${isWished(product.id) ? "♥ Saved" : "♡ Wishlist"}
          </button>
        </div>
      </div>
    </div>
  `;

  openPanel($("#productModal"));
}

/* ---------------- Checkout ---------------- */

function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 1999 ? 0 : 99;

  $("#checkoutSummary").innerHTML = `
    <div class="summary-row">
      <span>
        ${cart.reduce((n, item) => n + item.qty, 0)} item(s)
      </span>
      <strong>${money(subtotal)}</strong>
    </div>

    <div class="summary-row">
      <span>Shipping</span>
      <strong>${shipping ? money(shipping) : "FREE"}</strong>
    </div>

    <div class="summary-row total">
      <span>Order total</span>
      <strong>${money(subtotal + shipping)}</strong>
    </div>
  `;

  if (session) {
    $("#shippingName").value = session.name || "";
    $("#shippingEmail").value = session.email || "";
  }

  openPanel($("#checkoutModal"));
}

/* ---------------- Orders ---------------- */

function renderOrders() {
  const list = $("#ordersList");

  if (!orders.length) {
    list.innerHTML = `
      <div class="drawer-empty">
        <span>▤</span>
        <h3>No orders yet.</h3>
        <p>Your demo orders will appear here after checkout.</p>
      </div>
    `;

    return;
  }

  list.innerHTML = [...orders].reverse().map(order => `
    <article class="order-card">
      <h3>Order ${escapeHTML(order.id)}</h3>

      <p>
        ${escapeHTML(order.date)}
        ·
        ${escapeHTML(order.status)}
      </p>

      <div class="order-products">
        ${order.items.map(item => `
          <span>
            ${escapeHTML(item.name)} × ${item.qty}
          </span>
        `).join("")}
      </div>

      <div class="summary-row total">
        <span>Total</span>
        <strong>${money(order.total)}</strong>
      </div>
    </article>
  `).join("");
}

function openOrders() {
  renderOrders();
  openPanel($("#ordersModal"));
}

/* ---------------- Local demo accounts ---------------- */

// This is a basic frontend-only demonstration.
// It is NOT secure authentication and must not be used for real users.

function openAccount() {
  if (session) {
    $("#accountMessage").textContent =
      `Signed in as ${session.name} (${session.email}).`;

    $("#loginOpenBtn").textContent = "Account details";
    $("#logoutBtn").classList.remove("hidden");
  } else {
    $("#accountMessage").textContent =
      "Sign in or create a local demo account to personalize your shopping experience.";

    $("#loginOpenBtn").textContent = "Sign in / Register";
    $("#logoutBtn").classList.add("hidden");
  }

  $("#authError").textContent = "";
  $("#authName").value = "";
  $("#authEmail").value = "";
  $("#authPassword").value = "";

  setAuthMode("login");
  openPanel($("#accountModal"));
}

function setAuthMode(mode) {
  authMode = mode;

  const registering = mode === "register";

  $("#accountModalTitle").textContent =
    registering ? "Create your account." : "Welcome back.";

  $("#nameField").classList.toggle(
    "hidden",
    !registering
  );

  $("#authName").required = registering;

  $("#authPassword").autocomplete =
    registering ? "new-password" : "current-password";

  $("#authSubmit").textContent =
    registering ? "Create demo account" : "Sign in";

  $$(".auth-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.auth === mode
    );
  });
}

$("#accountForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#authName").value.trim();
  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const error = $("#authError");

  if (password.length < 6) {
    error.textContent =
      "Use at least 6 characters for this demo password.";
    return;
  }

  if (authMode === "register") {
    if (users.some(user => user.email === email)) {
      error.textContent =
        "An account with this email already exists in this browser.";
      return;
    }

    users.push({
      name,
      email,
      password
    });

    if (!writeStore(STORAGE.users, users)) {
      users = users.filter(
        user => user.email !== email
      );

      return;
    }
  }

  const user = users.find(
    entry =>
      entry.email === email &&
      entry.password === password
  );

  if (!user) {
    error.textContent = authMode === "register"
      ? "Account could not be created. Check browser storage."
      : "Email or password is incorrect. Create an account first if needed.";

    return;
  }

  session = {
    name: user.name,
    email: user.email
  };

  if (!writeStore(STORAGE.session, session)) {
    session = null;
    return;
  }

  $("#accountMessage").textContent =
    `Signed in as ${session.name} (${session.email}).`;

  $("#loginOpenBtn").textContent = "Account details";
  $("#logoutBtn").classList.remove("hidden");

  closePanels();
  showToast(`Welcome, ${user.name}!`);
});

$("#logoutBtn").addEventListener("click", () => {
  session = null;

  localStorage.removeItem(STORAGE.session);

  closePanels();
  openAccount();

  showToast("You have signed out.");
});

/* ---------------- Checkout and order creation ---------------- */

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!cart.length) {
    closePanels();
    showToast("Your cart is empty.");
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 1999 ? 0 : 99;

  const recipient = $("#shippingName").value.trim();
  const email = $("#shippingEmail").value.trim();
  const address = $("#shippingAddress").value.trim();

  if (!recipient || !email || !address) {
    showToast("Please complete all delivery details.");
    return;
  }

  const order = {
    id: `SE-${Date.now().toString().slice(-9)}`,
    date: new Date().toLocaleString("en-IN"),
    status: "Demo order placed",
    recipient,
    email,
    address,
    payment: $("#paymentMethod").value,

    items: cart.map(item => {
      const product = getProduct(item.id);

      return {
        id: item.id,
        name: product.name,
        price: product.price,
        qty: item.qty
      };
    }),

    total: subtotal + shipping
  };

  const updatedOrders = [...orders, order];

  // Only clear the cart after the order has been saved.
  if (!writeStore(STORAGE.orders, updatedOrders)) {
    return;
  }

  orders = updatedOrders;
  cart = [];

  if (!writeStore(STORAGE.cart, cart)) {
    showToast(
      "Order saved, but cart cleanup failed. Please review your cart."
    );
  }

  updateCounts();
  renderCart();
  closePanels();
  renderOrders();
  openOrders();

  showToast("Demo order placed successfully!");
});
/* ---------------- Click handling ---------------- */

// Delegated events keep dynamically generated product buttons working.
document.addEventListener("click", event => {
  const target = event.target.closest(
    "button, [data-view], [data-shop-now]"
  );

  if (!target) return;

  if (target.hasAttribute("data-close")) {
    closePanels();
    return;
  }

  if (target.hasAttribute("data-shop-now")) {
    closePanels();

    $("#shop").scrollIntoView({
      behavior: "smooth"
    });

    return;
  }

  if (target.hasAttribute("data-category")) {
    setCategory(target.dataset.category);

    $("#shop").scrollIntoView({
      behavior: "smooth"
    });

    return;
  }

  if (target.hasAttribute("data-filter")) {
    setCategory(target.dataset.filter);
    return;
  }

  if (target.hasAttribute("data-add")) {
    const id = Number(target.dataset.add);

    addToCart(id);

    if (target.closest("#productDetails")) {
      closePanels();
    }

    if (target.closest("#wishlistItems")) {
      renderWishlist();
    }

    return;
  }

  if (target.hasAttribute("data-wish")) {
    toggleWishlist(Number(target.dataset.wish));
    return;
  }

  if (target.hasAttribute("data-view")) {
    openProduct(Number(target.dataset.view));
    return;
  }

  if (target.hasAttribute("data-qty")) {
    changeQty(
      Number(target.dataset.id),
      Number(target.dataset.qty)
    );

    return;
  }

  if (target.hasAttribute("data-remove")) {
    cart = cart.filter(
      item => item.id !== Number(target.dataset.remove)
    );

    saveCart();
    renderCart();

    showToast("Product removed from cart.");
    return;
  }

  if (target.hasAttribute("data-checkout")) {
    openCheckout();
    return;
  }

  if (target.hasAttribute("data-auth")) {
    setAuthMode(target.dataset.auth);
    return;
  }
});

/* ---------------- Main event listeners ---------------- */

$("#overlay").addEventListener("click", closePanels);

$("#cartBtn").addEventListener("click", openCart);

$("#wishlistBtn").addEventListener("click", openWishlist);

$("#accountBtn").addEventListener("click", openAccount);

$("#loginOpenBtn").addEventListener("click", openAccount);

$("#viewWishlistBtn").addEventListener("click", openWishlist);

$("#viewOrdersBtn").addEventListener("click", openOrders);

$("#footerOrdersLink").addEventListener("click", event => {
  event.preventDefault();
  openOrders();
});

$("#footerWishlistLink").addEventListener("click", event => {
  event.preventDefault();
  openWishlist();
});

/* ---------------- Search and sorting ---------------- */

$("#searchInput").addEventListener("input", () => {
  visibleLimit = 16;
  renderProducts();
});

$("#sortSelect").addEventListener("change", renderProducts);

$("#loadMoreBtn").addEventListener("click", () => {
  visibleLimit += 16;
  renderProducts();
});

$("#resetFilters").addEventListener("click", resetFilters);

/* ---------------- Keyboard shortcuts ---------------- */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closePanels();
  }

  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(
      document.activeElement.tagName
    )
  ) {
    event.preventDefault();
    $("#searchInput").focus();
  }
});

/* ---------------- Initialize the storefront ---------------- */

function initializeShopEase() {
  // Validate stored product IDs and quantities.
  cart = Array.isArray(cart)
    ? cart.filter(item =>
        getProduct(item.id) &&
        Number.isInteger(item.qty) &&
        item.qty > 0
      )
    : [];

  wishlist = Array.isArray(wishlist)
    ? [
        ...new Set(
          wishlist
            .map(Number)
            .filter(id => !!getProduct(id))
        )
      ]
    : [];

  orders = Array.isArray(orders) ? orders : [];
  users = Array.isArray(users) ? users : [];

  if (
    session &&
    !users.some(user => user.email === session.email)
  ) {
    session = null;
    localStorage.removeItem(STORAGE.session);
  }

  renderCategories();
  renderProducts();
  renderCart();
  renderWishlist();
  updateCounts();

  // Update account labels without opening the account modal.
  if (session) {
    $("#accountMessage").textContent =
      `Signed in as ${session.name} (${session.email}).`;

    $("#loginOpenBtn").textContent = "Account details";
    $("#logoutBtn").classList.remove("hidden");
  }
}

/* ==========================================
   ShopEase - Horizontal Auto Banner Slider
========================================== */

(function initializeLandscapeBanners() {
  const viewport = document.querySelector("#seBannerViewport");
  const track = document.querySelector("#seBannerTrack");
  const previous = document.querySelector("#seBannerPrev");
  const next = document.querySelector("#seBannerNext");
  const dotsContainer = document.querySelector("#seBannerDots");

  if (!viewport || !track || !previous || !next || !dotsContainer) {
    return;
  }

  const cards = [...track.querySelectorAll(".se-promo-card")];
  const dots = [...dotsContainer.querySelectorAll("button")];

  if (!cards.length) return;

  let currentIndex = 0;
  let autoplay = null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function getStep() {
    if (cards.length < 2) return cards[0].offsetWidth;

    return cards[1].offsetLeft - cards[0].offsetLeft;
  }

  function getMaximumIndex() {
    const step = getStep();
    if (!step) return 0;

    return Math.max(
      0,
      Math.ceil(
        (viewport.scrollWidth - viewport.clientWidth) / step
      )
    );
  }

  function updateDots() {
    const maximum = getMaximumIndex();

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        "active",
        index === Math.min(currentIndex, maximum)
      );
    });
  }

  function moveTo(index) {
    const maximum = getMaximumIndex();

    if (index > maximum) {
      index = 0;
    }

    if (index < 0) {
      index = maximum;
    }

    currentIndex = index;

    viewport.scrollTo({
      left: currentIndex * getStep(),
      behavior: reducedMotion ? "auto" : "smooth"
    });

    updateDots();
  }

  function startAutoplay() {
    stopAutoplay();

    if (reducedMotion) return;

    autoplay = setInterval(() => {
      moveTo(currentIndex + 1);
    }, 3500);
  }

  function stopAutoplay() {
    clearInterval(autoplay);
  }

  previous.addEventListener("click", () => {
    moveTo(currentIndex - 1);
    startAutoplay();
  });

  next.addEventListener("click", () => {
    moveTo(currentIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      moveTo(index);
      startAutoplay();
    });
  });

  viewport.addEventListener("mouseenter", stopAutoplay);
  viewport.addEventListener("mouseleave", startAutoplay);

  viewport.addEventListener("scroll", () => {
    const step = getStep();

    if (step > 0) {
      currentIndex = Math.round(viewport.scrollLeft / step);
      updateDots();
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    currentIndex = 0;
    viewport.scrollLeft = 0;
    updateDots();
  });

  // Pause autoplay when the browser tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  updateDots();
  startAutoplay();
})();

initializeShopEase();