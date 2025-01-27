  // Thumbnail functionality
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('main-image');

  thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
          const newImageSrc = this.getAttribute('data-image');
          mainImage.src = newImageSrc;
      });
  });

  // Zoom functionality
  let zoomLevel = 1;
  mainImage.addEventListener('click', function() {
      zoomLevel = zoomLevel === 1 ? 2 : 1; // Toggle zoom between 1x and 2x
      this.style.transform = `scale(${zoomLevel})`; // Correct use of template literals
  });

  mainImage.addEventListener('wheel', function(event) {
      event.preventDefault();
      if (zoomLevel > 1) {
          zoomLevel += event.deltaY * -0.01;
          zoomLevel = Math.min(Math.max(zoomLevel, 1), 5); // Restrict zoom between 1x and 5x
          this.style.transform = `scale(${zoomLevel})`; // Correct use of template literals
      }
  });

  // Tab toggle functionality
  const descriptionTab = document.getElementById('description-tab');
  const reviewTab = document.getElementById('review-tab');
  const descriptionContent = document.getElementById('description-content');
  const reviewContent = document.getElementById('review-content');

  descriptionTab.addEventListener('click', () => {
      descriptionTab.classList.add('active');
      reviewTab.classList.remove('active');
      descriptionContent.classList.add('active');
      reviewContent.classList.remove('active');
  });

  reviewTab.addEventListener('click', () => {
      reviewTab.classList.add('active');
      descriptionTab.classList.remove('active');
      reviewContent.classList.add('active');
      descriptionContent.classList.remove('active');
  });

  
function addToWishlist(e, id) {
e.preventDefault();

const button = document.getElementById('wishlist-btn');


if (button.style.color === 'white') {
  button.style.color = 'red';
  button.style.backgroundColor = 'white';
  fetch("/delete-from-whishlist",{
                  method:"POST",
                  headers:{
                      'Content-Type':'application/json'
                  },
                  body:JSON.stringify({id})
              })
              .then((response)=> response.json())
              .then((response)=>{
                if(response.success){
                  console.log("removed");
                }else{
                  console.log("Faild To Remove")
                }
              })
              .catch(()=>{
                console.log("Error");
              })
  
} else {
  button.style.color = 'white';
  button.style.backgroundColor = 'red';
  console.log("Styart fetch")
  fetch("/add-to-whishlist",{
    method:"POST",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({id})
  })
  .then((response)=> response.json())
  .then((response)=>{
    if(response.success){
      console.log("Sucessfully Added Whislist",response.message);
    }else{
      console.log("Faild To Add Whislist");
    }
  })
  .catch((err)=> console.log(err.message))

}

console.log('Toggled wishlist button for product ID:', id);
}

function addToCart(e, id) {
e.preventDefault();
const button = document.getElementById("addToCart");

if (button.style.backgroundColor === 'red') {
  // Change button style to indicate removal
  button.style.color = 'red';
  button.style.backgroundColor = 'white';

  // Fetch to remove from cart
  fetch(`/remove-from-cart?productId=${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(response => {
    if (response.success) {
      console.log("Successfully removed from cart");
    } else {
      console.log("Failed to remove from cart");
    }
  })
  .catch(() => {
    console.log("Error removing from cart");
  });

} else {
  // Change button style to indicate addition
  button.style.color = 'white';
  button.style.backgroundColor = 'red';
  console.log("Starting fetch to add");

  // Fetch to add to cart
  fetch(`/add-to-cart?productId=${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(response => {
    if (response.success) {
      console.log("Successfully added to cart", response.message);
    } else {
      console.log("Failed to add to cart");
    }
  })
  .catch(err => console.log("Error adding to cart:", err.message));
}
}


function addToWishlistRelated(e, id) {
  e.preventDefault();

  const button = e.currentTarget;


  if (button.style.color === 'white') {
    button.style.color = 'red';
    button.style.backgroundColor = 'white';
    fetch("/delete-from-whishlist",{
                    method:"POST",
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({id})
                })
                .then((response)=> response.json())
                .then((response)=>{
                  if(response.success){
                    console.log("removed");
                  }else{
                    console.log("Faild To Remove")
                  }
                })
                .catch(()=>{
                  console.log("Error");
                })
    
  } else {
    button.style.color = 'white';
    button.style.backgroundColor = 'red';
    console.log("Styart fetch")
    fetch("/add-to-whishlist",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({id})
    })
    .then((response)=> response.json())
    .then((response)=>{
      if(response.success){
        console.log("Sucessfully Added Whislist",response.message);
      }else{
        console.log("Faild To Add Whislist");
      }
    })
    .catch((err)=> console.log(err.message))

  }

  console.log('Toggled wishlist button for product ID:', id);
}

// function addToWishlistRelated(e, id) {
//   e.preventDefault();

//   const button = e.currentTarget; // Reference the button directly
//   button.classList.toggle('active'); // Toggle the active class for styles

//   if (button.classList.contains('active')) {
//     // Add to wishlist
//     fetch("/delete-from-whishlist",{
//                           method:"POST",
//                           headers:{
//                               'Content-Type':'application/json'
//                           },
//                           body:JSON.stringify({id})
//                       })
//                       .then((response)=> response.json())
//                       .then((response)=>{
//                         if(response.success){
//                           console.log("removed");
//                         }else{
//                           console.log("Faild To Remove")
//                         }
//                       })
//                       .catch(()=>{
//                         console.log("Error");
//                       })
          
//   } else {
//     fetch("/add-to-whishlist",{
//             method:"POST",
//             headers:{
//               'Content-Type':'application/json'
//             },
//             body:JSON.stringify({id})
//           })
//           .then((response)=> response.json())
//           .then((response)=>{
//             if(response.success){
//               console.log("Sucessfully Added Whislist",response.message);
//             }else{
//               console.log("Faild To Add Whislist");
//             }
//           })
//           .catch((err)=> console.log(err.message))
//   }

//   console.log("Toggled wishlist button for product ID:", id);
// }


function addToCartRelated(e, id,index) {
  console.log("Product ID:", id);  // Check if the ID is being passed correctly
  e.preventDefault();
  e.stopPropagation();
  const button = document.getElementById(`addToCart-${index}`);
  // Create a small badge (popup)
  const badge = document.createElement('span');
  badge.classList.add('badge', 'bg-success');
  badge.innerText = "Added to Cart";
  
  // Position the badge next to the button
  button.parentElement.appendChild(badge);

  // Set a timeout to remove the badge after a few seconds
  setTimeout(() => {
    badge.remove();
  }, 3000); // The badge will disappear after 3 seconds

  // Make the fetch request
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