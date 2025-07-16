// Demo File Upload Component from https://github.com/zpg6/better-auth-cloudflare
/** biome-ignore-all lint/suspicious/noConsole: DemoFileUpload */
/** biome-ignore-all lint/style/useFilenamingConvention: DemoFileUpload */
/** biome-ignore-all lint/suspicious/noExplicitAny: DemoFileUpload */

'use client';

import { CheckCircle, FolderOpen, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import authClient from '@/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FileUploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileOperationResult, setFileOperationResult] = useState<{
    success?: boolean;
    error?: string;
    data?: any;
  } | null>(null);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setFileOperationResult(null);

    try {
      // To do: Improve type-safety of metadata using client action
      const result = await authClient.uploadFile(file, {
        isPublic,
        ...(category.trim() && { category: category.trim() }),
        ...(description.trim() && { description: description.trim() }),
      });

      if (result.error) {
        setFileOperationResult({
          error:
            result.error.message || 'Failed to upload file. Please try again.',
        });
      } else {
        setFileOperationResult({ success: true, data: result.data });
        // Clear form
        setFile(null);
        setCategory('');
        setIsPublic(false);
        setDescription('');
        // Refresh file list
        loadUserFiles();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setFileOperationResult({
        error:
          error instanceof Error && error.message
            ? `Upload failed: ${error.message}`
            : 'Failed to upload file. Please check your connection and try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const loadUserFiles = async () => {
    setIsLoadingFiles(true);
    try {
      // Use the inferred list endpoint with pagination support
      const result = await authClient.files.list();

      if (result.data) {
        // Types should now be properly inferred from the endpoint
        setUserFiles(result.data.files || []);
      } else {
        setUserFiles([]);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      setUserFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const result = await authClient.files.download({ fileId });

      if (result.error) {
        console.error('Download failed:', result.error);
        setFileOperationResult({
          error: 'Failed to download file. Please try again.',
        });
        return;
      }

      // Extract blob from Better Auth response structure
      const response = result.data;
      const blob =
        response instanceof Response ? await response.blob() : response;

      if (blob instanceof Blob && blob.size === 0) {
        console.warn('Warning: Downloaded file appears to be empty');
      }

      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Failed to download file:', error);
      setFileOperationResult({
        error: 'Failed to download file. Please try again.',
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      // Use the inferred delete endpoint
      const result = await authClient.files.delete({ fileId });
      if (result.error) {
        console.error('Delete failed:', result.error);
        setFileOperationResult({
          error: 'Failed to delete file. Please try again.',
        });
      } else {
        loadUserFiles(); // Auto-refresh list
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      setFileOperationResult({
        error: 'Failed to delete file. Please try again.',
      });
    }
  };

  // Helper function for better file size formatting
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  // Helper function for relative time formatting
  const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const uploadDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - uploadDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return 'Just now';
    }
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    }
    if (diffInSeconds < 86_400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
    if (diffInSeconds < 2_592_000) {
      return `${Math.floor(diffInSeconds / 86_400)}d ago`;
    }

    return uploadDate.toLocaleDateString();
  };

  // Auto-load files when component mounts
  // biome-ignore lint/correctness/useExhaustiveDependencies: Run Once
  useEffect(() => {
    loadUserFiles();
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block" htmlFor="file">
              Select File
            </Label>
            <Input
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              id="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              type="file"
            />
            {file && (
              <p className="mt-1 text-gray-500 text-sm">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="category">
              Category (optional)
            </Label>
            <Input
              id="category"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., documents, images"
              type="text"
              value={category}
            />
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="description">
              Description (optional)
            </Label>
            <Input
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="File description"
              type="text"
              value={description}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              checked={isPublic}
              id="isPublic"
              onChange={(e) => setIsPublic(e.target.checked)}
              type="checkbox"
            />
            <Label htmlFor="isPublic">Make file public</Label>
          </div>

          <div className="flex justify-center">
            <Button
              className="w-full max-w-xs"
              disabled={!file || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>

          {fileOperationResult && (
            <div
              className={`rounded-lg p-3 ${fileOperationResult.error ? 'border border-red-200 bg-red-50' : 'border border-green-200 bg-green-50'}`}
            >
              {fileOperationResult.error ? (
                <div className="flex items-start space-x-2">
                  <span className="mt-0.5 text-red-500">❌</span>
                  <p className="text-red-700 text-sm">
                    {fileOperationResult.error}
                  </p>
                </div>
              ) : (
                <div className="flex items-start space-x-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 text-sm">
                      File uploaded successfully!
                    </p>
                    <p className="mt-1 text-green-600 text-xs">
                      Your file has been stored securely and is now available in
                      your file list.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Files</CardTitle>
          <Button
            disabled={isLoadingFiles}
            onClick={loadUserFiles}
            size="sm"
            variant="outline"
          >
            {isLoadingFiles ? 'Loading...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {userFiles.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-4 flex justify-center">
                <FolderOpen className="h-16 w-16 text-gray-400" />
              </div>
              <p className="font-medium text-gray-500 text-lg">
                No files uploaded yet
              </p>
              <p className="mt-1 text-gray-400 text-sm">
                Upload your first file using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {userFiles.map((items) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={items.id}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {items.originalName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-gray-500 text-sm">
                      {items.category && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 text-xs">
                          {items.category}
                        </span>
                      )}
                      <span>{formatFileSize(items.size)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(items.uploadedAt)}</span>
                      {items.isPublic && (
                        <>
                          <span>•</span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 text-xs">
                            Public
                          </span>
                        </>
                      )}
                    </div>
                    {items.description && (
                      <p className="mt-1 text-gray-600 text-sm">
                        {items.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Button
                      onClick={() => downloadFile(items.id, items.originalName)}
                      size="sm"
                      variant="outline"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => deleteFile(items.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
