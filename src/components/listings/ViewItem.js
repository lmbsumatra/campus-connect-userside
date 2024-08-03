import React from 'react';
import './style.css';
import { useParams } from 'react-router-dom';
import { items } from './ListingItem'; // Import the items array
import NavBar from '../navbar/navbar/NavBar';
import Footer from '../footer/Footer';

function ViewItem() {
  const { id } = useParams();
  const item = items.find(item => item.id === parseInt(id, 10));

  if (!item) {
    return <p>Item not found</p>;
  }

  return (
    <div>
      <NavBar />
      <div className='view-container'>
        <h2 className='mb-5 center'>Item Listings</h2>

        <div className='item-profile row'>
          <div className='col-md-6 item-image'>
            <img src={item.imageUrl} alt="" className="img-container img-fluid"></img>
          </div>
          <div className='col-md-6 item-desc'>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0 "><strong>{item.name}</strong></p>
              <span className="price">₱{item.price}/hr</span>
            </div>
            <p><strong>Rating:</strong>  
                <span className="stars">
                  {'★'.repeat(Math.floor(item.rating))} 
                  {item.rating % 1 !== 0 ? '½' : ''} 
                  {'☆'.repeat(5 - Math.ceil(item.rating))} 
                </span> 
                ({item.rating.toFixed(1)}/5)
            </p>
            <p ><strong>Rental Duration:</strong>
              <button className="btn btn-primary no-fill me-2 rounded-0 ms-2">9:00 am - 12:00 nn</button>
              <button className="btn btn-primary no-fill me-2 rounded-0">9:00 am - 12:00 nn</button> 
            </p>
            <p><strong>Rental Rate:</strong> ₱{item.price}/hr</p>
            <p><strong>Late Charges:</strong> ₱100/hr</p>
            <p><strong>Security Deposit:</strong> ₱500</p>
            <p><strong>Repair and Replacement:</strong> Available</p>
            <p><strong>Delivery:</strong> 
            <button className="btn btn-primary no-fill me-2 rounded-0 ms-2">Meetup</button>
            <button className="btn btn-primary no-fill me-2 rounded-0">Pickup</button>
            </p>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
              <label className="form-check-label" htmlFor="flexCheckDefault">
                I agree on rental terms set by the owner
              </label>
            </div>
            <div className="mt-5 d-flex justify-content-end">
              <button className="btn btn-primary no-fill me-2">Message</button>
              <button className="btn btn-primary no-fill me-2">Borrow</button>
            </div>
          </div>
        </div>

        <div className='user-info mt-5'>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img src={item.profilePic} alt="Profile" className="profile-pic me-2" />
              <div>
                <a href={`/userprofile/${item.user}`} className="text-dark small text-decoration-none">{item.user}</a>
              </div>
            </div>
            <div className="rating">
              <span>Rating:</span>{'★'.repeat(0)}{'☆'.repeat(5)}
            </div>
            <button className="btn btn-primary no-fill me-2 rounded-0">View Listings</button>
            <button className="btn btn-primary no-fill me-2 rounded-0">View Profile</button>
          </div>
        </div>

        <div className='item-specs mt-5'>
          <h4>Item Specifications</h4>
          <ul>
            <li>Brand: Stanley</li>
            <li>Model: 87 - 474</li>
            <li>Type: Adjustable Wrench</li>
            <li>Materials: Chrome Vanadium Steel</li>
            <li>Size: 12 Inches</li>
            <li>Jaw Capacity: 1-1/2 inches</li>
            <li>Finish: Polished Chrome</li>
            <li>Handle: Anti-slip grip</li>
          </ul>
          <hr />
          <h4>Item Description</h4>
          <p>The Stanley 87-474 Adjustable Wrench is a versatile tool designed for both professional and DIY use. Made from high-quality Chrome Vanadium Steel, this 12-inch wrench offers exceptional durability and strength. Its adjustable jaw, with a maximum capacity of 1-1/2 inches, allows for a precise fit on a wide range of fasteners. The polished chrome finish not only enhances its appearance but also provides corrosion resistance for long-lasting performance. The anti-slip grip handle ensures comfort and control during use, making it ideal for various applications, from automotive repairs to household maintenance.</p>
          <hr />
          <h4>Item Rating</h4>
          <p>Overall Rating: 
            <span className="stars">
                  {'★'.repeat(Math.floor(item.rating))} 
                  {item.rating % 1 !== 0 ? '½' : ''} 
                  {'☆'.repeat(5 - Math.ceil(item.rating))} 
            </span> 
                ({item.rating.toFixed(1)}/5)
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ViewItem;
