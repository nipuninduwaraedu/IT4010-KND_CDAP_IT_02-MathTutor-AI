import os
from pathlib import Path
import cv2


def clean_proof_image(input_path: str, output_path: str) -> str:
    """
    Enhance a handwritten geometry proof image using grayscale conversion,
    Gaussian denoising, and Adaptive Gaussian Thresholding.
    """
    image = cv2.imread(str(input_path))
    if image is None:
        raise FileNotFoundError(f"Could not read input image at: {input_path}")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    denoised = cv2.GaussianBlur(gray, (3, 3), 0)
    enhanced = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        15,
        8,
    )

    out_dir = Path(output_path).parent
    os.makedirs(out_dir, exist_ok=True)
    cv2.imwrite(str(output_path), enhanced)
    return str(output_path)
