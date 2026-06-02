import './Footer.css';

function Footer() {
  return (
    <footer id="footer" className="footer">
      <div className="copyright">
        &copy; Copyright{' '}
        <strong>
          <span>Payroll</span>
        </strong>
        . All Rights Reserved
      </div>
      <div className="creadit">
        Designed by <a href="#vincent">Vincent</a>
      </div>
    </footer>
  );
}

export default Footer;
