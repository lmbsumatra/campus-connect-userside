import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ItemDetails() {
  const [image, setImage] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image file');
    }
  };

  return (
    <div className="container py-4">
      <h3>Item Details</h3>
      <div className="row bg-light p-3 rounded">
        <div className="col-md-8">
          <div className="mb-3">
            <label className="form-label">Item Name</label>
            <input type="text" className="form-control" placeholder="Example Input" />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" placeholder="Example Input"></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Specification</label>
            <div className="d-flex align-items-center gap-2">
              <div className="col-2">
                <input type="text" className="form-control" placeholder="Title" />
              </div>
              <div className="col-3">
                <input type="text" className="form-control" placeholder="Description" />
              </div>
              <button className="btn btn-primary ms-2">+</button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Item Image</label>
          <input
            className="form-control mb-3"
            type="file"
            id="formFile"
            accept="image/*"
            onChange={handleFileChange}
          />
          {image && (
            <div className="d-flex flex-column align-items-center">
              <img
                src={image}
                alt="Preview"
                className="img-fluid rounded mb-2"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
              <p className="text-muted">Preview Image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
