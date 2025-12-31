function toggleDropdown() {
  const dropdownContainer = document.querySelector('.dropdown-container');
  dropdownContainer.classList.toggle('active');
}

document.addEventListener('click', (e) => {
  const dropdownContainer = document.querySelector('.dropdown-container');
  const iconContainer = document.querySelector('.icon-container');

  if (!dropdownContainer.contains(e.target) && !iconContainer.contains(e.target)) {
    dropdownContainer.classList.remove('active');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  fetchLatestProducts();
});

function fetchLatestProducts() {
  fetch("/latest-products")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        renderLatestProducts(data.products);
      } else {
        console.error("Failed to load latest products.");
      }
    })
    .catch((err) => {
      console.error("Error fetching products:", err);
    });
}

function renderLatestProducts(products) {
  const productContainer = document.getElementById("latest-products");

  productContainer.innerHTML = "";

  if (products.length === 0) {
    productContainer.innerHTML = "<p>No products available.</p>";
    return;
  }

  products.forEach((product) => {
    const productHTML = `

   <div class="product-card">
             
     <img src="${product.Image[0]}" alt="${product.name}" class="product-image">
     <h3 class="product-name">${product.name}</h3>
     <p class="product-price">₹${product.finalPrice}</p>
     <a href="/ProuctDetails?product=${product._id}" class="view-more">View Details</a>
   </div>
 `;

    productContainer.innerHTML += productHTML;
  });
}

