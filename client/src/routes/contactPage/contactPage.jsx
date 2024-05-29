import React from "react";
import "./ContactPage.scss"; // Import the SCSS file

function ContactPage() {
  return (
    <div className="contact-page-container">
     {/* <img src="/contact.png" alt="Contact" /> */}
      <div className="contact-page">
        <h1>Contact Us :-</h1>
        <p>You can contact us through the following methods:</p>
        <ul>
          <li>Email: <a href="mailto:22IT137@gmail.com">22IT137@gmail.com</a> or <a href="mailto:22IT087@gmail.com">22IT087@gmail.com</a></li>
          <li>Phone: 123-456-7890</li>
          {/* Add any other contact methods or information here */}
        </ul>
      </div>
    </div>
  );
}

export default ContactPage;
