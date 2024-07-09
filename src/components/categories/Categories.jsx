import "./style.css";

const Categories = () => {
  const categories = ["CAFA", "CIE", "CIT", "CLA", "COE", "COS"];
  return (
    <div className="fs-5 fw-bold fst-italic">
      <div className="categories">
        {categories.map((cat, index) => (
          
          <div className="box-div" key={index}>
            <img
              src={require(`../../assets/images/categories/IMG_${index + 1}.png`)}
              alt={`${cat} Category Icon`}
            />
            <span>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
