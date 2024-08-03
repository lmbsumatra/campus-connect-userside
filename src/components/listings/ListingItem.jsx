import React from 'react';
import './style.css';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import itemImage from "../../assets/images/item/item_1.jpg"; // Adjust the path if needed
import profilePlaceholder from "../../assets/images/icons/user-icon.svg"; // Add a path for the placeholder profile image

export const items = [
  { id: 1, name: 'Item', price: 500, rating: 3, imageUrl: itemImage, user: 'Ebe Dencel', profilePic: profilePlaceholder },
  { id: 2, name: 'Item', price: 500, rating: 4, imageUrl: itemImage, user: 'Ebe Dencel', profilePic: profilePlaceholder },
  { id: 3, name: 'Item', price: 500, rating: 5, imageUrl: itemImage, user: 'Ebe Dencel', profilePic: profilePlaceholder },
  { id: 4, name: 'Item', price: 500, rating: 3, imageUrl: itemImage, user: 'Ebe Dencel', profilePic: profilePlaceholder },
  { id: 5, name: 'Item', price: 500, rating: 1, imageUrl: itemImage, user: 'Ebe Dencel', profilePic: profilePlaceholder },
  // Add more items as needed
];

function ListingItem() {
  return (
    <div className='container'>
      <h2 className='mb-5'>Item Listings</h2>
      <div className='row'>
      {items.map(item => (
          <div key={item.id} className="col-md-4 col-sm-6 mb-4">
             <Card style={{ width: '18rem' }}>
              <Card.Img variant="top" src={item.imageUrl} alt="Item image" />
              <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="mb-0">{item.name}</Card.Title>
                  <span className="price">₱{item.price}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img src={item.profilePic} alt="Profile" className="profile-pic mr-2" />
                  <div>
                    <a href={`/userprofile/${item.user}`} className="text-dark small text-decoration-none">{item.user}</a>
                    <div className="rating">
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </div>
                  </div>
                </div>
                <Link to={`/item/${item.id}`} className="btn btn-primary no-fill ml-auto">View</Link>
              </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListingItem;
