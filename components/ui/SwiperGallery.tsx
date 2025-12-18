'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Keyboard } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

interface SwiperGalleryProps {
  images: string[];
  autoplayDelay?: number;
  rotate?: number;
  stretch?: number;
  depth?: number;
  slideShadows?: boolean;
}

export default function SwiperGallery({
  images,
  autoplayDelay = 3000,
  rotate = 40,
  stretch = 0,
  depth = 100,
  slideShadows = false,
}: SwiperGalleryProps) {
  return (
    <div className="w-full h-full swiper-gallery">
      <style jsx global>{`
        .swiper-gallery .swiper-slide {
          transition: transform 0.3s ease;
        }
        .swiper-gallery .swiper-slide .image-overlay {
          position: absolute;
          inset: 0;
          background: white;
          opacity: 0.7;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .swiper-gallery .swiper-slide-active .image-overlay {
          opacity: 0;
        }
      `}</style>
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={true}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        coverflowEffect={{
          rotate,
          stretch,
          depth,
          modifier: 1,
          slideShadows,
        }}
        keyboard={{
          enabled: true,
        }}
        modules={[EffectCoverflow, Autoplay, Keyboard]}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="!w-[288px] !h-[360px] md:!w-[340px] md:!h-[425px]"
          >
            <div className="relative w-full h-full rounded-[2px] overflow-hidden">
              <Image
                src={image}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover"
                sizes="330px"
                priority={index < 3}
              />
              <div className="image-overlay" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
