
function EditDetails(event){
    event.preventDefault();

const id = document.getElementById("id").value;
const name = document.getElementById("name").value;
const phone = document.getElementById("phone").value;

const err1 = document.getElementById("err1");
const err3 = document.getElementById("err3");


const isValid = true ;

const namePattern = /^[a-zA-Z\s]+$/;
        if(name.trim() ==""){
           err1.style.display="block";
           err1.innerHTML="Please Enter Your Name";
           isValid=false;
       }else if (!namePattern.test(name)){
           err1.style.display="block";
           err1.innerHTML="Invalid Name , Only Allowed Alphebets";
           isValid=false;
       }else{
           err1.style.display="none";
           err1.innerHTML="";
           
       }


const phonePattern = /^[0-9]{10}$/;
if(phone.trim() ==""){
           err3.style.display="block";
           err3.innerHTML="Please Enter Your Number";
           isValid=false;
       }else if (!phonePattern.test(phone)){
           err3.style.display="block";
           err3.innerHTML="Invalid Number ";
           isValid=false;
       }else{
           err3.style.display="none";
           err3.innerHTML="";
       }

       if(!isValid){
           return false;
       }

   fetch("/user/edit-user-details",{
       method:"POST",
       headers:{
           'Content-Type':'application/json',
       },
       body:JSON.stringify({id,name,phone})
   }).then((response)=> response.json())
   .then((response)=>{
       if(response.success){
           Swal.fire({
               icon:"success",
               title:"Edit UserDetails Successfull !",
               text:response.message,
               showCancelButton:false,
               showConfirmButton:false,
               timer:1500,
           }).then(()=>{
               window.location.href = "/user/profile";
           })
       }else{
           Swal.fire({
               icon:"error",
               title:"Edit UserDetails SuccessFull !",
               text:response.message,
               showCancelButton:false,
               showConfirmButton:false,
               timer:1500,
           });
       }
   })
   .catch((err)=>{
       Swal.fire({
           icon:"error",
           title:"ERROR In Edit UserDetails",
           text:response.message,
           showCancelButton:false,
           showConfirmButton:false,
           timer:1500,
       });
   });
   return false;
}

   

function ChangePassword(event){
   
   event.preventDefault();

   const currentPassword = document.getElementById("currentPassword").value;
   const newPassword = document.getElementById("newPassword").value;
   const confirmPassword = document.getElementById("confirmPassword").value;
   const id = document.getElementById("id").value;

   const err1 = document.getElementById("error1");
   const err2 = document.getElementById("error2");
   const err3 = document.getElementById("error3");


   const currentPassPattern = /^.{6,}$/;
   if(currentPassword.trim()===""){
       err1.style.display="block";
       err1.innerHTML="Please Enter Your CurrentPassword";
       isValid=false;
   }else if(!currentPassPattern.test(currentPassword)){
       err1.style.display="block";
       err1.innerHTML="Invalid Password ";
   }else{
       err1.style.display="none";
       err1.innerHTML="";
   }

   const newPassPattern = /^.{6,}$/;
   if(newPassword.trim()==""){
       err2.style.display="block";
       err2.innerHTML="Please enter Newpasword";
   }else if(!newPassPattern.test(newPassword) ){
       err2.style.display="block";
       err2.innerHTML="Please enter Valid Password";
   }else if(newPassword !== confirmPassword){
       err2.style.display="block";
       err2.innerHTML="Both should Be Match"
   }else{
      err2.style.display="none";
      err2.innerHTML="";
   }

   const confirmPassPattern = /^.{6,}$/;
   if(confirmPassword.trim()==""){
       err3.style.display="block";
       err3.innerHTML="Please enter confirmPassword";
   }else if(!confirmPassPattern.test(confirmPassword) ){
       err3.style.display="block";
       err3.innerHTML="Please enter Valid Password";
   }else if(newPassword !== confirmPassword){
       err3.style.display="block";
       err3.innerHTML="Both should Be Match"
   }else{
      err3.style.display="none";
      err3.innerHTML="";
   }

   
   if(err1.innerHTML || err2.innerHTML || err3.innerHTML ){
       return false;
   }

   fetch("/user/change-password",{
       method:"POST",
       headers:{
           'Content-Type':'application/json',
       },
       body:JSON.stringify({confirmPassword,currentPassword,newPassword,id})
   }).then((response)=> response.json())
     .then((response)=>{
       if(response.success){
           Swal.fire({
               icon:"success",
               title:"Password Change Successfully",
               text:response.message,
               showCancelButton:false,
               showConfirmButton:false,
               timer:1500,
           }).then(()=>{
               window.location.href = "/user/profile";
           })
       }else{
           Swal.fire({
               icon:"error",
               title:"Password Change Faild",
               text:response.message,
               showCancelButton:false,
               showConfirmButton:false,
               timer:1500
           })
       }
     })
     .catch((err)=>{
       Swal.fire({
           icon:"error",
           title:"Error in changePassword",
           showCancelButton:false,
           showConfirmButton:false,
           timer:1500,
       })
     });
}
