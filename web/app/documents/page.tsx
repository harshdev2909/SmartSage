"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import FileUpload from "@/components/documents/FileUpload";
import { SubjectDialog } from "@/components/documents/SubjectDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: string;
  name: string;
  url: string;
  subject: string;
  created_at: string;
  user_id: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null,
  );
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [tempFileName, setTempFileName] = useState("");
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (url: string) => {
    const fileName = url.split("/").pop() || "Unnamed Document";
    setTempUrl(url);
    setTempFileName(fileName);
    setShowSubjectDialog(true);
  };

  const handleSubjectSubmit = async (selectedSubject: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            name: tempFileName,
            url: tempUrl,
            subject: selectedSubject,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDocuments((prev) => [data, ...prev]);
      setShowSubjectDialog(false);
      setTempUrl("");
      setTempFileName("");

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await supabase.storage
        .from("documents")
        .remove([documentToDelete.url.split("/").pop()!]);

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentToDelete.id);

      if (error) throw error;

      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentToDelete.id),
      );

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <FileUpload
              onUploadComplete={handleUploadComplete}
              bucketName="documents"
            />

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{doc.name.split(/-(.+)/)[1]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.subject}</TableCell>
                      <TableCell>
                        {format(new Date(doc.created_at), "PPP")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteClick(doc)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents uploaded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SubjectDialog
        open={showSubjectDialog}
        onOpenChange={setShowSubjectDialog}
        onSubmit={handleSubjectSubmit}
        fileName={tempFileName}
      />

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{documentToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
