/**
 * Utility to extract dominant color from an image URL or data URL on the client-side.
 * It draws the image onto a small canvas, samples pixels (excluding white/transparent backgrounds),
 * computes average values, and returns a HEX color code along with a suggested retail name.
 */
export interface ExtractedColor {
  hex: string;
  name: string;
}

export function extractDominantColor(imageUrl: string): Promise<ExtractedColor> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    // Handle CORS for external images (e.g. Cloudinary, Unsplash)
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({ hex: "#000000", name: "Black" });
          return;
        }

        // Draw image onto a small 12x12 canvas to get general average colors
        canvas.width = 12;
        canvas.height = 12;
        ctx.drawImage(img, 0, 0, 12, 12);

        const imgData = ctx.getImageData(0, 0, 12, 12).data;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        // Loop through pixels (r, g, b, a)
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip fully transparent pixels and very bright white background pixels (common in watch product photos)
          if (a > 150 && !(r > 240 && g > 240 && b > 240)) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        // Fallback if the image is entirely white or transparent
        if (count === 0) {
          for (let i = 0; i < imgData.length; i += 4) {
            rSum += imgData[i];
            gSum += imgData[i + 1];
            bSum += imgData[i + 2];
            count++;
          }
        }

        const rAvg = Math.round(rSum / count);
        const gAvg = Math.round(gSum / count);
        const bAvg = Math.round(bSum / count);

        // Convert RGB to Hexadecimal string
        const hex = "#" + [rAvg, gAvg, bAvg].map(val => {
          const hexStr = val.toString(16);
          return hexStr.length === 1 ? "0" + hexStr : hexStr;
        }).join("");

        // Heuristics to auto-generate beautiful descriptive names
        let name = "Signature Grey";
        const max = Math.max(rAvg, gAvg, bAvg);
        const min = Math.min(rAvg, gAvg, bAvg);
        const diff = max - min;

        // Check if color is grayscale
        if (diff < 22) {
          if (max < 55) {
            name = "Stealth Black";
          } else if (max > 215) {
            name = "Alpine White";
          } else if (max > 140) {
            name = "Classic Silver";
          } else {
            name = "Gunmetal Grey";
          }
        } else {
          // Color has a hue
          if (max === rAvg) {
            if (gAvg > 170 && bAvg < 110) {
              name = "Amber Gold";
            } else if (gAvg < 100 && bAvg < 100) {
              name = "Crimson Red";
            } else if (gAvg > 100 && bAvg > 120) {
              name = "Luxury Rosegold";
            } else {
              name = "Crimson Red";
            }
          } else if (max === gAvg) {
            if (rAvg > 160 && bAvg < 100) {
              name = "Olive Green";
            } else {
              name = "Emerald Green";
            }
          } else if (max === bAvg) {
            if (rAvg > 110 && gAvg < 100) {
              name = "Midnight Purple";
            } else if (gAvg > 140) {
              name = "Sky Blue";
            } else {
              name = "Ocean Blue";
            }
          }
        }

        resolve({ hex, name });
      } catch (err) {
        console.error("Color extraction failed:", err);
        resolve({ hex: "#000000", name: "Black" });
      }
    };

    img.onerror = (err) => {
      console.warn("Could not load image for color extraction:", err);
      resolve({ hex: "#000000", name: "Black" });
    };
  });
}
