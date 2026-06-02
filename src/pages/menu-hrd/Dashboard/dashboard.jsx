import './dashboard.css';

function dashboardHRD() {
  const namaHRD = "Admin HRD"; // Ganti dengan data dinamis

  return (
    <>
      <div className="dashboard-container">
        <div className="card">
          <div className="card-body">
            <h2>Selamat Datang, {namaHRD}! 👋</h2>
            <p className="text-muted">Dashboard HRD</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default dashboardHRD;