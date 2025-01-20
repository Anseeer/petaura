 // Add event listener to toggle password visibility
 document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const passwordIcon = document.getElementById("password-icon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";  // Show the password
      passwordIcon.classList.remove("fa-eye-slash");
      passwordIcon.classList.add("fa-eye");  // Change icon to 'eye' (password visible)
    } else {
      passwordInput.type = "password";  // Hide the password
      passwordIcon.classList.remove("fa-eye");
      passwordIcon.classList.add("fa-eye-slash");  // Change icon to 'eye-slash' (password hidden)
    }
  });

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const err1 = document.getElementById("err-1");
  const err2 = document.getElementById("err-2");
  const loginform = document.getElementById("loginform");

  function emailValidation(e){
      const emailVal = email.value;
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if(emailVal.trim()==""){
          err1.style.display="block";
          err1.innerHTML="Please enter Your Email";
      }else if(!emailPattern.test(emailVal)){
          err1.style.display="block";
          err1.innerHTML="Inavalid Email ";
      }else{
          err1.style.display="none";
          err1.innerHTML=""
      }
  }

  function passValidation(e){
      const passVal = password.value;
      const passPattern = /^.{6,}$/;

      if(passVal.trim()==""){
          err2.style.display="block";
          err2.innerHTML="Please enter Your Password";
      }else if(!passPattern.test(passVal)){
          err2.style.display="block";
          err2.innerHTML="Inavalid Password ";
      }else{
          err2.style.display="none";
          err2.innerHTML=""
      }
  }

  document.addEventListener("DOMContentLoaded",function(){
      loginform.addEventListener("submit",function(e){
          emailValidation();
          passValidation();

          if( err1.innerHTML || err2.innerHTML){
              e.preventDefault();
          }
      })
  })

