"use client"
import Image from "next/image";
import { useInView } from "react-intersection-observer";

function LoadMore() {
  //helps keep track of where the page has been scorlled to.
  const { ref, inView } = useInView();

  return (
    <>
      <section className="flex justify-center items-center w-full">
        <div>
          <Image
            src="./spinner.svg"
            alt="spinner"
            width={56}
            height={56}
            className="object-contain"
          />
        </div>
      </section>
    </>
  );
}

export default LoadMore;
