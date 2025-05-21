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

export default function Collections({ title, description, collections }: CollectionProps) {
  return (
    <section className="py-16 bg-white">
  <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-black">
    <h2 className="text-center text-4xl font-bold mb-2">{title}</h2>
    <p className="text-center text-gray-600 mb-8">{description}</p>

    <div className="flex flex-wrap justify-center gap-6 mt-8">
      {collections.map(collection => (
        <div key={collection.id} className="flex flex-col items-center group w-56">
          <Link
            href={collection.link}
            className="relative w-56 h-56 overflow-hidden rounded-full mb-4 bg-gray-200"
          >
            <img
              src={collection.image}
              alt={collection.title}
              className="object-cover w-full h-full"
            />
          </Link>
          <h3 className="text-center font-medium">{collection.title}</h3>
        </div>
      ))}
    </div>
  </div>
</section>

  );
}
