const emailTamplates ={
    signupOTP: (name, otp) => ({
    subject: "Complete Your Signup - Verify with OTP",
    body: `
      Hi ${name},
      
      Welcome to Freight Calculator! 🎉
      
      Your One-Time Password (OTP) for completing your signup is: ${otp}
      
      Please enter this OTP to verify your account. 
      Note: This code will expire in 10 minutes.
      
      Thank you for joining us!  
      Team Freight Calculator
    `
  }),

   forgotPasswordOTP: (name, otp) => ({
    subject: "Reset Your Password - OTP Verification",
    body: `
      Hi ${name},
      
      We received a request to reset your password.
      
      Your One-Time Password (OTP) for password reset is: ${otp}

      Please use this code to reset your password. 
      Note: This OTP will expire in 10 minutes. 

      If you didn't request this, please ignore this email.

      Thank you,  
      Team Freight Calculator
    `
  }),
}
export {emailTamplates};