import React from 'react';
import TableComponent from '../../../../../components/Table/TableComponent';
import "./postDashboard.css"

const PostDashboard = () => {
  const headers = ['Thumbnail', 'Title', 'Category', 'Owner', 'Date Added', 'Status', 'Action'];
  const data = [
    [<div className="thumbnail-placeholder"></div>, 'Wrench', 'TUPM-12345', 'John Doe', 'May 22, 2024', 'Declined', ''],
    [<div className="thumbnail-placeholder"></div>, 'Wrench', 'TUPM-12345', 'John Doe', 'May 22, 2024', 'Suspended', ''],
    [<div className="thumbnail-placeholder"></div>, 'Wrench', 'TUPM-12345', 'John Doe', 'May 22, 2024', 'Approved', '']
  ];

  return (
    <div className="container my-4">
      <div className="row">
        {/* Left Side: Recent Posts */}
        <div className="col-lg-8">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Posts</h4>
            <TableComponent headers={headers} data={data} statusColumnIndex={5} />
          </div>
        </div>
        
        {/* Right Side: Three Widgets */}
        <div className="col-lg-4">
          {/* New Posts Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>New Posts</h5>
            <div className="new-posts d-flex">
              <div className="profile-pic-placeholder me-2"></div>
              <div className="profile-pic-placeholder me-2"></div>
              <div className="profile-pic-placeholder me-2"></div>
              <button className="btn btn-light btn-sm">+</button>
            </div>
          </div>

          {/* Listing Growth Widget */}
          <div className="mb-3 p-3 bg-white rounded shadow-sm">
            <h5>Listing Growth</h5>
            <div className="d-flex align-items-center">
              <h2>100+</h2>
              <span className="ms-2 text-success">+2.45%</span>
            </div>
            <small className="text-muted">Monthly Growth</small>
          </div>

          {/* Top Posts Widget */}
          <div className="p-3 bg-white rounded shadow-sm">
            <h5>Top Posts</h5>
            <div className="top-posts">
              <div className="d-flex align-items-center mb-2">
                <div className="profile-pic-placeholder me-2"></div>
                <span>Jane Smith</span>
                <span className="ms-auto text-warning">4.9 ★</span>
              </div>
              <div className="d-flex align-items-center mb-2">
                <div className="profile-pic-placeholder me-2"></div>
                <span>Jane Smith</span>
                <span className="ms-auto text-warning">4.9 ★</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="profile-pic-placeholder me-2"></div>
                <span>Jane Smith</span>
                <span className="ms-auto text-warning">4.9 ★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDashboard;
