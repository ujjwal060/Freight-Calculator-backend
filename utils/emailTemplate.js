const emailTamplates = {
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

  resendOTP: (name, otp, type) => {
    if (type === "signup") {
      return {
        subject: "Verify Your Account - OTP Verification",
        body: `
        Hi ${name},
        
        You requested to resend your OTP for completing registration.
        
        Your One-Time Password (OTP) for account verification is: ${otp}
        
        Please use this code to verify your account.  
        Note: This OTP will expire in 10 minutes. 
        
        If you didn't request this, please ignore this email.
        
        Thank you,  
        Team Freight Calculator
      `
      };
    }

    if (type === "forgotPassword") {
      return {
        subject: "Reset Your Password - OTP Verification",
        body: `
        Hi ${name},
        
        You requested to resend your OTP for password reset.
        
        Your One-Time Password (OTP) for password reset is: ${otp}
        
        Please use this code to reset your password.  
        Note: This OTP will expire in 10 minutes. 
        
        If you didn't request this, please ignore this email.
        
        Thank you,  
        Team Freight Calculator
      `
      };
    }
  },

  forgotPasswordAdminOTP: (otp) => ({
    subject: "Admin Password Reset - OTP Verification",
    body: `
      Hello Admin,
      
      A request has been received to reset the admin account password.

      Your One-Time Password (OTP) is: ${otp}

      Please use this OTP to reset your password. 
      Note: This OTP will expire in 10 minutes.

      If you did not request this change, please contact support immediately.

      Thank you,  
      Team Freight Calculator
    `
  }),

  resendAdminOTP: (otp) => {
    return {
      subject: "Admin Password Reset - OTP Verification",
      body: `
      Hello Admin,

      You requested to resend the OTP for resetting the admin account password.

      Your One-Time Password (OTP) is: ${otp}

      Please use this OTP to reset your password.
      Note: This OTP will expire in 10 minutes.

      If you did not request this, please contact support immediately.

      Thank you,  
      Team Freight Calculator
    `
    };
  },

  bookingMail: (name, bookingId, containerType, totalAmount, bookingDate) => ({
    subject: "Booking Confirmation - Freight Calculator",
    body: `
      Hi ${name},
      
      Thank you for booking your container with Freight Calculator!

      Your booking has been successfully received and is now under review.

      📋 Booking Details:
      • Booking ID: ${bookingId}
      • Container Type: ${containerType}
      • Estimated Freight Charges: $${totalAmount}
      • Booking Date: ${bookingDate}

      Our operations team will confirm your booking shortly.

      You will receive a confirmation email once your shipment is scheduled.

      Best regards,  
      Team Freight Calculator
    `
  }),

  bookingConfirmMail: (name, bookingId, estimatedDeparture) => ({
    subject: "Container Booking Confirmed - Freight Calculator",
    body: `
      Hi ${name},
      
      Great news! Your container booking has been confirmed.

      📦 Booking ID: ${bookingId}
      🗓️ Estimated Departure: ${estimatedDeparture}

      Your shipment is now scheduled for dispatch. You will be notified once it’s in transit.

      Thank you for choosing Freight Calculator for your logistics needs.  
      Team Freight Calculator
    `
  }),

  bookingDeliveredMail: (name, bookingId, deliveryDate, destinationPort) => ({
    subject: "Shipment Delivered Successfully - Freight Calculator",
    body: `
      Hi ${name},

      We're pleased to inform you that your shipment has been successfully delivered.

      📦 Booking ID: ${bookingId}
      📍 Destination Port: ${destinationPort}
      📅 Delivery Date: ${deliveryDate}

      Thank you for trusting Freight Calculator for your shipping needs.
      We look forward to serving you again!

      Warm regards,  
      Team Freight Calculator
    `
  }),

  bookingCancelledMail: (name, bookingId, reason) => ({
    subject: "Container Booking Cancelled - Freight Calculator",
    body: `
      Hi ${name},
      
      We regret to inform you that your container booking has been cancelled.

      ❌ Booking ID: ${bookingId}
      📝 Reason: ${reason || "Not specified"}

      If you wish to rebook or have questions about this cancellation, please contact our support team.

      We apologize for the inconvenience and appreciate your understanding.

      Sincerely,  
      Team Freight Calculator
    `
  })

}
export { emailTamplates };