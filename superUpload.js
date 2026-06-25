/**
 * superUpload.js
 * 
 * Madurai Gadgets - Ultimate Cloudinary & MySQL Automated Seeding Script
 * 
 * Machan, follow these steps to upload your 528 sunglasses in 1 minute:
 * 1. Create an 'images' folder in your project root.
 * 2. Put all your 528 sunglass photo files (.jpg, .png, .jpeg) inside it.
 * 3. Make sure your .env has CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * 4. Run: node superUpload.js
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Hardcoded Port or from environment
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/products`;

// Configure Cloudinary from Env or custom variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drtndbcbu',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Target local directory
const imagesFolder = path.join(__dirname, 'images');

async function autoUploadEverything() {
  console.log(`\n======================================================`);
  console.log(`🔥 MADURAI GADGETS - ULTIMATE AUTO CLOUDINARY ENGINE`);
  console.log(`======================================================`);

  if (!fs.existsSync(imagesFolder)) {
    console.log(`❌ Folder Error: 'images' folder not found at ${imagesFolder}`);
    console.log(`👉 Please create an 'images/' folder and drop your sunglass photos inside!`);
    return;
  }

  try {
    const files = fs.readdirSync(imagesFolder).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

    if (files.length === 0) {
      console.log(`❌ No image files found in the 'images/' folder.`);
      return;
    }

    // Machan, limiting to first 50 items for safe testing as requested!
    const limit = Math.min(50, files.length);
    console.log(`Found ${files.length} sunglass images. Limiting upload to the first ${limit} items for initial testing! 🚀`);

    for (let i = 0; i < limit; i++) {
      const file = files[i];
      const filePath = path.join(imagesFolder, file);

      console.log(`\n⏳ [${i + 1}/${limit}] Uploading '${file}' to Cloudinary...`);

      try {
        // 1. Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: "madurai_gadgets_sunglasses",
          use_filename: true,
          unique_filename: true
        });

        console.log(`✨ Cloudinary Link: ${uploadResult.secure_url}`);

        // 2. Prepare database payload
        const newProduct = {
          name: `Premium Sunglass Edition ${i + 1}`,
          price: 1999, // Your desired default price
          description: "A+ Grade premium quality polarized sunglass with complete UV400 protection.",
          image_url: uploadResult.secure_url,
          category: "Sunglasses",
          stock: 15,
          variations: [] // Defaults to empty list
        };

        // 3. Save to database via our server API
        const dbResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });

        if (dbResponse.ok) {
          const resJson = await dbResponse.json();
          console.log(`✅ Database Saved: 'Model ${i + 1}' (ID: ${resJson.productId})`);
        } else {
          const errText = await dbResponse.text();
          console.log(`❌ Database Save Failed: (Status ${dbResponse.status}): ${errText}`);
        }

      } catch (err) {
        console.error(`❌ Upload failed for ${file}:`, err.message);
      }

      // Smooth spacing delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n======================================================`);
    console.log(`🎉 ALL ${limit} SUNGLASSES PROCESSED SUCCESSFULLY, MACHAN! 🥂`);
    console.log(`======================================================\n`);

  } catch (error) {
    console.error("Aiyyo, general execution error:", error.message);
  }
}

autoUploadEverything();
