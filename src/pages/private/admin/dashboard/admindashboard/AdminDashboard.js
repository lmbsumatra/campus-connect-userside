import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import "../adminDashboardStyles.css";

const AdminDashboard = () => {
  const growthData = [
    { month: 'SEP', users: 85 },
    { month: 'OCT', users: 82 },
    { month: 'NOV', users: 108 },
    { month: 'DEC', users: 75 },
    { month: 'JAN', users: 90 },
    { month: 'FEB', users: 95 }
  ];

  const listingData = [
    { day: '12', added: 30, approved: 45, rejected: 25 },
    { day: '13', added: 40, approved: 35, rejected: 25 },
    { day: '14', added: 35, approved: 40, rejected: 25 },
    { day: '15', added: 25, approved: 50, rejected: 25 },
    { day: '16', added: 20, approved: 30, rejected: 50 },
    { day: '17', added: 35, approved: 45, rejected: 20 },
    { day: '18', added: 30, approved: 40, rejected: 30 }
  ];

  const statusCards = [
    { title: 'Active Users', value: '100k', icon: require('../../../../../assets/images/icons/user2.png'), color: '#C31F3B' },
    { title: 'Active Listings', value: '100k', icon: require('../../../../../assets/images/icons/listing.png'), color: '#ED4700' },
    { title: 'Up Posts', value: '50k', icon: require('../../../../../assets/images/icons/posts.png'), color: '#D06400' },
    { title: 'Average Transactions', value: '20k', icon: require('../../../../../assets/images/icons/transact.png'), color: '#026800' },
    { title: 'Reports', value: '10k', icon: require('../../../../../assets/images/icons/report.png'), color: '#2E3192' },
  ];

  return (
    <div className="dashboard">
      <div className="status-section">
        {statusCards.map((card, index) => (
          <div key={index} className="status-card">
            <div className="status-content">
              <img src={card.icon} alt={card.title} className="status-icon" />
              <div>
                <h6>{card.title}</h6>
                <span 
                  className="status-value" 
                  style={{ color: card.color }} // Apply the color here
                >
                  {card.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activities-section">
        <h3 className="section-title">Recent Activities</h3>
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
            <tr>
              <td>
                <img 
                  src={require('../../../../../assets/images/icons/user-icon.png')}
                  alt="Activity Icon"
                  className="activity-icon"
                />
                New User
              </td>
              <td>JohnDoe (johndoe@example.com) signed up on 2024-07-20. Verification Status: Verified.</td>
              <td>May 22, 2024</td>
              <td>
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
            <tr>
              <td>
                <img 
                  src={require('../../../../../assets/images/icons/new-listing.png')}
                  alt="Activity Icon"
                  className="activity-icon"
                />
                New Listing
              </td>
              <td>JaneSmith listed "Calculus Textbook" under the Textbooks category on 2024-07-19..</td>
              <td>May 22, 2024</td>
              <td>
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
            <tr>
              <td>
                <img 
                  src={require('../../../../../assets/images/icons/new-transact.png')}
                  alt="Activity Icon"
                  className="activity-icon"
                />
                New Transaction
              </td>
              <td>Transaction ID: TX123456. JohnDoe borrowed "Physics Lab Kit" from JaneSmith. Transaction Date: 2024-07-18. Status: Completed..</td>
              <td>May 22, 2024</td>
              <td>
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
            <tr>
              <td>
                <img 
                  src={require('../../../../../assets/images/icons/new-post.png')}
                  alt="Activity Icon"
                  className="activity-icon"
                />
                New Post
              </td>
              <td>John Smith is looking for “Calculator”..</td>
              <td>May 22, 2024</td>
              <td>
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
            <tr>
              <td>
                <img 
                  src={require('../../../../../assets/images/icons/new-listing.png')}
                  alt="Activity Icon"
                  className="activity-icon"
                />
                New Listing
              </td>
              <td>Jane Lerman (janelerman@example.com) added a new listing on 2024-07-21.</td>
              <td>May 22, 2024</td>
              <td>
                <button className="view-btn">View</button>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h5>User Growth</h5>
            <div className="select-container">
              <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
              <select>
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
          <div className="growth-info">
            <span className="growth-count">100+</span>
            <span className="growth-rate">+2.45%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <XAxis dataKey="month" />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#ff4d4f" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h5>Listing Activity</h5>
            <div className="select-container">
              <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
              <select>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
          <div className="listing-activity">
            {listingData.map((item, index) => (
              <div key={index} className="activity-bar">
                <span>{item.day}</span>
                <div className="activity-bar-inner">
                  <div style={{ width: `${item.added}%` }} className="bar added"></div>
                  <div style={{ width: `${item.approved}%` }} className="bar approved"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h5>Transactions</h5>
            <div className="select-container">
              <i className="fas fa-calendar select-icon" aria-hidden="true"></i>
              <select>
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
            </div>
          </div>
          <div className="transaction-pie">
            <div className="pie-center">50%</div>
          </div>
          <div className="transaction-info">
            <span>On Going - 25%</span>
            <span>Cancelled - 25%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
