import Image from 'next/image';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

type ImageHandlerProps = {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
};

export const ImageHandler = ({
  src,
  alt,
  className,
  onClick,
}: ImageHandlerProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-2 text-muted-foreground aspect-square rounded-xl theme-2">
        <ImageIcon className="size-6 sm:size-12" />
        <span className="text-xs sm:text-base">Нет фото</span>
      </div>
    );
  }

  const finalImageUrl = getImageUrl(src);

  return (
    <Image
      src={finalImageUrl!}
      width={1024}
      height={1024}
      alt={alt}
      className={`rounded-xl w-full h-auto ${className}`}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );
};
