import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'
import 'swiper/swiper-bundle.css';
import "../adminDashboardStyles.css";

import useFetchAllUsersData from "../../../../../utils/FetchAllUsersData";
import useFetchAllListingsData from "../../../../../utils/FetchAllListingsData";
import useFetchAllPostsData from "../../../../../utils/FetchAllPostsData";
import useFetchAllReportsData from "../../../../../utils/FetchAllReportsData";
import useFetchAllTransactionsData from "../../../../../utils/FetchAllTransactionsData";
import useFetchAllItemsForSaleData from '../../../../../utils/FetchAllItemsForSaleData';

import useFetchRecentActivities from '../../../../../utils/FetchRecentActivities';
import { UserAnalytics } from '../../../../../components/Analytics/UserAnalyticsComponents';
import { ListingsGrowth, ListingStatusDistribution } from '../../../../../components/Analytics/ListingAnalyticsComponent';
import { TransactionStatusDistribution, TransactionsGrowth } from '../../../../../components/Analytics/TransactionAnalyticsComponent';

const AdminDashboard = () => {

  const { activities } = useFetchRecentActivities();
    // Fetching data using the custom hooks
    const { users } = useFetchAllUsersData();
    const { listings } = useFetchAllListingsData();
    const { posts } = useFetchAllPostsData();
    const { reports } = useFetchAllReportsData();
    const { transactions } = useFetchAllTransactionsData();
    const sale = useFetchAllItemsForSaleData();
  
    // State to store fetched values for status cards
    const [statusData, setStatusData] = useState({
      activeUsers: 0,
      activeListings: 0,
      upPosts: 0,
      averageTransactions: 0,
      reports: 0,
      sales: 0,
    });


  useEffect(() => {
    setStatusData(prevState => ({
      ...prevState,
      activeUsers: users?.length || prevState.activeUsers,
      activeListings: listings?.length || prevState.activeListings,
      upPosts: posts?.length || prevState.upPosts,
      averageTransactions: transactions?.length || prevState.averageTransactions,
      reports: reports?.length || prevState.reports,
      sales: sale?.items?.length || prevState.sales,
    }));
  }, [users?.length, listings?.length, posts?.length, transactions?.length, reports?.length, sale?.items?.length]);

  const statusCards = [
    { title: 'Active Users', value: `${statusData.activeUsers}`, icon: require('../../../../../assets/images/icons/user2.png'), color: '#C31F3B' },
    { title: 'Active Listings', value: `${statusData.activeListings}`, icon: require('../../../../../assets/images/icons/listing.png'), color: '#ED4700' },
    { title: 'Up Posts', value: `${statusData.upPosts}`, icon: require('../../../../../assets/images/icons/posts.png'), color: '#D06400' },
    { title: 'Average Transactions', value: `${statusData.averageTransactions}`, icon: require('../../../../../assets/images/icons/transact.png'), color: '#026800' },
    { title: 'Reports', value: `${statusData.reports}`, icon: require('../../../../../assets/images/icons/report.png'), color: '#2E3192' },
    { title: 'Sales', value: `${statusData.sales}`, icon: require('../../../../../assets/images/icons/report.png'), color: '#2E3192' },
];

return (
  <div className="dashboard">
    <div className="status-section">
      <Swiper spaceBetween={10}
              slidesPerView={1}
              pagination={{ clickable: true }}
              breakpoints={{
                  480: { slidesPerView: 1 },  // For mobile screens
                  768: { slidesPerView: 3 },  // For tablets
                  1024: { slidesPerView: 5 }, // For desktop
}}>
        {statusCards.map((card, index) => (
          <SwiperSlide key={index}>
            <div className="status-card">
              <div className="status-content">
                <img src={card.icon} alt={card.title} className="status-icon" />
                <div>
                  <h6>{card.title}</h6>
                  <span className="status-value" style={{ color: card.color }}>
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>

    <div className="recent-activities-section">
      <h3 className="section-title">Recent Activities</h3>
      <div className="activities-table-container">
        <table className="activities-table">
          <thead>
            <tr>
              <th>ACTIVITY</th>
              <th>DESCRIPTION</th>
              <th>DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={index}>
                <td>
                  <img 
                    src={
                      activity.type === 'New User' ? require('../../../../../assets/images/icons/user-icon.png') :
                      activity.type === 'New Listing' ? require('../../../../../assets/images/icons/new-listing.png') :
                      activity.type === 'New Transaction' ? require('../../../../../assets/images/icons/new-transact.png') :
                      activity.type === 'New Post' ? require('../../../../../assets/images/icons/new-post.png') :
                      null
                    }
                    alt="" className="activity-icon"
                  />
                  {activity.type}
                </td>
                <td>{activity.description}</td>
                <td>{new Date(activity.date).toLocaleDateString()}</td>
                <td>
                  <button className="view-btn">View</button>
                  <button className="edit-btn">Edit</button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="charts-section">
      <div className="chart-card">
        <UserAnalytics users={users} />
      </div>

      <div className="chart-card">
        <ListingsGrowth listings={listings} />
      </div>

      <div className="chart-card">
        <TransactionsGrowth transactions={transactions} />
      </div>

      <div className="chart-card">
        <ListingStatusDistribution listings={listings} />
      </div>

      <div className="chart-card">
        <TransactionStatusDistribution transactions={transactions} />
      </div>
    </div>
  </div>
);
};

export default AdminDashboard;
