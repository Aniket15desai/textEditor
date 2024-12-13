// components/Title.tsx
import Link from "next/link";
import React from "react";

interface TitleProps {
  name: string;
}

const Title: React.FC<TitleProps> = ({ name }) => {
  return <h3>Demo editor by <Link href={`https://github.com/aniket15desai/`} className="underline"><strong><em>{name}</em></strong></Link></h3>;
};

export default Title;
