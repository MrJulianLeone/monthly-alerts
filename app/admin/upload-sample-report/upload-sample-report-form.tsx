"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { uploadSampleReport } from "@/app/actions/sample-report"
import { Upload } from "lucide-react"

export default function UploadSampleReportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== "application/pdf") {
        setMessage({ type: "error", text: "Please select a PDF file" })
        setFile(null)
        return
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setMessage({ type: "error", text: "File size must be less than 10MB" })
        setFile(null)
        return
      }

      setFile(selectedFile)
      setMessage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadSampleReport(formData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.message || "Sample report uploaded successfully!" })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById("file") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "/admin"
        }, 2000)
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="file">Sample MonthlyAlert PDF</Label>
        <div className="mt-2">
          <input
            id="file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border file:border-input
              file:text-sm file:font-medium
              file:bg-background file:text-foreground
              hover:file:bg-accent hover:file:text-accent-foreground
              file:cursor-pointer cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Upload a PDF file (max 10MB). This will replace any existing sample report.
        </p>
        {file && (
          <p className="text-sm text-primary mt-2">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={loading || !file} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        {loading ? "Uploading..." : "Upload Sample Report"}
      </Button>
    </form>
  )
}

