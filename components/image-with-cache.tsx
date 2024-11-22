import Image, { ImageProps } from 'next/image';
import { useImageCache } from '@/hooks/useImageCache';
import imagePlaceholder from '@/public/image-placeholder.png';

interface ImageWithCacheProps extends Omit<ImageProps, 'src'> {
  imageData: string;
}

export default function ImageWithCache({ imageData, alt, ...props }: ImageWithCacheProps) {
  const { data: cachedSrc, isLoading } = useImageCache(imageData);

  if (isLoading || !cachedSrc) {
    return (
      <Image
        src={imagePlaceholder}
        alt={alt}
        {...props}
        className={`${props.className} animate-pulse`}
      />
    );
  }

  return (
    <Image
      src={cachedSrc}
      alt={alt}
      {...props}
      placeholder="blur"
      blurDataURL={imagePlaceholder.blurDataURL}
    />
  );
}
