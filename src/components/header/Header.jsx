import "./style.css";

const Header = () => {
  return (
    <header>
      <div className="header-content">
        <h1 className="sub-title">Unlock the Freedom of Peer-to-Peer Renting</h1>
        <p className="sub-description">
          Discover a world of affordable, convenient, and sustainable rentals
          for students like you.
        </p>
      </div>
      <div className="search-container">
        <select className="search-dropdown">
          <option value="option1">Explore</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
        <input type="text" className="search-box" placeholder="Search..." />
        <a href="#" className="search-button">
          <i className="fa-solid fa-search"></i>
        </a>
      </div>
    </header>
  );
};

export default Header;
