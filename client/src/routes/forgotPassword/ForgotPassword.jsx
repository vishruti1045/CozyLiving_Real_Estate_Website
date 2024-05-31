import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.scss';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8800/forgot-password', { email });
      if (response.data.Status === 'Success') {
        alert('OTP has been sent to your email!');
        setOtp(response.data.Otp);
      } else {
        alert('Error sending OTP.');
      }
    } catch (error) {
      console.log(error);
      alert('Error sending OTP.');
    }
  };

  const handleResetPassword = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:8800/reset-password', { email, otp, newPassword });
    if (response.data.Status === 'Success') {
      alert('Password has been reset successfully!');
      navigate('/login');
    } else {
      alert('Error resetting password.');
    }
  } catch (error) {
    console.log(error);
    alert('Error resetting password.');
  }
};

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h1>Forgot Password</h1>
        <form onSubmit={handleSendOTP}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success rounded-0">
            Send OTP
          </button>
        </form>
        {otp !== '' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="otp">
                <strong>OTP</strong>
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                autoComplete="off"
                name="otp"
                className="form-control rounded-0"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword">
                <strong>New Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter New Password"
                autoComplete="off"
                name="newPassword"
                className="form-control rounded-0"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success rounded-0">
              Reset Password
            </button>
          </form>
        )}
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default ForgotPassword;