// image, icons
import item from "../../assets/images/item/item_1.jpg";

// style, css
import "./style.css";

const ItemList = () => {
  return (
    <div className="custom-container post">
      <h2 className="fs-2 fw-bold">Top Listings</h2>
      <div className="card-container">
        <div className="card">
          <img src={item} className="card-img-left" alt="Item" />
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="fs-5">Flute</h5>
              <h5 className="fs-5">₱ 10/hr</h5>
            </div>
            <div className="d-flex align-items-center">
              <img src={item} alt="" className="icon-link me-2 mb-2" />
              <div>
                <h5 className="fs-6">Username</h5>
                <span>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffd43b" }}
                  ></i>
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
              <button className="btn btn-primary filled">
                <span className="text-gradient">View</span>
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <img src={item} className="card-img-left" alt="Item" />
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="fs-5">Flute</h5>
              <h5 className="fs-5">₱ 10/hr</h5>
            </div>
            <div className="d-flex align-items-center">
              <img src={item} alt="" className="icon-link me-2 mb-2" />
              <div>
                <h5 className="fs-6">Username</h5>
                <span>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffd43b" }}
                  ></i>
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
              <button className="btn btn-primary filled">
                <span className="text-gradient">View</span>
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <img src={item} className="card-img-left" alt="Item" />
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="fs-5">Flute</h5>
              <h5 className="fs-5">₱ 10/hr</h5>
            </div>
            <div className="d-flex align-items-center">
              <img src={item} alt="" className="icon-link me-2 mb-2" />
              <div>
                <h5 className="fs-6">Username</h5>
                <span>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffd43b" }}
                  ></i>
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
              <button className="btn btn-primary filled">
                <span className="text-gradient">View</span>
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <img src={item} className="card-img-left" alt="Item" />
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <h5 className="fs-5">Flute</h5>
              <h5 className="fs-5">₱ 10/hr</h5>
            </div>
            <div className="d-flex align-items-center">
              <img src={item} alt="" className="icon-link me-2 mb-2" />
              <div>
                <h5 className="fs-6">Username</h5>
                <span>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffd43b" }}
                  ></i>
                </span>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
              <button className="btn btn-primary filled">
                <span className="text-gradient">View</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ItemList;
