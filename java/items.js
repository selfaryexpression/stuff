/* ============================================================
   ITEM PAGE SCRIPT
   Handles:
   - Image slider
   - Add to cart
============================================================ */


/* -----------------------------------------
   MODERN IMAGE SLIDER (no globals)
----------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const images = Array.from(document.querySelectorAll(".item-image-wrapper img"));
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (!images.length) return;

  let currentIndex = 0;

  function updateSlider() {
    images.forEach(img => img.classList.remove("active"));
    images[currentIndex].classList.add("active");
  }

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
  });

  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSlider();
  });

  updateSlider(); // show first image
});

/* -----------------------------------------
   ADD TO CART
----------------------------------------- */

window.addToCart = function (button) {
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
};
