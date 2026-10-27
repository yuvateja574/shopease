
"use strict";

/* =========================================================
   ShopEase 2.0 — Frontend demo
   Data is stored in this browser using localStorage.
   No real payment processing or backend is included.
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE = {
  cart: "shopease2_cart",
  wishlist: "shopease2_wishlist",
  users: "shopease2_users",
  session: "shopease2_session",
  orders: "shopease2_orders"
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
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
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
    name: "Electronics", icon: "⌘", color: "#8b76ff",
    image: "photo-1498049794561-7780e7231661",
    names: ["Wireless Headphones", "Smart Watch", "Bluetooth Speaker", "Mechanical Keyboard", "Wireless Mouse", "Portable Charger", "USB-C Hub", "Webcam HD", "Gaming Controller", "Desk Lamp", "Tablet Stand", "Laptop Sleeve", "Earbuds Pro", "Power Bank", "Monitor Light"]
  },
  {
    name: "Fashion & Clothing", icon: "✧", color: "#e89dbd",
    image: "photo-1445205170230-053b83016050",
    names: ["Classic Cotton T-Shirt", "Relaxed Fit Hoodie", "Casual Linen Shirt", "Everyday Denim Jacket", "Comfort Joggers", "Oversized Sweatshirt", "Essential Polo Shirt", "Casual Chinos", "Lightweight Jacket", "Cotton Overshirt", "Everyday Shorts", "Knit Sweater", "Classic Track Pants", "Zip-Up Hoodie", "Weekend Shirt"]
  },
  {
    name: "Footwear", icon: "◈", color: "#efad77",
    image: "photo-1542291026-7eec264c27ff",
    names: ["Urban Running Shoes", "Classic White Sneakers", "Everyday Slides", "Trail Walking Shoes", "Canvas High-Tops", "Comfort Sandals", "Minimal Leather Shoes", "Training Sneakers", "Casual Slip-Ons", "Streetwear Sneakers", "Lightweight Trainers", "Daily Walking Shoes", "Sport Sandals", "Classic Loafers", "Active Lifestyle Shoes"]
  },
  {
    name: "Accessories", icon: "◇", color: "#b49aff",
    image: "photo-1523275335684-37898b6baf30",
    names: ["Minimal Wallet", "Everyday Backpack", "Travel Crossbody Bag", "Classic Belt", "Polarized Sunglasses", "Compact Card Holder", "Canvas Tote Bag", "Everyday Cap", "Laptop Backpack", "Travel Organizer", "Key Organizer", "Minimal Sling Bag", "Leather Card Wallet", "Foldable Umbrella", "Everyday Pouch"]
  },
  {
    name: "Home & Living", icon: "⌂", color: "#85d5c2",
    image: "photo-1600210492486-724fe5c67fb0",
    names: ["Decorative Table Lamp", "Soft Cushion Set", "Minimal Wall Clock", "Ceramic Vase", "Cozy Throw Blanket", "Storage Basket", "Desk Organizer", "Scented Candle", "Decorative Mirror", "Indoor Planter", "Bedside Organizer", "Accent Table Decor", "Cotton Bedsheet Set", "Modern Bookend", "Photo Frame Set"]
  },
  {
    name: "Beauty & Personal Care", icon: "✿", color: "#f0a7c5",
    image: "photo-1596462502278-27bfdc403348",
    names: ["Daily Care Kit", "Hydrating Face Cream", "Gentle Face Cleanser", "Travel Grooming Kit", "Body Care Set", "Soft Makeup Brush Set", "Facial Care Essentials", "Hand Care Cream", "Beauty Organizer", "Compact Travel Mirror", "Hair Styling Brush", "Skin Care Pouch", "Daily Moisturizer", "Personal Care Set", "Beauty Travel Kit"]
  },
  {
    name: "Sports & Fitness", icon: "↗", color: "#90c6ff",
    image: "photo-1517836357463-d25dfeac3438",
    names: ["Training Yoga Mat", "Adjustable Dumbbells", "Resistance Band Set", "Insulated Water Bottle", "Gym Duffel Bag", "Sports Towel Set", "Fitness Jump Rope", "Workout Gloves", "Exercise Ball", "Running Belt", "Stretching Strap", "Gym Shaker Bottle", "Training Cones", "Yoga Block Set", "Sports Backpack"]
  },
  {
    name: "Books & Stationery", icon: "▤", color: "#e8ce8c",
    image: "photo-1455390582262-044cdead277a",
    names: ["Premium Notebook", "Daily Planner", "Gel Pen Set", "Hardcover Journal", "Desk Calendar", "Study Essentials Kit", "Sticky Notes Set", "Sketchbook", "Fine Liner Pens", "Document Organizer", "Bookmark Collection", "Writing Pad", "Color Pencil Set", "Weekly Planner", "Book Storage Stand"]
  },
  {
    name: "Kitchen & Dining", icon: "♨", color: "#ffb18b",
    image: "photo-1556911220-e15b29be8c8f",
    names: ["Ceramic Mug Set", "Insulated Travel Mug", "Glass Water Bottle", "Food Storage Set", "Kitchen Utensil Set", "Bamboo Cutting Board", "Reusable Lunch Box", "Measuring Cup Set", "Serving Bowl Set", "Spice Jar Set", "Kitchen Storage Rack", "Coffee Pour-Over Set", "Dish Drying Rack", "Reusable Snack Bags", "Tableware Set"]
  },
  {
    name: "Office & Workspace", icon: "▦", color: "#a9adff",
    image: "photo-1497366754035-f200968a6e72",
    names: ["Ergonomic Mouse Pad", "Laptop Riser", "Desk Organizer Set", "LED Desk Light", "Cable Management Kit", "Monitor Stand", "Footrest for Desk", "Office Notebook Set", "Desk Mat", "Laptop Stand", "Pen Holder", "Compact Desk Shelf", "Document Tray", "Wireless Presenter", "Workspace Organizer"]
  },
  {
    name: "Pet Supplies", icon: "♡", color: "#a8df9c",
    image: "photo-1450778869180-41d0601e046e",
    names: ["Pet Travel Bowl", "Comfort Pet Bed", "Adjustable Pet Leash", "Pet Grooming Brush", "Interactive Pet Toy", "Pet Feeding Mat", "Travel Pet Carrier", "Pet Storage Container", "Soft Pet Blanket", "Pet Walking Bag", "Pet Water Bottle", "Cozy Pet Cushion", "Pet Toy Bundle", "Pet Care Kit", "Pet Food Scoop"]
  },
  {
    name: "Toys & Games", icon: "☆", color: "#e6a6ee",
    image: "photo-1558060370-d644479cb6f7",
    names: ["Building Block Set", "Strategy Board Game", "Creative Art Kit", "Puzzle Challenge", "Family Card Game", "Remote Control Car", "STEM Discovery Kit", "Wooden Puzzle Set", "Travel Game Pack", "Mini Building Bricks", "Creative Drawing Kit", "Brain Teaser Set", "Tabletop Game", "Learning Activity Set", "Classic Chess Set"]
  },
  {
    name: "Travel & Luggage", icon: "✈", color: "#8bc8ef",
    image: "photo-1553062407-98eeb64c6a62",
    names: ["Cabin Travel Backpack", "Packing Cube Set", "Travel Neck Pillow", "Luggage Organizer", "Travel Toiletry Bag", "Compact Travel Pouch", "Passport Holder", "Lightweight Duffel Bag", "Travel Bottle Set", "Luggage Tag Set", "Foldable Travel Tote", "Weekend Travel Bag", "Travel Shoe Bag", "Digital Luggage Scale", "Travel Document Wallet"]
  },
  {
    name: "Automotive Accessories", icon: "⚙", color: "#b3b8ca",
    image: "photo-1492144534655-ae79c964c9d7",
    names: ["Car Phone Holder", "Car Seat Organizer", "Microfiber Cleaning Kit", "Car Trunk Organizer", "Compact Car Charger", "Dashboard Storage Tray", "Car Sunshade", "Travel Car Bin", "Car Cleaning Brush", "Seat Belt Cushion", "Car Interior Light", "Car Document Holder", "Compact Tire Gauge", "Car Cable Organizer", "Vehicle Storage Hooks"]
  },
  {
    name: "Watches & Jewelry", icon: "◉", color: "#e7ce86",
    image: "photo-1524592094714-0f0654e20314",
    names: ["Minimal Wrist Watch", "Classic Analog Watch", "Everyday Bracelet", "Pendant Necklace", "Minimal Ring Set", "Stud Earring Set", "Watch Storage Case", "Layered Necklace", "Classic Cuff Bracelet", "Jewelry Organizer", "Everyday Pendant", "Simple Chain Bracelet", "Travel Jewelry Case", "Minimalist Watch", "Gift Jewelry Box"]
  }
];

// Product photos are chosen by category.
// Unsplash image URLs require an internet connection.
const photoByCategory = [
  "photo-1505740420928-5e560c06d30b",
  "photo-1521572163474-6864f9cf17ab",
  "photo-1542291026-7eec264c27ff",
  "photo-1523275335684-37898b6baf30",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1596462502278-27bfdc403348",
  "photo-1517836357463-d25dfeac3438",
  "photo-1455390582262-044cdead277a",
  "photo-1556911220-e15b29be8c8f",
  "photo-1497366754035-f200968a6e72",
  "photo-1450778869180-41d0601e046e",
  "photo-1558060370-d644479cb6f7",
  "photo-1553062407-98eeb64c6a62",
  "photo-1492144534655-ae79c964c9d7",
  "photo-1524592094714-0f0654e20314"
];

const products = categories.flatMap((category, categoryIndex) =>
  category.names.map((name, itemIndex) => {
    const id = categoryIndex * 15 + itemIndex + 1;
    const price = 299 + ((id * 137 + categoryIndex * 89) % 4700);
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
      image: imageURL(photoByCategory[categoryIndex] || category.image),
      description:
        `${name} from our ${category.name} collection. ` +
        "A thoughtfully selected everyday essential, designed for style, convenience and everyday use.",
      badge: id % 7 === 0 ? "POPULAR" : id % 5 === 0 ? "GREAT FIND" : ""
    };
  })
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
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function getProduct(id) {
  return products.find(product => product.id === Number(id));
}

function productImage(product, width = 650) {
  return escapeHTML(product.image.replace("w=650", `w=${width}`));
}

function saveCart() {
  writeStore(STORAGE.cart, cart);
  updateCounts();
}

function saveWishlist() {
  writeStore(STORAGE.wishlist, wishlist);
  updateCounts();
}

function updateCounts() {
  $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  $("#wishlistCount").textContent = wishlist.length;
}

function isWished(id) {
  return wishlist.includes(Number(id));
}

/* ---------------- Categories and filters ---------------- */

