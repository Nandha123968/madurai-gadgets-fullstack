/**
 * bulkUpload.js - Script to automate uploading 528 sunglasses / watch images.
 * Run this in your terminal: node bulkUpload.js
 */

// We define the port of our running server (defaults to 3000 for AI Studio environment)
const PORT = 3000;
const API_URL = `http://localhost:${PORT}/api/products`;

// Inga thaan un 528 Cloudinary links-ah poda pora:
const imageLinks = [
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop"
  // Un midham irukkura 528 links-aiyum inga add pannikko...
];

async function uploadProducts() {
  console.log(`\n==============================================`);
  console.log(`🚀 MADURAI GADGETS - AUTOMATED BULK LOADER`);
  console.log(`==============================================`);
  console.log(`Total images identified to upload: ${imageLinks.length}\n`);

  for (let i = 0; i < imageLinks.length; i++) {
    const newProduct = {
      name: `Premium Sunglass Model ${i + 1}`,
      price: 1999, // Unakku thevayana default rate
      description: "A+ Grade premium quality sunglasses with UV protection and luxury style detailing.",
      image_url: imageLinks[i],
      category: "Sunglasses",
      stock: 15,
      variations: [] // No variations by default
    };

    console.log(`[${i + 1}/${imageLinks.length}] Processing: Model ${i + 1}...`);

    try {
      // Using modern global fetch (Node.js 18+ natively supports this!)
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        console.log(`✅ Uploaded Successfully: Model ${i + 1}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: Model ${i + 1} (Status ${response.status}: ${errorText})`);
      }
    } catch (error) {
      console.error(`❌ Connection Error for Model ${i + 1}:`, error.message);
      console.log(`👉 Make sure your backend server is active on port ${PORT}!`);
    }

    // Delay 300ms to allow smooth database inserts
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log("\n==============================================");
  console.log("🎉 All Sunglasses Bulk Upload Completed successfully, Machan! 🥂");
  console.log("==============================================\n");
}

uploadProducts();
