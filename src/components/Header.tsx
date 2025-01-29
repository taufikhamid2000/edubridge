import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo">
        EduBridge
      </Link>
      <nav>
        <Link href="/sign-in">
          <button className="btn">Sign In</button>
        </Link>
        <Link href="/sign-up">
          <button className="btn join">Join Now</button>
        </Link>
      </nav>
    </header>
  );
}
