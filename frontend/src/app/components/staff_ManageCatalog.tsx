import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { BooksAPI } from "../../api/books";

export default function ManageCatalog() {
  const [books, setBooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    format: "Paperback",
    branch: "Main Branch",
  });

  useEffect(() => {
    async function loadBooks() {
      try {
        const response = await BooksAPI.getAll();
        setBooks(response?.data ?? response);
      } catch (err) {
        console.error("Failed to load books:", err);
      }
    }

    loadBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchQuery === "" ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat =
      formatFilter === "all" || book.format === formatFilter;

    return matchesSearch && matchesFormat;
  });

  const handleAddBook = async () => {
    try {
      await BooksAPI.create(newBook);
      const updated = await BooksAPI.getAll();
      setBooks(updated?.data ?? updated);
    } catch (err) {
      console.error("Failed to add book:", err);
    } finally {
      setIsAddDialogOpen(false);
      setNewBook({
        title: "",
        author: "",
        isbn: "",
        format: "Paperback",
        branch: "Main Branch",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Manage Catalog</h1>
          <p className="text-neutral-600">Review and add inventory for the library catalog.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2"> 
            <Search className="w-4 h-4 text-neutral-500" />
            <Input
              type="text"
              placeholder="Search books"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-[220px]"
            />
          </div>

          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="All formats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="Paperback">Paperback</SelectItem>
              <SelectItem value="Hardcover">Hardcover</SelectItem>
              <SelectItem value="eBook">eBook</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBooks.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-neutral-600">
            No matching books found.
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-6 md:grid-cols-[1fr_auto]"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">{book.title}</h2>
                <p className="text-neutral-600 mb-2">{book.author}</p>
                <p className="text-sm text-neutral-500 mb-2">ISBN: {book.isbn}</p>
                <p className="text-sm text-neutral-500">Format: {book.format}</p>
              </div>
              <div className="flex gap-2 items-center justify-end">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>
              Enter the details for the new catalog item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="format">Format</Label>
                <Input
                  id="format"
                  value={newBook.format}
                  onChange={(e) => setNewBook({ ...newBook, format: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={newBook.branch}
                  onChange={(e) => setNewBook({ ...newBook, branch: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBook}>Save Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