function renderCategories() {
  $("#categoryGrid").innerHTML = categories.map((category, index) => `
    <button class="category-card" data-category="${escapeHTML(category.name)}"
      style="--glow:${category.color}">
      <span class="category-icon">${category.icon}</span>
      <strong>${escapeHTML(category.name)}</strong>
      <small>15 products ↗</small>
    </button>
  `).join("");
}

function renderFilters() {
  const names = ["All Products", ...categories.map(category => category.name)];

  $("#filterRow").innerHTML = names.map(name => `
    <button class="filter-chip ${name === activeCategory ? "active" : ""}"
      data-filter="${escapeHTML(name)}">${escapeHTML(name)}</button>
  `).join("");
}

function getFilteredProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();

  let result = products.filter(product => {
    const categoryMatch =
      activeCategory === "All Products" || product.category === activeCategory;

    const wishlistMatch = !wishlistOnly || isWished(product.id);

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

  $("#emptyState").classList.toggle("hidden", filtered.length !== 0);
  $("#productGrid").classList.toggle("hidden", filtered.length === 0);

  $("#loadMoreBtn").classList.toggle(
    "hidden",
    filtered.length <= visibleLimit
  );

  $("#productGrid").innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image-wrap" data-view="${product.id}">
        <img src="${productImage(product)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          data-product-image="${product.id}">
        ${product.badge ? `<span class="product-badge">${escapeHTML(product.badge)}</span>` : ""}
        <button class="wish-toggle ${isWished(product.id) ? "active" : ""}"
          data-wish="${product.id}" aria-label="Toggle wishlist">
          ${isWished(product.id) ? "♥" : "♡"}
        </button>
        <button class="quick-view" data-view="${product.id}">Quick view ↗</button>
      </div>
      <div class="product-info">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <h3 class="product-name" data-view="${product.id}">${escapeHTML(product.name)}</h3>
        <div class="product-rating">★ ${product.rating} <span>(${product.reviews} reviews)</span></div>
        <div class="product-bottom">
          <div>
            <span class="product-price">${money(product.price)}</span>
            <span class="product-old-price">${money(product.oldPrice)}</span>
          </div>
          <button class="add-btn" data-add="${product.id}">+ Add</button>
        </div>
      </div>
    </article>
  `).join("");

  $("#productGrid").querySelectorAll("img[data-product-image]").forEach(img => {
    img.addEventListener("error", () => {
      img.src = "https://placehold.co/650x650/19192c/c9bbff?text=ShopEase";
    }, { once: true });
  });

  renderFilters();
  $$(".category-card").forEach(button => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
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

  const existing = cart.find(item => item.id === product.id);

  if (existing) existing.qty = Math.min(existing.qty + 1, 99);
  else cart.push({ id: product.id, qty: 1 });

  saveCart();
  renderCart();
  showToast(`${product.name} added to your cart.`);
}

function changeQty(id, amount) {
  const item = cart.find(entry => entry.id === Number(id));
  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(entry => entry.id !== Number(id));
  } else {
    item.qty = Math.min(item.qty, 99);
  }

  saveCart();
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function renderCart() {
  cart = cart.filter(item => getProduct(item.id) && item.qty > 0);
  saveCart();

  const container = $("#cartItems");
  const footer = $("#cartFooter");

  if (!cart.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <span>🛍</span><h3>Your cart is waiting.</h3>
        <p>Discover something you'll love.</p>
        <button class="primary-btn" data-shop-now>Explore products</button>
      </div>`;
    footer.innerHTML = "";
    return;
  }

  container.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    return `
      <div class="cart-line">
        <img src="${productImage(product, 180)}" alt="${escapeHTML(product.name)}">
        <div>
          <h4>${escapeHTML(product.name)}</h4>
          <p>${money(product.price)}</p>
          <div class="line-controls">
            <button data-qty="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-qty="1" data-id="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-btn" data-remove="${product.id}">Remove</button>
      </div>`;
  }).join("");

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 1999 ? 0 : 99;

  footer.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div class="summary-row"><span>Shipping estimate</span><strong>${shipping === 0 ? "FREE" : money(shipping)}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div>
    <p class="fine-print">Demo checkout only. No real payment will be processed.</p>
    <button class="primary-btn full-btn" data-checkout>Continue to checkout ↗</button>`;
}

/* ---------------- Wishlist ---------------- */

function toggleWishlist(id) {
  id = Number(id);
  const product = getProduct(id);
  if (!product) return;

  if (isWished(id)) {
    wishlist = wishlist.filter(savedId => savedId !== id);
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
        <span>♡</span><h3>Nothing saved just yet.</h3>
        <p>Tap the heart on any product to save it here.</p>
        <button class="primary-btn" data-shop-now>Discover products</button>
      </div>`;
    return;
  }

  container.innerHTML = wishlist.map(id => {
    const product = getProduct(id);
    if (!product) return "";

    return `
      <div class="wishlist-line">
        <img src="${productImage(product, 180)}" alt="${escapeHTML(product.name)}">
        <div>
          <h4>${escapeHTML(product.name)}</h4>
          <p>${money(product.price)}</p>
          <div class="line-controls">
            <button data-add="${product.id}">+ Add to cart</button>
          </div>
        </div>
        <button class="remove-btn" data-wish="${product.id}">Remove</button>
      </div>`;
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
  $$(".drawer, .modal").forEach(element => element.classList.add("hidden"));
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

function openProduct(id) {
  const product = getProduct(id);
  if (!product) return;

  $("#productDetails").innerHTML = `
    <div class="product-detail-layout">
      <img class="product-detail-image" src="${productImage(product, 900)}" alt="${escapeHTML(product.name)}">
      <div>
        <span class="eyebrow">${escapeHTML(product.category.toUpperCase())}</span>
        <h2>${escapeHTML(product.name)}</h2>
        <div class="product-rating">★ ${product.rating} <span>(${product.reviews} reviews)</span></div>
        <div class="detail-price">${money(product.price)} <span class="product-old-price">${money(product.oldPrice)}</span></div>
        <p>${escapeHTML(product.description)}</p>
        <p>✓ Carefully selected everyday essential<br>✓ Easy to add to your shopping bag<br>✓ Demo storefront item</p>
        <div class="detail-actions">
          <button class="primary-btn" data-add="${product.id}">Add to cart</button>
          <button class="secondary-btn" data-wish="${product.id}">${isWished(product.id) ? "♥ Saved" : "♡ Wishlist"}</button>
        </div>
      </div>
    </div>`;

  const detailImg = $("#productDetails img");
  detailImg.addEventListener("error", () => {
    detailImg.src = "https://placehold.co/650x650/19192c/c9bbff?text=ShopEase";
  }, { once: true });

  openPanel($("#productModal"));
}

function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty.");
    return;
  }

  const subtotal = cartSubtotal();
  const shipping = subtotal >= 1999 ? 0 : 99;

  $("#checkoutSummary").innerHTML = `
    <div class="summary-row"><span>${cart.reduce((n, i) => n + i.qty, 0)} item(s)</span><strong>${money(subtotal)}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>${shipping ? money(shipping) : "FREE"}</strong></div>
    <div class="summary-row total"><span>Order total</span><strong>${money(subtotal + shipping)}</strong></div>`;

  if (session) {
    $("#shippingName").value = session.name || "";
    $("#shippingEmail").value = session.email || "";
  }

  openPanel($("#checkoutModal"));
}

