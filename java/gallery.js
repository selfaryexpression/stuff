/* -----------------------------------------
   GALLERY CONFIG
----------------------------------------- */
const batchSize = 25;
let currentIndex = 0;
let currentFilter = "all";

/* -----------------------------------------
   FILTER PHOTOS
----------------------------------------- */
function getFilteredPhotos() {
  return currentFilter === "all"
    ? photos
    : photos.filter(p => p.category === currentFilter);
}

/* -----------------------------------------
   CLEAR GALLERY
----------------------------------------- */
function clearGallery() {
  document.getElementById("gallery").innerHTML = "";
  currentIndex = 0;
}

/* -----------------------------------------
   LOAD PHOTOS IN BATCHES (UPDATED)
----------------------------------------- */
function loadPhotos() {
  const gallery = document.getElementById("gallery");
  const filtered = getFilteredPhotos();
  const nextBatch = filtered.slice(currentIndex, currentIndex + batchSize);

  nextBatch.forEach(photo => {
    const card = document.createElement("div");
    card.className = "photo-card";

    const clickableContent = photo.page
      ? `
        <a href="${photo.page}" class="photo-link">
          <img src="${photo.src}" loading="lazy" alt="${photo.caption}">
        </a>
      `
      : `
        <img src="${photo.src}" loading="lazy" alt="${photo.caption}"
            onclick="openLightbox('${photo.src}', '${photo.caption}')">
      `;

    card.innerHTML = `
      ${clickableContent}

        <div class="item-block" data-name="${photo.caption}" data-price="${photo.price}" data-img="${photo.src}">
                  
        <p class="item-title">${photo.caption}</p>

        <p>Price: $${photo.price.toFixed(2)}</p>

        <div class="qty-row">
          <label>Quantity:</label>
          <input type="number" class="qty-input" value="1" min="1">
        </div>

        <button onclick="addToCart(this)">Add to Cart</button>
      </div>
    `;

    gallery.appendChild(card);
  });

  currentIndex += batchSize;

  const loadMoreBtn = document.getElementById("loadMore");
  loadMoreBtn.style.display =
    currentIndex >= filtered.length ? "none" : "block";
}

/* Initial load */
loadPhotos();

/* Load more button */
document.getElementById("loadMore").addEventListener("click", loadPhotos);

/* -----------------------------------------
   FILTERING
----------------------------------------- */
document.getElementById("filter-category").addEventListener("change", function() {
  currentFilter = this.value;
  clearGallery();
  loadPhotos();
});

/* -----------------------------------------
   ADD TO CART
----------------------------------------- */
function addToCart(button) {
  const itemDiv = button.closest(".item-block");
  const name = itemDiv.dataset.name;
  const price = parseFloat(itemDiv.dataset.price);
  const qty = parseInt(itemDiv.querySelector(".qty-input").value);
  const img = itemDiv.dataset.img;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push({
    name,
    price,
    qty,
    img,               
    total: price * qty
  });

  localStorage.setItem("cart", JSON.stringify(cart));

  // 🔥 Update floating cart badge immediately
  updateCartCount();

  alert("Item added to cart!");
}

/* -----------------------------------------
   LIGHTBOX
----------------------------------------- */
function openLightbox(src, caption) {
  document.getElementById("lightbox-img").src = src;
  document.getElementById("lightbox-caption").textContent = caption;
  document.getElementById("lightbox").style.display = "flex";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

document.getElementById("lightbox").addEventListener("click", function(e) {
  if (e.target === this) closeLightbox();
});
