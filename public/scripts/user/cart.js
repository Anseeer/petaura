
        
function toggleLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
  }
      
      document.addEventListener("DOMContentLoaded",()=>{
          const footer = document.getElementById("footer");
          footer.style.display="none";
          toggleLoading(true);
         fetchCart();
      })

     function fetchCart(){
          fetch("/fetchCart",{
              method:"GET",
              headers:{
                  'Content-Type':'application',
              }
          })
          
          .then((res)=> res.json())
          .then((res)=>{
              toggleLoading(false);
              footer.style.display="block";
              if(res.success){
                  console.log("res:",res)
                  renderCart(res.cart);
              }else{
                  toggleLoading(false);
                  Swal.fire({
                      icon:"error",
                      title:"Faild To Fetch  Cart Data`s ",
                      showCancelButton:false,
                      showConfirmButton:false,
                      timer:1200,
                  })
              }
          })
          .catch(()=>{
              toggleLoading(false);
              footer.style.display="block";
              Swal.fire({
                      icon:"error",
                      title:"Error In Fetch  Cart Data`s ",
                      showCancelButton:false,
                      showConfirmButton:false,
                      timer:1200,
                  })
          })
      }

  function renderCart(cart) {
  const product = document.getElementById("cart-products");
  const summury = document.getElementById("cart-summury");
  const cartContainer = document.getElementById("cart-container"); // Make sure cart-container is the parent container

  product.innerHTML = "";
  summury.innerHTML = "";

  if (cart.items.length === 0) {
      cartContainer.innerHTML = `
          <div class="empty-cart ">
              <p class="empty">Your cart is empty.<a href="/" class="btn shop-btn">Shop Now</a></p>
              
          </div>
      `;
      return; // Exit the function if cart is empty
  }

  cart.items.forEach((item) => {
      let productData = ` 
          <div class="cart-item">
              <button class="remove-btn" onclick="return removeFromCart(event, '${item.productId._id}')">&times;</button>
              <!-- Product Image -->
              <img src="${item.productId.Image[0]}" alt="${item.productId.name}" class="product-img">
              <!-- Product Name -->
              <div>
                  <div class="fw-bold">${item.productId.name}</div>
                  <a href="/viewMoreDetails?id=${item.productId._id}" class="text-primary text-decoration-none">VIEW MORE DETAILS</a>
              </div>
              <!-- Product Price -->
              <div class="ms-auto text-warning fw-bold">₹${item.productId.finalPrice}</div>
              <!-- Quantity -->
              <div class="quantity-control">
                  <button class="decrease" id="decrease" onclick="decreaseQty(event, '${item._id}', '${item.productId.quantity}')">-</button>
                  <input type="number" id="quantity-${item._id}" value="${item.quantity}" class="quantity-input" readonly>
                  <button class="increase" id="increase" onclick="increaseQty(event, '${item._id}', '${item.productId.quantity}')">+</button>
              </div>
          </div>
      `;
      product.innerHTML += productData;
  });

  // Calculate delivery fee and total price dynamically
  const deliveryFee = cart.totalPrice < 500 ? 40 : 0;
  const totalPrice = cart.totalPrice + deliveryFee;

  summury.innerHTML = `
      <div class="order-summary">
          <h5 class="fw-bold">Order Summary</h5>
          <div class="d-flex justify-content-between">
              <span>Subtotal</span>
              <span id="subTotal">₹${cart.totalPrice.toFixed(2)}</span>
          </div>
          <div class="d-flex justify-content-between">
              <span>Delivery:</span>
              <span id="deliveryFee">₹${deliveryFee > 0 ? deliveryFee : 'Free'}</span>
          </div>
          <hr />
          <div class="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span id="totalPrice">₹${totalPrice.toFixed(2)}</span>
          </div>
          <a href="/checkout-page"><button class="btn checkout-btn btn-dark mt-3">Checkout</button></a>
          <div class="text-center mt-2">
              <a href="/" class="text-dark text-decoration-none"><u>Continue Shopping</u></a>
          </div>
      </div>
  `;
}


function decreaseQty(event, productId, quantity) {
  const input = document.getElementById(`quantity-${productId}`);
  let currentQty = parseInt(input.value);

  if (currentQty > 1) {
      currentQty--;
      input.value = currentQty;
      updateCart(productId, currentQty, quantity); // Update the cart on the backend
  } else {
      Swal.fire({
          icon:"error",
          title:"Minimum quantity is 1",
          showCancelButton:false,
          showConfirmButton:false,
          timer:1500
      })
  }
}

