import Tooltip from "@mui/material/Tooltip";
import "./itemBadgesStyles.css";
const ItemBadges = ({ values }) => {
  const getCollegeBadgeUrl = (college) => {
    if (college !== undefined && college !== null) {
      try {
        return require(`../../../assets/images/colleges/${college}.png`);
      } catch (error) {
        return require(`../../../assets/images/colleges/CAFA.png`);
      }
    } else {
      return require(`../../../assets/images/colleges/CAFA.png`);
    }
  };
  return (
    <div>
      <div className="college-badge">
        {values?.college && (
          <Tooltip
            title={`This item is from ${values?.college}.`}
            placement="bottom"
            componentsProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, 0],
                    },
                  },
                ],
              },
            }}
          >
            {values?.college && (
              <img
                src={getCollegeBadgeUrl(values?.college ?? "CAFA")}
                alt="College"
                style={{ height: "24px", width: "24px" }}
              />
            )}

            {values?.college && <span>{values?.college}</span>}
          </Tooltip>
        )}
      </div>
      <div className="category-badge">
        <Tooltip
          title={`This item is under ${values?.category} category.`}
          placement="bottom"
          componentsProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, 0],
                  },
                },
              ],
            },
          }}
        >
          {values?.category ? (
            <span>{values?.category}</span>
          ) : (
            <span className="error-msg"></span>
          )}
        </Tooltip>
      </div>
    </div>
  );
};

export default ItemBadges;
