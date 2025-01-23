document.addEventListener("DOMContentLoaded",()=>{
    fetchAddress()
})

function fetchAddress(){
    fetch("/user/fetchAddress",{
        method:"GET",
        headers:{
            'Content-Type':'application/json',
        }
    })
    .then((res)=> res.json() )
    .then((res)=>{
        if(res.success){
            renderAddress(res.address)
        }else{
            alert("FAILD TO FETCH");
        }
    })
    .catch(()=>{
        alert("ERROR IN FETCH ");
    })
}

function renderAddress(address) {
    const table = document.getElementById("addressTable");
    const tbody = table.querySelector("tbody");

    // Clear existing table rows
    tbody.innerHTML = "";

    if (address && address.length > 0) {
        table.style.display = "table"; // Show the table

        // Populate the table with rows
        address.forEach((addr, index) => {
            const row = document.createElement("tr");

            // Create cells
            const cellIndex = document.createElement("td");
            cellIndex.textContent = index + 1;

            const cellAddress = document.createElement("td");
            cellAddress.innerHTML = `<strong>${addr.addressType}:</strong> ${addr.name}, ${addr.country}, ${addr.state}, ${addr.pincode}, ${addr.phone}`;

            const cellActions = document.createElement("td");
            cellActions.innerHTML = `
                <a href="/user/edit-address?id=${addr._id}" class="text-primary">
                    <i class="fas fa-edit"></i>
                </a>
                <a href="#" onclick="deleteAddress(event, '${addr._id}')" class="text-danger">
                    <i class="fas fa-trash-alt"></i>
                </a>
            `;

            // Append cells to the row
            row.appendChild(cellIndex);
            row.appendChild(cellAddress);
            row.appendChild(cellActions);

            // Append row to the tbody
            tbody.appendChild(row);
        });
    } else {
        table.style.display = "none"; // Hide the table if no addresses
    }

    // Clear all form inputs

}

   function deleteAddress(event,addressId){
    console.log("addressId:",addressId); 
    event.preventDefault();
    Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "Do you want to delete this product?",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        })
        .then((res) => {
            if(res.isConfirmed) {
                fetch("/user/delete-address",{
                    method:"POST",
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({id:addressId})
                }).then((res)=> res.json())
                .then((res)=>{
    if(res.success){
        Swal.fire({
            icon:"success",
            title:"Deleted",
            text:res.message,
            showCancelButton:false,
            showConfirmButton:false,
            timer:1500,
        }).then(()=>{
            fetchAddress()
        })
    }else{
        Swal.fire({
            icon:"error",
            title:"Faild To Delete",
            text:res.message,
            showCancelButton:false,
            showConfirmButton:false,
            timer:1500,
        });
    }
   })
   .catch(()=>{
    Swal.fire({
            icon:"error",
            title:"Error in deletion",
            text:res.message,
            showCancelButton:false,
            showConfirmButton:false,
            timer:1500,
        });
   });
            } else {
                // Optional: Add a feedback message
                Swal.fire("Cancelled", "Your product is safe!", "info");
            }
        
   });
   

    } 

    function addAddress(event){
        event.preventDefault();
        const typeOfAddress = document.getElementById("typeOfAddress").value;
        const name = document.getElementById("name").value;
        const country = document.getElementById("country").value;
        const state = document.getElementById("state").value;
        const pincode = document.getElementById("pincode").value;
        const phone = document.getElementById("phone").value;
        const userId = document.getElementById("userId").value;
        const err1 = document.getElementById("err1");
        const err2 = document.getElementById("err2");
        const err3 = document.getElementById("err3");
        const err4 = document.getElementById("err4");
        const err5 = document.getElementById("err5");
        const err6 = document.getElementById("err6");


        const typeOfAddressPattern = /^[A-Za-z\s]+$/;
        if(typeOfAddress.trim()===""){
            err1.style.display="block";
            err1.innerHTML="Please Enter The TypeOfAddress";
        }else if (!typeOfAddressPattern.test(typeOfAddress)){
            err1.style.display="block";
            err1.innerHTML="Only allowed alphebets";
        }else{
            err1.style.display="none";
            err1.innerHTML="";
        }

        const namePattern = /^[A-Za-z\s]+$/;
        if(name.trim()===""){
            err2.style.display="block";
            err2.innerHTML="Please Enter Your Name";
        }else if (!namePattern.test(name)){
            err2.style.display="block";
            err2.innerHTML="Only allowed alphebets";
        }else{
            err2.style.display="none";
            err2.innerHTML="";
        }


        const countryPattern = /^[A-Za-z\s]+$/;
        if(country.trim()===""){
            err3.style.display="block";
            err3.innerHTML="Please Enter Your Country";
        }else if (!countryPattern.test(country)){
            err3.style.display="block";
            err3.innerHTML="Only allowed alphebets";
        }else{
            err3.style.display="none";
            err3.innerHTML="";
        }

        const statePattern = /^[A-Za-z\s]+$/;
        if(state.trim()===""){
            err4.style.display="block";
            err4.innerHTML="Please Enter Your State";
        }else if (!statePattern.test(state)){
            err4.style.display="block";
            err4.innerHTML="Only allowed alphebets";
        }else{
            err4.style.display="none";
            err4.innerHTML="";
        }

        const pincodePattern = /^\d{6}$/;
        if(pincode.trim()===""){
            err5.style.display="block";
            err5.innerHTML="Please Enter Your Pincode";
        }else if (!pincodePattern.test(pincode)){
            err5.style.display="block";
            err5.innerHTML="Only allowed Numbers & Must Need Six Number";
        }else{
            err5.style.display="none";
            err5.innerHTML="";
        }

        const phnPattern = /^\d{10}$/;
        if(phone.trim()===""){
            err6.style.display="block";
            err6.innerHTML="Please Enter Your PhoneNumber";
        }else if (!phnPattern.test(phone)){
            err6.style.display="block";
            err6.innerHTML="Invalid Number";
        }else{
            err6.style.display="none";
            err6.innerHTML="";
        }

        if(err1.innerHTML || err2.innerHTML || err3.innerHTML || err4.innerHTML || err5.innerHTML || err6.innerHTML){
            return false;
        }
        

        
    fetch("/user/addAddress",{
    method:"POST",
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({typeOfAddress,name,country,state,pincode,phone,userId})
   })
   .then((response)=> response.json())
   .then((response)=>{
    if(response.success){
        Swal.fire({
            icon:"success",
            title:"Add NewAddress",
            text:response.message,
            showCancelButton:false,
            showConfirmButton:false,
            timer:1500,
        }).then(()=>{
        const formInputs = document.querySelectorAll(".address-form input, .address-form select");
        formInputs.forEach((input) => {
        if (input.type !== "submit") {
            input.value = ""; // Clear the value
        }
        });
    
            fetchAddress()
        })
    }else{
        Swal.fire({
            icon:"error",
            title:"Faild To AddAddress",
            text:response.message,
            showCancelButton:false,
            showConfirmButton:false,
            timer:1500,
        })
    }
   })
   .catch((err)=>{
    Swal.fire({
            icon:"error",
            title:"ERROR",
            text:response.message,
            showCancelButton:false,
            showConfirmButton:false,
            timer:1500,
        });
   });

    }