function renderOrders() {
  const list = $("#ordersList");

  if (!orders.length) {
    list.innerHTML = `
      <div class="drawer-empty">
        <span>▤</span><h3>No orders yet.</h3>
        <p>Your demo orders will appear here after checkout.</p>
      </div>`;
    return;
  }

  list.innerHTML = [...orders].reverse().map(order => `
    <article class="order-card">
      <h3>Order ${escapeHTML(order.id)}</h3>
      <p>${escapeHTML(order.date)} · ${escapeHTML(order.status)}</p>
      <div class="order-products">
        ${order.items.map(item => `
          <span>${escapeHTML(item.name)} × ${item.qty}</span>
        `).join("")}
      </div>
      <div class="summary-row total">
        <span>Total</span><strong>${money(order.total)}</strong>
      </div>
    </article>
  `).join("");
}

function openOrders() {
  renderOrders();
  openPanel($("#ordersModal"));
}

/* ---------------- Local demo accounts ---------------- */

// This is intentionally a basic frontend-only demonstration.
// It is NOT secure authentication and must not be used for real users.

function openAccount() {
  if (session) {
    $("#accountMessage").textContent = `Signed in as ${session.name} (${session.email}).`;
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

  $("#accountModalTitle").textContent = registering ? "Create your account." : "Welcome back.";
  $("#nameField").classList.toggle("hidden", !registering);
  $("#authName").required = registering;
  $("#authPassword").autocomplete = registering ? "new-password" : "current-password";
  $("#authSubmit").textContent = registering ? "Create demo account" : "Sign in";

  $$(".auth-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.auth === mode);
  });
}

