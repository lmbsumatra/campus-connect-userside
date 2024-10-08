import React, { useEffect, useState } from 'react';
import NavBar from '../../components/navbar/navbar/NavBar';
import BorrowingPost from '../../components/borrowingposts/BorrowingPost';
import FAB from '../../components/fab/FAB';
import Footer from '../../components/footer/Footer';

function Posts() {
  const [borrowingPosts, setBorrowingPosts] = useState([]);

  useEffect(() => {
    fetch('/Posts.json')
      .then((response) => response.json())
      .then((data) => setBorrowingPosts(data.borrowingPosts));
  }, []);

  const handleFabClick = (action) => {
    if (action === 'add-item') {
      console.log('Add Item button clicked');
    } else if (action === 'create-post') {
      console.log('Create Post button clicked');
    }
  };

  return (
    <div>
      <NavBar />
      <BorrowingPost borrowingPosts={borrowingPosts} />
      <Footer />
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
}

export default Posts;
