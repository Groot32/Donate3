import React, { useState } from "react"
import styles from "./Slider.module.css"
import BtnSlider from "./BtnSlider"

export default function Slider({ images }) {
    const [slideIndex, setSlideIndex] = useState(1)

    const nextSlide = () => {
        if (slideIndex !== images.length) {
            setSlideIndex(slideIndex + 1)
        } else if (slideIndex === images.length) {
            setSlideIndex(1)
        }
    }

    const prevSlide = () => {
        if (slideIndex !== 1) {
            setSlideIndex(slideIndex - 1)
        } else if (slideIndex === 1) {
            setSlideIndex(images.length)
        }
    }

    const moveDot = (index) => {
        setSlideIndex(index)
    }

    return images && images.length != 0 ? (
        <div className={styles["container-slider"]}>
            {images.map((obj, index) => {
                return (
                    <div
                        key={index}
                        className={
                            slideIndex === index + 1
                                ? styles["slide"] + " " + styles["active-anim"]
                                : styles["slide"]
                        }
                    >
                        <img src={obj} />
                    </div>
                )
            })}
            <BtnSlider moveSlide={nextSlide} direction={"next"} />
            <BtnSlider moveSlide={prevSlide} direction={"prev"} />

            <div className={styles["container-dots"]}>
                {Array.from({ length: images.length }).map((item, index) => (
                    <div
                        key={index}
                        onClick={() => moveDot(index + 1)}
                        className={
                            (slideIndex === index + 1
                                ? styles["dot"] + " " + styles["active"]
                                : styles["dot"]) + " cursor-pointer"
                        }
                    ></div>
                ))}
            </div>
        </div>
    ) : null
}
