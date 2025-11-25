import FileUpload from "@/components/ui/FileUpload";

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Upload Your 3D Model
        </h1>
        <p className="text-medium text-lg">
          Support for STL, OBJ, and 3MF files
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <FileUpload />
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-primary text-3xl font-bold mb-2">1</div>
          <h3 className="font-semibold mb-2">Upload</h3>
          <p className="text-medium text-sm">Upload your 3D model file</p>
        </div>
        <div className="text-center">
          <div className="text-primary text-3xl font-bold mb-2">2</div>
          <h3 className="font-semibold mb-2">Configure</h3>
          <p className="text-medium text-sm">Choose material, quality, and color</p>
        </div>
        <div className="text-center">
          <div className="text-primary text-3xl font-bold mb-2">3</div>
          <h3 className="font-semibold mb-2">Order</h3>
          <p className="text-medium text-sm">Pay and track your order</p>
        </div>
      </div>
    </div>
  );
}