$("#accountForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#authName").value.trim();
  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const error = $("#authError");

  if (password.length < 6) {
    error.textContent = "Use at least 6 characters for this demo password.";
    return;
  }

  if (authMode === "register") {
    if (users.some(user => user.email === email)) {
      error.textContent = "An account with this email already exists in this browser.";
      return;
    }

    users.push({ name, email, password });
    if (!writeStore(STORAGE.users, users)) {
      users = users.filter(user => user.email !== email);
      return;
    }
  }

  const user = users.find(entry => entry.email === email && entry.password === password);

  if (!user) {
    error.textContent = authMode === "register"
      ? "Account could not be created. Check browser storage."
      : "Email or password is incorrect. Create an account first if needed.";
    return;
  }

  session = { name: user.name, email: user.email };
  if (!writeStore(STORAGE.session, session)) {
    session = null;
    return;
  }

  $("#accountMessage").textContent = `Signed in as ${session.name} (${session.email}).`;
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
  if (!writeStore(STORAGE.orders, updatedOrders)) return;

  orders = updatedOrders;
  cart = [];

  if (!writeStore(STORAGE.cart, cart)) {
    showToast("Order saved, but cart cleanup failed. Please review your cart.");
  }

  updateCounts();
  renderCart();
  closePanels();
  renderOrders();
  openOrders();
  showToast("Demo order placed successfully!");
});

