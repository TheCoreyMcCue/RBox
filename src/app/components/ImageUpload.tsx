"use client";

import { UploadButton } from "@/lib/uploadthing";
import React, { Dispatch, SetStateAction, useState } from "react";

type FileUploaderProps = {
  setImage: (url: string) => void;
};

const ImageUpload = ({ setImage }: FileUploaderProps) => {
  const [useUrl, setUseUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      alert("Please enter a valid image URL.");
      return;
    }
    setImage(imageUrl.trim());
    alert("Image URL added!");
  };

  return (
    <div className="flex flex-col items-center justify-center bg-amber-100/60 border-2 border-dashed border-amber-300 rounded-3xl p-10 text-center shadow-sm hover:bg-amber-100 transition-colors duration-300">
      <p className="text-amber-700 font-serif mb-4 text-lg">
        Upload a photo of your dish — or paste an image link 🍲
      </p>

      {/* Mode toggle buttons */}
      {!useUrl && (
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className="mb-6 bg-amber-200 text-amber-800 py-2.5 px-6 rounded-full text-base font-semibold hover:bg-amber-300 transition-all duration-300"
        >
          🌐 Use Image URL
        </button>
      )}

      {/* Upload Section */}
      {!useUrl && (
        <UploadButton
          endpoint="imageUploader"
          appearance={{
            container: "flex flex-col items-center justify-center gap-3",
            button:
              "flex items-center justify-center bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300 text-base leading-none",
          }}
          content={{
            button({ isUploading }) {
              return (
                <span className="flex items-center gap-2">
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      📸 <span>Choose Image</span>
                    </>
                  )}
                </span>
              );
            },
          }}
          onClientUploadComplete={(res) => {
            console.log("Files: ", res[0]);
            setImage(res[0].url);
            alert("Upload Completed");
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      )}

      {/* URL Section */}
      {useUrl && (
        <div className="w-full max-w-md mt-4">
          <input
            type="url"
            placeholder="Enter an image URL (e.g., https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 border border-amber-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-amber-400 focus:outline-none text-amber-900 placeholder:text-amber-400"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-2.5 px-6 rounded-full text-base font-semibold shadow-md hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
            >
              ✅ Use This Image
            </button>
            <button
              type="button"
              onClick={() => setUseUrl(false)}
              className="bg-amber-200 text-amber-800 py-2.5 px-6 rounded-full text-base font-semibold hover:bg-amber-300 transition-all duration-300"
            >
              🔙 Back to Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
