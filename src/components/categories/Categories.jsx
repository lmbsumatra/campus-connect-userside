import "./categoriesStyle.css";

const Categories = () => {
  const categories = ["CAFA", "CIE", "CIT", "CLA", "COE", "COS"];
  return (
    <div className="container-content d-flex justify-content-between">
      <div className="categories w-100">
        {categories.map((cat, index) => (
          <div className="category" key={index}>
            <img
              src={require(`../../assets/images/categories/IMG_${
                index + 1
              }.png`)}
              alt={`${cat} Category Icon`}
            />
            <div className="text-side d-flex flex-column">
              <span>{cat}</span>
              <a href="#" alt="View all button">
                View All →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