/* ---------------- Click handling ---------------- */

// Delegated events keep all dynamically generated product buttons working.
document.addEventListener("click", event => {
  const target = event.target.closest("button, [data-view], [data-shop-now]");
  if (!target) return;

  if (target.hasAttribute("data-close")) {
    closePanels();
    return;
  }

  if (target.hasAttribute("data-shop-now")) {
    closePanels();
    $("#shop").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (target.hasAttribute("data-category")) {
    setCategory(target.dataset.category);
    $("#shop").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (target.hasAttribute("data-filter")) {
    setCategory(target.dataset.filter);
    return;
  }

  if (target.hasAttribute("data-add")) {
    const id = Number(target.dataset.add);
    addToCart(id);

    if (target.closest("#productDetails")) closePanels();
    if (target.closest("#wishlistItems")) renderWishlist();
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
    changeQty(Number(target.dataset.id), Number(target.dataset.qty));
    return;
  }

  if (target.hasAttribute("data-remove")) {
    cart = cart.filter(item => item.id !== Number(target.dataset.remove));
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

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanels();

  if (event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
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
    ? [...new Set(wishlist.map(Number).filter(id => !!getProduct(id)))]
    : [];

  orders = Array.isArray(orders) ? orders : [];
  users = Array.isArray(users) ? users : [];

  if (session && !users.some(user => user.email === session.email)) {
    session = null;
    localStorage.removeItem(STORAGE.session);
  }

  renderCategories();
  renderProducts();
  renderCart();
  renderWishlist();
  updateCounts();
  openAccount; // Account UI is updated below without opening a modal.

  if (session) {
    $("#accountMessage").textContent =
      `Signed in as ${session.name} (${session.email}).`;
    $("#loginOpenBtn").textContent = "Account details";
    $("#logoutBtn").classList.remove("hidden");
  }
}

initializeShopEase();
