function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let totalQty = 0;

  cart.forEach(item => {
    totalQty += item.qty;
  });

  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = totalQty;
  }
}

updateCartCount();
