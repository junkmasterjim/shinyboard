import Image from "next/image";

interface SpriteProps {
  dexNo: number;
  name: string;
  sprite: string;
}

export default function Sprite({ dexNo, name, sprite }: SpriteProps) {
  return (
    <div className='size-16 relative'>
      <Image
        fill
        className='object-contain pixelated'
        unoptimized
        alt={`${dexNo}: ${name}`}
        src={sprite}
      />
    </div>
  )
}
