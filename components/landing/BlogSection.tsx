// components/landing/BlogSection.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/data/blog-posts";
import { ArrowRight } from "lucide-react";

const BlogSection = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600 mb-2">Blogs</p>
        <h2 className="text-3xl font-bold">
          Helpful articles from the <span className="text-[#0C8B44]">Elan</span> blog
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-gray-50 rounded-lg hover:-translate-y-2.5 hover:border border-[#0C8B44] transition-all duration-300 ease-in-out overflow-hidden">
            <div className="h-48 overflow-hidden">
              <Image
                src={post.imageSrc}
                alt={post.title}
                width={400}
                height={240}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-bold mb-4">{post.title}</h3>
              <Link target="_blank" href={`${post.slug}`} className="flex items-center justify-end text-[#0C8B44] text-sm font-medium">
                Read Blog <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <Link 
          target="_blank" 
          href="https://blog.elanroadtestrental.ca/" 
          className="group inline-flex items-center text-[#0C8B44] font-medium underline hover:underline-offset-2 transition-all duration-200 ease-in-out"
        >
          Read more blogs like this <ArrowRight size={16} className="ml-1 transition-all duration-300 group-hover:ml-2" />
        </Link>
      </div>
    </section>
  );
};

export default BlogSection;