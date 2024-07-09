// styles, css
import "./style.css";

const Banner = () => {
  return (
    <div class="custom-container">
      <div class="banner">
        <div class="text-white">
          <h5 className="text-light">Want to lend a hand?</h5>
          <h1 className="fw-bold">Rent out your stuff!</h1>
        </div>

        <div className="d-flex align-items-center">
          <button className="btn btn-primary no-fill">
            <span className="text-gradient">Rent out now!</span>
          </button>
          <a href="#">Learn More</a>
        </div>
      </div>
    </div>
  );
};

export default Banner;
