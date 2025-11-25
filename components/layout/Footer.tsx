import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              PRINT<span className="text-xs text-medium">with</span>MURI
            </h3>
            <p className="text-medium text-sm">
              Professional on-demand printing services for your 3D models, paper prints, and custom merchandise.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-medium hover:text-primary text-sm transition-colors">
                  3D Printing
                </Link>
              </li>
              <li>
                <span className="text-medium text-sm">Paper Printing (Coming Soon)</span>
              </li>
              <li>
                <span className="text-medium text-sm">Merchandise (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-medium hover:text-primary text-sm transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-medium hover:text-primary text-sm transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:support@printwithmuri.com" className="text-medium hover:text-primary text-sm transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-medium hover:text-primary text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-medium hover:text-primary text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-300 text-center text-medium text-sm">
          <p>&copy; {currentYear} Muri Press. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
