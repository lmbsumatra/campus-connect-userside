import "./itemDescAndSpecsStyles.css";

export const ItemDescAndSpecs = ({ specs, desc, tags }) => {
  // console.log({ specs, desc, tags });
  return (
    <div className="item-desc">
      <label className="sub-section-label">Specifications</label>
      <table className="specifications-table" role="table">
        <tbody>
          {(() => {
            try {
              const specsParsed = specs
                ? Object.entries(JSON.parse(specs))
                : [];

              // console.log(JSON.parse(specs));

              if (specsParsed.length === 0) {
                return (
                  <span className="error-msg">
                    No specifications available.
                  </span>
                );
              }

              return specsParsed.map(([key, value]) => (
                <tr key={key}>
                  <td className="key">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </td>
                  <td className="value">{value}</td>
                </tr>
              ));
            } catch (error) {
              return (
                <span className="error-msg">Error loading specifications.</span>
              );
            }
          })()}
        </tbody>
      </table>
      <label className="sub-section-label">Description</label>
      <p>
        {desc && desc !== "undefined" ? (
          desc
        ) : (
          <span className="error-msg">No description</span>
        )}
      </p>

      <div className="tags-holder">
        <i>Tags: </i>
        {tags && tags !== "undefined" ? (
          tags.map((tag, index) => (
            <div key={index} className="tag">
              {tag}
            </div>
          ))
        ) : (
          <span className="error-msg">No tags available</span>
        )}
      </div>
    </div>
  );
};

export default ItemDescAndSpecs;
