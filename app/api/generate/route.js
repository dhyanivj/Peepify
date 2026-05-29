import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { referenceImage } = await request.json();

    if (!referenceImage || !referenceImage.startsWith('data:image/')) {
       return NextResponse.json(
        { error: 'A valid base64 reference image is required.' },
        { status: 400 }
      );
    }

    // Extract base64 payload and MIME type from data URL
    const mimeType = referenceImage.split(';')[0].split(':')[1] || 'image/jpeg';
    const base64Data = referenceImage.split(',')[1];
    if (!base64Data) {
       return NextResponse.json({ error: 'Invalid reference image format.' }, { status: 400 });
    }

    // Validate project configuration
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (!project) {
      return NextResponse.json(
        { error: 'GCP Project ID is not configured on the server. Please set GOOGLE_CLOUD_PROJECT.' },
        { status: 500 }
      );
    }

    // Initialize Google Gen AI client with Vertex AI enabled using ADC
    const ai = new GoogleGenAI({
      vertexai: true,
      project: project,
      location: location,
    });

    // 1. Analyze the reference image using Gemini 2.5 Flash to extract semantic features
    const analysisPrompt = `Analyze the person in this image in detail to help create a stylized black and white avatar. 
Identify the following features precisely and concisely:
1. Hair: style, length, texture (curly, straight, wavy, bald, short, long), facial hair (beard, mustache, stubble).
2. Face & head details: shape, distinct facial features (big eyes, thick eyebrows, glasses, nose shape, mouth shape).
3. Clothing & neckline: type of collar or neck line (crewneck, collar shirt, hoodie, V-neck, jacket).
4. Expression: smiling, laughing, neutral, frowning.
5. Key distinct accessories: glasses, earrings, hats, piercings.
6. Demographics: approximate age group, gender expression (man, woman, child).

Write a single, very concise, comma-separated list of these key visual features. For example: "A young woman with long curly brown hair, round glasses, a happy wide smile, wearing a crewneck sweater" or "A middle-aged man with short straight hair, a mustache, wearing a collared shirt."`;

    let personDescription = "A person";
    try {
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: analysisPrompt,
          },
        ],
      });
      if (geminiResponse.text) {
        personDescription = geminiResponse.text.trim();
      }
    } catch (geminiError) {
      console.error('Gemini reference analysis failed, falling back to general description:', geminiError);
    }

    // 2. Build the final prompt using the Gemini description for accurate character feature mapping
    const finalPrompt = `A minimalist black and white hand-drawn doodle illustration of the person: ${personDescription}. Flat vector art style with thick, bold black marker outlines. No shading, no gradients, and no photorealism. The character should have stylized, exaggerated proportions—like a slightly larger head, simple dot-and-line facial features, and noodle-like limbs. Quirky, fun, and exactly in the 'Open Peeps' illustration style by Pablo Stanley. Solid white background.`;
    const negativePrompt = "photorealistic, photography, 3d render, shading, gradients, realistic textures, detailed skin, soft lighting, shadows, cinematic, highly detailed, watercolor, oil painting";

    // 3. Call the Imagen 3 generate model with the refined prompt and reference image
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg',
        negativePrompt: negativePrompt,
        // High guidance scale to force the style over the realism of the image
        guidanceScale: 8.5,
        referenceImages: [
          {
            image: {
              imageBytes: base64Data
            }
          }
        ]
      },
    });

    const image = response?.generatedImages?.[0]?.image;

    if (!image || !image.imageBytes) {
      return NextResponse.json(
        { error: 'Failed to generate image. No image data was returned by the model.' },
        { status: 500 }
      );
    }

    // Return the image as a base64 data URL
    const base64Image = `data:image/jpeg;base64,${image.imageBytes}`;

    return NextResponse.json({
      success: true,
      imageUrl: base64Image,
      prompt: finalPrompt,
      model: 'imagen-3.0-generate-002',
    });
  } catch (error) {
    console.error('Error in /api/generate Route Handler:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred while generating the image.' },
      { status: 500 }
    );
  }
}
