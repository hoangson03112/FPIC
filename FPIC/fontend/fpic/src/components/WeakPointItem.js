const WeakPointItem = ({ name, description, imageURL }) => (
  <div className="col-md-4 mb-4">
    <div className="card h-100 text-center">
      <img
        src={imageURL}
        alt={name}
        className="card-img-top"
        style={{ height: "150px", objectFit: "cover" }}
      />
    </div>
  </div>
);
export default WeakPointItem;
