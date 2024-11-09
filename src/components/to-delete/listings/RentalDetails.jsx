import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function RentalDetails() {
  return (
    <div className="container mt-5">
        <h3>Rental Details</h3>
      <div className="mb-3">
        <label className="form-label ">Rental Duration</label>
        <div className="d-flex align-items-center gap-2">
          <div className="col-2">
            <input type="time" className="form-control" placeholder="From" />
          </div>
          <span>to</span>
          <div className="col-2">
            <input type="time" className="form-control" placeholder="To" />
          </div>
          <button className="btn btn-primary">+</button>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label ">Rental Dates</label>
        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center gap-2">
            <input type="checkbox" className="form-check-input border border-dark me-2" />
            <div className="col-2">
              <input type="text" className="form-control flex-fill" placeholder="Custom Dates" />
            </div>
            <button className="btn btn-primary">+</button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <input type="checkbox" className="form-check-input border border-dark me-2" />
            <div className="col-2">
              <input type="text" className="form-control flex-fill" placeholder="Weekly" />
            </div>
            <button className="btn btn-primary">+</button>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label ">Rental Rate</label>
        <div className="col-6">
          <input type="number" className="form-control" placeholder="Example Input" />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label ">Late Charges</label>
        <div className="d-flex align-items-center gap-2">
          <input type="checkbox" className="form-check-input border border-dark me-2" />
          <div className="col-5">
            <input type="number" className="form-control" placeholder="Example Input" />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label ">Security Deposit</label>
        <div className="d-flex align-items-center gap-2">
          <input type="checkbox" className="form-check-input border border-dark me-2" />
          <div className="col-5">
            <input type="number" className="form-control" placeholder="Example Input" />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label ">Delivery Options</label>
        <div className="d-flex flex-column gap-2">
          <div className="form-check">
            <input type="checkbox" className="form-check-input border border-dark" id="pickup" />
            <label className="form-check-label fw-light" htmlFor="pickup">Pickup</label>
          </div>
          <div className="form-check">
            <input type="checkbox" className="form-check-input border border-dark" id="meetup" />
            <label className="form-check-label fw-light" htmlFor="meetup">Meetup</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RentalDetails;
