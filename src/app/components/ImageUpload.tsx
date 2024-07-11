import { UploadButton } from "@/lib/uploadthing";
import { File } from "buffer";
import React, { Dispatch, SetStateAction } from "react";

type FileUploaderProps = {
  setImage: Dispatch<SetStateAction<string>>;
};

const ImageUpload = ({ setImage }: FileUploaderProps) => {
  return (
    <div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res[0]);
          setImage(res[0].url);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
};

export default ImageUpload;
