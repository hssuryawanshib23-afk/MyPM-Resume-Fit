// Top site header with links to the new-analysis and history pages
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          MyPM Resume Fit
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            New analysis
          </Link>
          <Link href="/history" className="hover:text-gray-900">
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
