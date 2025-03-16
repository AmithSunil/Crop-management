// app/page.js
"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setPredictions(null);

      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select an image file");
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setPredictions(data.predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setPredictions(null);
    setError(null);
  };

  return (
    <main className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Plant Disease Predictor</CardTitle>
          <CardDescription>Upload an image of a plant leaf to identify potential diseases</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full items-center gap-4">
              {/* Show upload area only if no file is selected */}
              {!file && (
                <div className="flex flex-col space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">{file ? file.name : "Click to upload an image"}</span>
                      <span className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF up to 10MB</span>
                    </label>
                  </div>
                </div>
              )}

              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Image Preview:</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
                  </div>
                  {/* Clear Image button appears after preview */}
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={handleClear}
                  >
                    Clear Image
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading || !file} className="w-full">
                {loading ? "Analyzing Image..." : "Predict Disease"}
              </Button>

              {loading && <Progress value={50} className="w-full animate-pulse" />}
            </div>
          </form>

          {predictions && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Prediction Results</h3>
              <div className="space-y-3">
                {predictions.map((prediction, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{prediction.label}</p>
                      <div className="w-full bg-muted rounded-full h-2.5 mt-1">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${prediction.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium ml-4">{(prediction.score * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-muted-foreground">
          <p>API Endpoint: http://127.0.0.1:8000/predict</p>
        </CardFooter>
      </Card>
    </main>
  );
}