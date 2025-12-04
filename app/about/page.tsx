export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About Muri Press</h1>

      {/* Hero Section */}
      <div className="mb-12">
        <p className="text-lg text-medium leading-relaxed">
          Welcome to Muri Press, where innovation meets precision in 3D printing.
          We&apos;re passionate about bringing your digital designs to life with
          exceptional quality and service.
        </p>
      </div>

      {/* Our Story */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <div className="space-y-4 text-medium">
          <p>
            Founded in 2025, Muri Press was born from a simple belief: that everyone should
            have access to high-quality, affordable 3D printing services. What started as a
            small workshop has grown into a trusted platform serving makers, designers, and
            businesses around the world.
          </p>
          <p>
            Our team combines years of expertise in additive manufacturing with cutting-edge
            technology to deliver prints that exceed expectations. Whether you&apos;re
            prototyping a new product, creating custom parts, or bringing an artistic vision
            to life, we&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="mb-12 bg-light p-8 rounded-[2px]">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-medium leading-relaxed">
          To democratize 3D printing by providing accessible, reliable, and high-quality
          printing services that empower creators to turn their ideas into reality. We believe
          in sustainability, precision, and customer satisfaction above all else.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Why Choose Muri Press</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-[#E6E6E6] p-6 rounded-[2px]">
            <h3 className="text-lg font-semibold mb-3">Quality First</h3>
            <p className="text-medium">
              Every print is carefully inspected to ensure it meets our high standards.
              We use premium materials and state-of-the-art printers for consistent results.
            </p>
          </div>

          <div className="border border-[#E6E6E6] p-6 rounded-[2px]">
            <h3 className="text-lg font-semibold mb-3">Fast Turnaround</h3>
            <p className="text-medium">
              We understand deadlines matter. Our efficient workflow ensures your prints
              are produced quickly without compromising quality.
            </p>
          </div>

          <div className="border border-[#E6E6E6] p-6 rounded-[2px]">
            <h3 className="text-lg font-semibold mb-3">Expert Support</h3>
            <p className="text-medium">
              Our team is always ready to help optimize your designs, choose the right
              materials, and answer any questions you have.
            </p>
          </div>

          <div className="border border-[#E6E6E6] p-6 rounded-[2px]">
            <h3 className="text-lg font-semibold mb-3">Sustainable Practices</h3>
            <p className="text-medium">
              We&apos;re committed to reducing waste and using eco-friendly materials
              wherever possible, because we care about our planet&apos;s future.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Innovation</h3>
            <p className="text-medium">
              We continuously invest in the latest technology and techniques to stay at
              the forefront of 3D printing.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Transparency</h3>
            <p className="text-medium">
              Clear pricing, honest timelines, and open communication. You always know
              exactly what to expect.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Community</h3>
            <p className="text-medium">
              We&apos;re more than a service—we&apos;re part of the maker community,
              supporting creators and innovators every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-[#F4008A] to-[#D4007A] text-white p-8 rounded-[2px]">
        <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
        <p className="mb-6 text-lg">
          Upload your 3D model today and experience the Muri Press difference.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-white text-[#F4008A] rounded-[2px] font-medium hover:bg-gray-100 transition-colors"
        >
          Start Your Project
        </a>
      </section>
    </div>
  );
}
