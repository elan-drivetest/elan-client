// components/layout/Footer.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTiktok, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Footer links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Customers */}
          <div>
            <h3 className="font-medium text-sm text-[#0C8B44] mb-4">Customers</h3>
            <ul className="space-y-2">
              <li><Link href="/testimonials" className="text-sm hover:text-[#0C8B44]">Testimonials</Link></li>
              <li><Link href="/our-plans" className="text-sm hover:text-[#0C8B44]">Our Plans</Link></li>
              <li><Link href="/best-package" className="text-sm hover:text-[#0C8B44]">Best Tour Package</Link></li>
            </ul>
          </div>
          
          {/* Column 2 - Elan Quick Links */}
          <div>
            <h3 className="font-medium text-sm text-[#0C8B44] mb-4">Elan Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/custom-links" className="text-sm hover:text-[#0C8B44]">Custom Links</Link></li>
              <li><Link href="/custom-links" className="text-sm hover:text-[#0C8B44]">Custom Links</Link></li>
              <li><Link href="/custom-links" className="text-sm hover:text-[#0C8B44]">Custom Links</Link></li>
              <li><Link href="/custom-links" className="text-sm hover:text-[#0C8B44]">Custom Links</Link></li>
            </ul>
          </div>
          
          {/* Column 3 - Business */}
          <div>
            <h3 className="font-medium text-sm text-[#0C8B44] mb-4">Business</h3>
            <ul className="space-y-2">
              <li><Link href="/for-admins" className="text-sm hover:text-[#0C8B44]">For Admins</Link></li>
              <li><Link href="/for-instructors" className="text-sm hover:text-[#0C8B44]">For Instructors</Link></li>
            </ul>
          </div>
          
          {/* Column 4 - Company */}
          <div>
            <h3 className="font-medium text-sm text-[#0C8B44] mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm hover:text-[#0C8B44]">Contact Elan</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-[#0C8B44]">FAQs</Link></li>
              <li><Link href="/locations" className="text-sm hover:text-[#0C8B44]">Locations</Link></li>
              <li><Link href="/blog" className="text-sm hover:text-[#0C8B44]">Blogs</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Social media section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Repeat Customers column */}
          <div>
            <h3 className="font-medium text-sm text-[#0C8B44] mb-4">Customers</h3>
            <ul className="space-y-2">
              <li><Link href="/testimonials" className="text-sm hover:text-[#0C8B44]">Testimonials</Link></li>
              <li><Link href="/our-plans" className="text-sm hover:text-[#0C8B44]">Our Plans</Link></li>
              <li><Link href="/best-package" className="text-sm hover:text-[#0C8B44]">Best Tour Package</Link></li>
            </ul>
          </div>
          
          {/* Social media icons */}
          <div className="md:col-span-3">
            <h3 className="font-medium text-sm text-[#0C8B44] mb-4">Socials</h3>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/elanroadtestrental" aria-label="Facebook" className="text-gray-600 hover:text-[#0C8B44]">
                <FaFacebookF size={20} />
              </Link>
              <Link href="https://www.instagram.com/elanroadtestrental" aria-label="Instagram" className="text-gray-600 hover:text-[#0C8B44]">
                <FaInstagram size={20} />
              </Link>
              {/* <Link href="https://twitter.com" aria-label="Twitter" className="text-gray-600 hover:text-[#0C8B44]">
                <FaTwitter size={20} />
              </Link> */}
              <Link href="https://www.youtube.com/@GrayJaysDrivingSchool" aria-label="YouTube" className="text-gray-600 hover:text-[#0C8B44]">
                <FaYoutube size={20} />
              </Link>
              <Link href="https://www.tiktok.com/@elanroadtestcarsolutions" aria-label="YouTube" className="text-gray-600 hover:text-[#0C8B44]">
                <FaTiktok size={20} />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-200">
          <div className="flex items-center mb-4 md:mb-0">
            <p className="text-xs text-gray-600">© 2023 Elan. All Rights Reserved.</p>
            <div className="ml-2 flex items-center">
              <Image 
                src="/Flag_of_Canada.png" 
                alt="Canadian Flag" 
                width={16} 
                height={10} 
                className="mr-1"
              />
              <span className="text-xs text-gray-600">Proudly Canadian</span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Link href="/terms" className="text-xs text-gray-600 hover:text-[#0C8B44]">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs text-gray-600 hover:text-[#0C8B44]">
              Privacy Policy
            </Link>
            <Link href="/sitemap" className="text-xs text-gray-600 hover:text-[#0C8B44]">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;