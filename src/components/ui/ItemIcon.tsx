import Image from "next/image";

interface ItemIconProps {
  itemId: string;
  size?: number;
  className?: string;
}

export default function ItemIcon({ itemId, size = 40, className = "" }: ItemIconProps) {
  return (
    <Image
      src={`https://render.albiononline.com/v1/item/${itemId}.png?size=${size}&quality=1`}
      alt={itemId}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      unoptimized
    />
  );
}
