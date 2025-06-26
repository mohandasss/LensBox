import React from 'react';
import AnimatedTestimonials from './ui/AnimatedTestimonials';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "I rented a DJI drone for a wedding shoot, and the device was in flawless condition. The rental process was simple, and everything arrived right on time. It's rare to find a service that handles expensive equipment with such care.",
      name: "Sarah Malik",
      designation: "Wedding Filmmaker",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      quote:
        "Needed a telephoto lens and tripod for a weekend wildlife shoot. Both arrived well-packaged and worked perfectly. I was impressed by the condition of the gear—it felt like I was using brand-new equipment. Absolutely loved the experience!",
      name: "Michael Fernandes",
      designation: "Wildlife Photographer",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      quote:
        "The platform has become my go-to for all rental needs—especially when I need a backup mirrorless body or extra batteries. Their refund policy is transparent and really customer-friendly, which makes renting stress-free.",
      name: "Emily Watson",
      designation: "YouTube Vlogger",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      quote:
        "Honestly didn’t expect the camera accessories to be this well-maintained. Even the memory cards and cleaning kits were included and in great shape. Their support team is super responsive too. 10/10 for reliability!",
      name: "James Kim",
      designation: "Freelance Cinematographer",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
      quote:
        "I’ve been renting cameras and gimbals regularly for client shoots, and this service never disappoints. Their collection is updated, the delivery is on point, and I love how they handle replacements and refunds smoothly.",
      name: "Lisa Thompson",
      designation: "Media Agency Owner",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
  ];
  

  return (
    <section className="bg-white dark:bg-black py-12  ">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-white dark:text-white">
          What Our Customers Say
        </h2>
        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </section>
  );
};

export default TestimonialsSection;
