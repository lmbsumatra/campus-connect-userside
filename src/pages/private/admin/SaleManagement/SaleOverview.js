import React, { useState } from "react";
import TableComponent from "../../../../components/Table/TableComponent";
import "./forSaleManagement.css";
import useFetchAllPostsData from "../../../../utils/FetchAllPostsData";
import { formatDate } from "../../../../utils/dateFormat";
import SortFilterComponent from "../../../../components/SortAndFilter/SortFilterComponent";
import useFetchAllItemsForSaleData from "../../../../utils/FetchAllItemsForSaleData";
import { useNavigate } from "react-router-dom";
import { ItemStatus } from "../../../../utils/Status";

const SaleOverview = () => {
  const [sortOption, setSortOption] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const headers = [
    "Thumbnail",
    "Title",
    "Category",
    "Renter",
    "Date Added",
    "Status",
    "Action",
  ];

  const { items, error, loading } = useFetchAllItemsForSaleData();
  const navigate = useNavigate();

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleView = (itemId) => {
    navigate(`/admin/sales/item-approval/${itemId}`)
  };

  const handleEdit = (itemId) => {
    console.log(`Editing item with ID: ${itemId}`);
  };

  const handleDelete = (itemId) => {
    console.log(`Deleting item with ID: ${itemId}`);
  };


  // Prepare data for TableComponent
  const data = items.map((item) => {
    const { label, className } = ItemStatus(item.status);
    return [
      <div className="thumbnail-placeholder"></div>,
      item.post_item_name,
      item.category,
      <>
        {item.seller.first_name} {item.seller.last_name}
      </>,
      formatDate(item.created_at),
      <span className={`badge ${className}`}>{label}</span>,
      <div className="d-flex flex-column align-items-center gap-1">
        <button
          className="btn btn-action view"
          onClick={() => handleView(item.id)}
        >
          View
        </button>
        <button
          className="btn btn-action edit"
          onClick={() => handleEdit(item.id)}
        >
          Edit
        </button>
        <button
          className="btn btn-action delete"
          onClick={() => handleDelete(item.id)}
        >
          Delete
        </button>
      </div>,
    ];
  });

  // Function to filter and sort the posts
  const getFilteredAndSortedData = () => {
    let filteredData = items;

    if (statusFilter) {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }

    if (categoryFilter) {
      filteredData = filteredData.filter(item => item.category === categoryFilter);
    }

    if (sortOption) {
      filteredData = [...filteredData].sort((a, b) => {
        switch (sortOption) {
          case 'title':
            return a.post_item_name.localeCompare(b.post_item_name);
          case 'renter':
            return `${a.renter.first_name} ${a.renter.last_name}`.localeCompare(
              `${b.renter.first_name} ${b.renter.last_name}`
            );
          case 'date':
            return new Date(a.created_at) - new Date(b.created_at);
          default:
            return 0;
        }
      });
    }

    return filteredData;
  };


  return (
    <div className="admin-content-container">
      <div className="row">
        {/* Left Side: Recent Posts */}
        <div className="col-lg-12">
          <div className="recent-posts-header p-3 mb-3">
            <h4>Recent Sale</h4>

            {/* Sorting and Filtering Component */}
            <SortFilterComponent
              sortOption={sortOption}
              onSortChange={setSortOption}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />
            <TableComponent
              headers={headers}
              data={data}
              // statusColumnIndex={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleOverview;
