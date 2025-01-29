export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} EduBridge. All rights reserved.</p>
      <nav>
        <a href="about">About</a>
        <a href="privacy">Privacy</a>
        <a href="terms">Terms</a>
      </nav>
    </footer>
  );
}
