import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate,useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


function SinglePage() {
  const MySwal = withReactContent(Swal);
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

//const email=post.user.email;

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSaved((prev) => !prev);
    try {
      console.log("Payload:", { postId: post.id });  // Log the payload
      await apiRequest.post("/users/save", { postId: post.id });
      MySwal.fire({
        title: saved ? "Place Unsaved" : "Place Saved",
        icon: "success",
      });
    } catch (err) {
     // console.log("Error:", err.response.data);  // Log the error response
      setSaved((prev) => !prev);
     
    }
  };
  
  const handlegive = async () => {
    MySwal.fire({
      title: <p>Owner's Details :-</p>,
      html: `<p>Username:  ${post.user.username}</p><p>Email:  ${post.user.username}@gmail.com</p><p>Phone number:  1234567890</p>`,
      icon: 'info'
    });

   };
const handledone = async () => {

   
    MySwal.fire({
      title: 'Congratulations!!',
      html: `<p>${post.property} is ready to be sold.</p><p>Complete the further payment process.</p>`,
      icon: 'success',
    });

  // window.location.href = '/payment';

};
const handlepay = async () => {
  const propertyType = post.type.toLowerCase(); // Convert to lowercase to ensure case-insensitivity
  let htmlContent;

  if (propertyType === "buy") {
    htmlContent = '<p>Your total is:- $' + post.price + '</p>';
  } else {
    htmlContent = '<p>Your total per month is:- $' + post.price + '</p>';
  }

  MySwal.fire({
    title: 'Payment Successful !!',
    html: htmlContent,
    icon: 'success',
  });
};

const handlemsg = async () => {
  MySwal.fire({
    title: "Send a Message",
    input: "textarea",
    inputPlaceholder: "Type your message here...",
    showCancelButton: true,
    confirmButtonText: "Send",
    preConfirm: (text) => {
      if (!text) {
        Swal.showValidationMessage("Message cannot be empty");
      }
      return text;
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await apiRequest.post(
          "/messages/" + post.user.id, // Assuming post.id is the chatId
          {
            text: result.value,
            receiverId: post.user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`, // Ensure token is available in currentUser
            },
          }
        );
        
        MySwal.fire({
          title: "Message Sent",
          text: "Your message has been sent to the owner.",
          icon: "success",
        });
      } catch (err) {
        console.error("Error sending message:", err.response || err);
        MySwal.fire({
          title: "Error",
          text: "There was an error sending your message.",
          icon: "error",
        });
      }
    }
  });
};


  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
             
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
                <button onClick={handlegive} className="sell">Contact</button>
                <button onClick={handledone} className="done">{post.type}</button>
                <button onClick={handlepay} className="done">Payment</button>

              </div>
              <div className="user">
                <img src={post.user.avatar || "noavatar.png"} alt="" />
                <span>{post.user.username}</span>
              
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <p className="title">General</p>
          <div className="listVertical">
            <div className="feature">
              <img src="/utility.png" alt="" />
              <div className="featureText">
                <span>Utilities</span>
                {post.postDetail.utilities === "owner" ? (
                  <p>Owner is responsible</p>
                ) : (
                  <p>Tenant is responsible</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Pet Policy</span>
                {post.postDetail.pet === "allowed" ? (
                  <p>Pets Allowed</p>
                ) : (
                  <p>Pets not Allowed</p>
                )}
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Income Policy</span>
                <p>{post.postDetail.income}</p>
              </div>
            </div>
          </div>
          <p className="title">Sizes</p>
          <div className="sizes">
            <div className="size">
              <img src="/size.png" alt="" />
              <span>{post.postDetail.size} sqft</span>
            </div>
            <div className="size">
              <img src="/bed.png" alt="" />
              <span>{post.bedroom} beds</span>
            </div>
            <div className="size">
              <img src="/bath.png" alt="" />
              <span>{post.bathroom} bathroom</span>
            </div>
          </div>
          <p className="title">Nearby Places</p>
          <div className="listHorizontal">
            <div className="feature">
              <img src="/school.png" alt="" />
              <div className="featureText">
                <span>School</span>
                <p>
                  {post.postDetail.school > 999
                    ? post.postDetail.school / 1000 + "km"
                    : post.postDetail.school + "m"}{" "}
                  away
                </p>
              </div>
            </div>
            <div className="feature">
              <img src="/pet.png" alt="" />
              <div className="featureText">
                <span>Bus Stop</span>
                <p>{post.postDetail.bus}m away</p>
              </div>
            </div>
            <div className="feature">
              <img src="/fee.png" alt="" />
              <div className="featureText">
                <span>Restaurant</span>
                <p>{post.postDetail.restaurant}m away</p>
              </div>
            </div>
          </div>
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            <button onClick={handlemsg}>
              <img src="/chat.png" alt="" />
              Send a Message
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: saved ? "#fece51" : "white",
              }}
            >
              <img src="/save.png" alt="" />
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePage;
