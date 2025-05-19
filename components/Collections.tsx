import Link from 'next/link';
import Image from 'next/image';


export type collections = {
  id: number;
  title: string;
  image: string;
  link: string;
};

export type CollectionProps = {
  title: string;
  description: string;
  collections: collections[];
};

export default function Collections({title, description, collections}: CollectionProps) {
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-black ">
        <h2 className="text-center text-4xl font-bold mb-2">{title}</h2>
        <p className="text-center text-gray-600 mb-8">{description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-8">
          {collections.map((collection) => (
            <Link 
              href={collection.link} 
              key={collection.id}
              className="flex flex-col items-center group"
            >
              <div className="relative w-full overflow-hidden rounded-full aspect-square mb-4 bg-gray-200">
                
                <img src={collection.image} alt={collection.title} className="object-cover" />
              </div>
              <h3 className="text-center font-medium">{collection.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 