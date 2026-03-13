export default function Footer() {
  return (
    <footer className="bg-albion-darker border-t border-gray-700 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
        <p>
          Market data from{" "}
          <a
            href="https://www.albion-online-data.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Albion Online Data Project
          </a>
          . Not affiliated with Sandbox Interactive.
        </p>
      </div>
    </footer>
  );
}
