export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} EduBridge. All rights reserved.
        </p>
        <nav className="mt-4 flex justify-center space-x-6">
          <a href="about" className="text-blue-400 hover:underline">
            About
          </a>
          <a href="privacy" className="text-blue-400 hover:underline">
            Privacy
          </a>
          <a href="terms" className="text-blue-400 hover:underline">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}