function increaseQty(event, productId, quantity) {
  console.log("the quantity is:",quantity);
  const input = document.getElementById(`quantity-${productId}`);
  let currentQty = parseInt(input.value);

  if (currentQty < quantity) {
      currentQty++;
      input.value = currentQty;
      updateCart(productId, currentQty, quantity); // Update the cart on the backend
  } else {
      Swal.fire({
          icon:"error",
          title:"Cannot exceed available stock",
          showCancelButton:false,
          showConfirmButton:false,
          timer:1500
      })
  }
}


function updateCart(productId, currentQty, quantity) {
  console.log("Update", "productId", productId, "currentQty:", currentQty, "quan:", quantity);
  fetch('/update-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, currentQty }),
  })
      .then((response) => response.json())
      .then((data) => {
          if (data.success) {
              console.log("Cart updated successfully.");
              // Update the DOM directly
              const Subtotal = document.getElementById("subTotal");
              const totalPrice = document.getElementById("totalPrice");
              const deliveryFee = document.getElementById("deliveryFee");

              // Update the subtotal and total price
              const roundedTotalPrice = Math.round(data.cart.totalPrice * 100) / 100;

              Subtotal.textContent = `₹${roundedTotalPrice.toFixed(2)}`;

              const finalTotalPrice =
                  roundedTotalPrice > 500 ? roundedTotalPrice : Math.round((roundedTotalPrice + 40) * 100) / 100;

              totalPrice.textContent = `₹${finalTotalPrice.toFixed(2)}`;
              deliveryFee.textContent = roundedTotalPrice > 500 ? "Free" : "₹40";

              // Optionally, update the item's quantity in the UI
              const input = document.getElementById(`quantity-${productId}`);
              input.value = currentQty;
          } else {
              Swal.fire({
                  icon: "error",
                  title: data.message || "Failed to update cart",
                  showCancelButton: false,
                  showConfirmButton: false,
                  timer: 1500,
              });

              // Reset the quantity input to the original value if the update fails
              const input = document.getElementById(`quantity-${productId}`);
              input.value = quantity > 1 ? quantity : 1;
          }
      })
      .catch((error) => {
          console.error("Error updating cart:", error);
          Swal.fire({
              icon: "error",
              title: "Error updating cart",
              text: "Please try again later.",
              showCancelButton: false,
              showConfirmButton: false,
              timer: 1500,
          });
      });
}

function updateCart(productId,currentQty ,quantity) {
  console.log("Update","productId",productId,"currentQty:",currentQty,"quan:",quantity);
  fetch('/update-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, currentQty }),
  })
      .then((response) => response.json()) 
      .then((data) => {

          if (data.success) {
              console.log("Cart updated successfully.")
              const Subtotal = document.getElementById("subTotal");
              const totalPrice = document.getElementById("totalPrice");
              const deliveryFee = document.getElementById("deliveryFee");
              // Round total price to 2 decimal places
              const roundedTotalPrice = Math.round(data.cart.totalPrice * 100) / 100;

              // Update Subtotal
              Subtotal.textContent =` ₹${roundedTotalPrice.toFixed(2)}`;

              // Calculate and Update Total Price
              const finalTotalPrice = roundedTotalPrice > 500 
                  ? roundedTotalPrice 
                  : Math.round((roundedTotalPrice + 40) * 100) / 100;
              totalPrice.textContent =` ₹${finalTotalPrice.toFixed(2)}`;

              // Update Delivery Fee
              deliveryFee.textContent = roundedTotalPrice > 500 ? "Free" : "₹40";

              fetchCart();
          } else {
              Swal.fire({
                  icon:"error",
                  title:data.message || "Failed to update cart",
                  showCancelButton:false,
                  showConfirmButton:false,
                  timer:1500
              })
              const input = document.getElementById(`quantity-${productId}`);
              input.value = quantity > quantity ? quantity : 1;
          }
      })
      // .then(()=> window.location.reload())
      .catch((error) => console.error("Error updating cart:", error));
}

      function removeFromCart(event, productId) {
          event.preventDefault(); // Prevent default form submission
      
          fetch(`/remove-from-cart?productId=${productId}`, {
              method: "GET",
              headers: {
                  'Content-Type': 'application/json'
              }
          })
          .then((res) => res.json())
          .then((data) => {
              console.log("Data:",data.datas)
              if (data.success) {
                  Swal.fire({
                      icon: "success",
                      title: "Removed",
                       showCancelButton: false,
                      showConfirmButton: false,
                      timer: 1500,
                  })
                  fetchCart();

              } else {
                  Swal.fire({
                      icon: "error",
                      title: "Failed to Remove",
                      text: data.message,
                      showCancelButton: false,
                      showConfirmButton: false,
                      timer: 1500,
                  });
              }
          })
          .catch(() => {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "An error occurred while removing the item.",
                  showCancelButton: false,
                  showConfirmButton: false,
                  timer: 1500,
              });
          });
      }

      
