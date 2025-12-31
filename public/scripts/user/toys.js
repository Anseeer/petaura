
function Search(event) {
  event.preventDefault();
  let searchValue = document.getElementById("search").value;
  filterState.search = searchValue;
  fetchProducts(1);
}

function category(event, categoryValue) {
  event.preventDefault();
  document.querySelectorAll('ul.list-unstyled a').forEach(link => link.classList.remove('active'));
  event.currentTarget.classList.add('active');
  filterState.category = categoryValue;
  fetchProducts(1);
}

function Sort(event, sortValue) {
  event.preventDefault();
  filterState.sort = sortValue;
  fetchProducts(1);
}

function fetchProducts(page) {
  const { category, sort, search } = filterState;

  const urlParams = new URLSearchParams({
    category,
    sort,
    search,
    page,
  });
  history.pushState(null, '', `/toys?${urlParams.toString()}`);

  fetch(`/fillterCategoryOfAccessories?${urlParams.toString()}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      renderProducts(data.product, data.totalPage, data.currentPage);
    })
    .catch(err => {
      console.error("Error fetching products:", err);
      document.getElementById("productContainer").innerHTML = "<p>An error occurred while fetching products. Please try again later.</p>";
    });
}

function renderProducts(products, totalPage, currentPage) {
  const productContainer = document.getElementById("productContainer");
  const pagination = document.getElementById("pagination");
  productContainer.innerHTML = "";
  pagination.innerHTML = "";

  if (products.length === 0) {
    productContainer.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach((product, index) => {
    const productDetails = `
        <div class="col-md-4 mb-4">
          <a href="/ProuctDetailsOfToys?product=${product._id}" class="text-decoration-none">
            <div class="Ccard position-relative">
              <!-- Wishlist Button -->
              <span onclick="event.stopPropagation(); return addToWishlist(event, '${product._id}')">
                <button id="wishlist-btn-${index}" class="wishlist-btn btn btn-light p-2 rounded-circle position-absolute top-0 end-0 m-2">
                  <i class="fa fa-heart"></i>
                </button>
              </span>

              <!-- Product Image -->
              <img src="${product.Image[0]}" alt="Product Image" class="Ccard-img-top">

              <!-- Card Body -->
              <div class="Ccard-body" style="text-align: left;">
                <h5 class="Ccard-title">Name: ${product.name}</h5>
                <p class="Ccard-text">Brand</p>
              <p class="Ccard-text">Price: ₹${product.finalPrice} <strike>₹${product.salePrice}</strike></p>
                ${product.Status === "Out of Stock" || product.quantity <= 0
        ? `<p style="color: red;">Out of Stock</p>`
        : `<span onclick="event.stopPropagation(); return addToCart(event, '${product._id}', '${index}')">
                        <button id="addToCart-${index}" class="btn btn-warning">Add to Cart</button>
                      </span>`
      }
              </div>
            </div>
          </a>
        </div>
      `;
    productContainer.innerHTML += productDetails;
  });

  pagination.innerHTML = `
      ${currentPage > 1
      ? `<a href="#" class="btn" onclick="fetchProducts(${currentPage - 1}); return false;">Previous</a>`
      : `<a class="btn disabled">Previous</a>`
    }

      ${Array.from({ length: totalPage }, (_, i) => `
        <a href="#" class="btn ${currentPage === i + 1 ? 'btn-secondary' : ''}" 
           onclick="fetchProducts(${i + 1}); return false;">
           ${i + 1}
        </a>
      `).join('')}

      ${currentPage < totalPage
      ? `<a href="#" class="btn" onclick="fetchProducts(${currentPage + 1}); return false;">Next</a>`
      : `<a class="btn disabled">Next</a>`
    }
    `;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  filterState.category = params.get('category') || filterState.category;
  filterState.sort = params.get('sort') || "";
  filterState.search = params.get('search') || "";

  if (filterState.search) {
    document.getElementById("search").value = filterState.search;
  }

  if (filterState.sort) {
    document.querySelector(`select option[value="${filterState.sort}"]`).selected = true;
  }

  const activeCategory = document.querySelector(`a[href*='${filterState.category}']`);
  if (activeCategory) {
    activeCategory.classList.add('active');
  }

  fetchProducts(1);
});

function addToWishlist(e, id) {
  e.preventDefault();

  const button = e.currentTarget.querySelector('.wishlist-btn');


  if (button.style.color === 'white') {
    button.style.color = 'red';
    button.style.backgroundColor = 'white';
    fetch("/delete-from-whishlist", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          console.log("removed");
        } else {
          console.log("Faild To Remove")
        }
      })
      .catch(() => {
        console.log("Error");
      })

  } else {
    button.style.color = 'white';
    button.style.backgroundColor = 'red';
    console.log("Styart fetch")
    fetch("/add-to-whishlist", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          console.log("Sucessfully Added Whislist", response.message);
        } else {
          console.log("Faild To Add Whislist");
        }
      })
      .catch((err) => console.log(err.message))

  }

  console.log('Toggled wishlist button for product ID:', id);
}




function addToCart(e, id, index) {
  console.log("Product ID:", id);
  e.preventDefault();
  e.stopPropagation();
  const button = document.getElementById(`addToCart-${index}`);
  const badge = document.createElement('span');
  badge.classList.add('badge', 'bg-success');
  badge.innerText = "Added to Cart";

  button.parentElement.appendChild(badge);

  setTimeout(() => {
    badge.remove();
  }, 3000);

  fetch(`/add-to-cart?productId=${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        console.log('Product added successfully');
      }
    });
}

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
