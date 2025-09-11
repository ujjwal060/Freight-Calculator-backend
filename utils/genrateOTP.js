const generateOTP = () => {
  const otp = Math.floor(10000 + Math.random() * 90000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  return { otp, expiry };
};

export { generateOTP };