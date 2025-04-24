import './App.css'

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "./components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

// Import pdfjs-dist for PDF parsing (Vite compatible)
// Removed pdfjs-dist imports and worker setup since only DOCX is supported now.
import mammoth from "mammoth/mammoth.browser";

// TODO: Replace with your actual Supabase details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setText("");
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    try {
      // Upload to Supabase
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage.from("uploads").upload(filePath, selectedFile);
      if (uploadError) throw uploadError;

      // Download the file back
      const { data, error: downloadError } = await supabase.storage.from("uploads").download(filePath);
      if (downloadError || !data) throw downloadError || new Error("Download failed");

      // Parse file
      let extractedText = "";
      if (fileExt === "docx") {
        extractedText = await extractDocxText(data);
      } else {
        throw new Error("Only DOCX files are supported");
      }
      setText(extractedText);
    } catch (err: any) {
      setError(err.message || "Error processing file");
    } finally {
      setLoading(false);
    }
  };

  // Removed PDF text extraction since only DOCX is supported now.

  // DOCX text extraction
  async function extractDocxText(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-muted py-8">
      <div className="w-full max-w-xl">
        <Card className="p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">DOCX to Text Extractor</h1>
          <div className="flex flex-col gap-4">
            <Input
              id="file-upload"
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              disabled={loading}
            />
            <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={loading} variant="default">
              {loading ? (
                <span className="flex items-center gap-2"><Spinner className="w-4 h-4 animate-spin" /> Processing...</span>
              ) : (
                file ? `Selected: ${file.name}` : "Choose DOCX File"
              )}
            </Button>
            {error && <Alert variant="destructive">{error}</Alert>}
            {text && (
              <div>
                <label className="block mb-2 font-medium">Extracted Text</label>
                <Textarea
                  className="w-full h-72 resize-none"
                  value={text}
                  readOnly
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App
