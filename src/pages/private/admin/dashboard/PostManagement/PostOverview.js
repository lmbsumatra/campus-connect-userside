import React from 'react';
import TableComponent from '../../../../../components/Table/TableComponent';
import "./postDashboard.css";

const PostOverview = () => {
  const headers = ['Thumbnail', 'Title', 'Category', 'Owner', 'Date Added', 'Status', 'Action'];
  const data = [
    [<div className="thumbnail-placeholder"></div>, 'Wrench', 'TUPM-12345', 'John Doe', 'May 22, 2024', 'Declined', ''],
    [<div className="thumbnail-placeholder"></div>, 'Wrench', 'TUPM-12345', 'John Doe', 'May 22, 2024', 'Declined', ''],
    [<div className="thumbnail-placeholder"></div>, 'Wrench', 'TUPM-12345', 'John Doe', 'May 22, 2024', 'Declined', '']
  ];
    
  return (
    <div className="container my-4">
      <div className="row">
        {/* Left Side: Recent Posts */}
        <div className="col-lg-15">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Posts</h4>
            <TableComponent headers={headers} data={data} statusColumnIndex={5} />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PostOverview;
