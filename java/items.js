/* ============================================================
   ITEM PAGE SCRIPT
   Handles:
   - Image slider
   - Add to cart
============================================================ */

/* -----------------------------------------
   IMAGE SLIDER
----------------------------------------- */

let currentIndex = 0;

function showImage(index) {
  const images = document.querySelectorAll(".item-image-wrapper img");
  if (!images.length) return;

  images.forEach(img => img.classList.remove("active"));
  images[index].classList.add("active");
}

function nextImage() {
  const images = document.querySelectorAll(".item-image-wrapper img");
  if (!images.length) return;

  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex);
}

function prevImage() {
  const images = document.querySelectorAll(".item-image-wrapper img");
  if (!images.length) return;

  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(currentIndex);
}

/* Auto‑initialize first image */
document.addEventListener("DOMContentLoaded", () => {
  showImage(0);
});


/* -----------------------------------------
   ADD TO CART
----------------------------------------- */

function addToCart(button) {
  const itemDiv = button.closest(".item-block");
  if (!itemDiv) return;

  const name = itemDiv.dataset.name;
  const price = parseFloat(itemDiv.dataset.price);
  const qty = parseInt(itemDiv.querySelector(".qty-input").value);

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push({
    name,
    price,
    qty,
    total: price * qty
  });

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Item added to cart!");
}
