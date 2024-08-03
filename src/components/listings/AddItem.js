import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ItemDetails from './ItemDetails';
import RentalDetails from './RentalDetails';
import NavBar from '../navbar/navbar/NavBar';
import Footer from '../footer/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddItem() {
  const [currentStep, setCurrentStep] = useState('itemDetails');

  return (
    <div>
      <NavBar />
      <div className="container my-4">
        <div className="row">
          <div className="col-md-3">
            <div className="list-group mb-3">
              <h5 className="mb-3">Item Details</h5>
              <Link
                to="#"
                className={`list-group-item list-group-item-action ${currentStep === 'itemDetails' ? 'active' : ''}`}
                onClick={() => setCurrentStep('itemDetails')}
              >
                Item Details
              </Link>
              <Link
                to="#"
                className={`list-group-item list-group-item-action ${currentStep === 'rentalDetails' ? 'active' : ''}`}
                onClick={() => setCurrentStep('rentalDetails')}
              >
                Rental Details
              </Link>
            </div>
          </div>
          <div className="col-md-9">
            <div className="p-3 bg-white border rounded">
              {currentStep === 'itemDetails' && <ItemDetails />}
              {currentStep === 'rentalDetails' && <RentalDetails />}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AddItem;
