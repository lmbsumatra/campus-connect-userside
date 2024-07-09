import "./style.css";
import item from "../../assets/images/item/item_1.jpg";

const BorrowingPost = () => {
  return (
    <div className="custom-container post">
      <h2 className="fs-2 fw-bold">New Borrowing Posts</h2>
      <div className="card-container">
        <div className="card" style={{ width: "550px" }}>
          <div className="d-flex user-container align-items-center">
            <div className=" align-items-center">
              <img src={item} alt="" className="icon-user me-2" />
              <h5 className="fs-6">
                Username (
                <span>
                  4.8
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffd43b" }}
                  ></i>
                </span>
                ) <span>is looking for</span>
              </h5>
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary no-fill me-2">
                <span className="text-gradient">Message</span>
              </button>
              <button className="btn btn-primary no-fill">
                <span className="text-gradient">View</span>
              </button>
            </div>
          </div>
          <div className="card-body d-flex flex-row">
            <div className="card-content">
              <div className="pe-3">
                <div>
                  <h5 className="fs-5">Flute</h5>
                </div>
                <div className="d-flex align-items-center mb-1">
                  <span className="me-2">Duration</span>
                  <button className="btn btn-tertiary no-fill">
                    9am - 10pm
                  </button>
                </div>
                <div className="d-flex align-items-center mb-1">
                  <span className="me-2">Rental Date</span>
                  <button className="btn btn-tertiary no-fill">July 01</button>
                </div>
                <div className="d-flex align-items-center mb-1">
                  <span className="me-2">Delivery</span>
                  <button className="btn btn-tertiary no-fill">Meetup</button>
                </div>
              </div>
            </div>
            <div>
              <img
                src={item}
                className="card-img-left"
                alt="..."
                style={{ width: "200px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowingPost;
