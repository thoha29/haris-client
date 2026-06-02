import './profile.css';

function Profile() {
  return (
    <>
      <div id="error-page" className="card">
        <div className="card-body d-flex flex-column align-items-center justify-content-center">
          <h1>Oops!</h1>
          <p>Sorry, the page you're looking for does not exist.</p>
          <p>
            <i>404 Not Found</i>
          </p>
        </div>
      </div>
    </>
  );
}

export default Profile;
