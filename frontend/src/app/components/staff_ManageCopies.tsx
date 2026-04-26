import { useState, useEffect } from "react";
import { Search, MapPin, Package } from "lucide-react";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { CopiesAPI } from "../../api/copies";
import { BooksAPI } from "../../api/books";

export default function ManageCopies() {
  const [copies, setCopies] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  // ⭐ Load real data
  useEffect(() => {
    async function loadData() {
      const [copyData, bookData] = await Promise.all([
        CopiesAPI.getAll(),
        BooksAPI.getAll(),
      ]);

      setCopies(copyData);
      setBooks(bookData);
    }

    loadData();
  }, []);

  // ⭐ Merge copies with book info
  const copiesWithBookInfo = copies.map((copy: any) => {
    const book = books.find((b: any) => b.id === copy.book_id);

    return {
      ...copy,
      bookTitle: book?.title || "Unknown",
      bookAuthor: book?.author || "Unknown",
    };
  });

  // ⭐ Filtering logic
  const filteredCopies = copiesWithBookInfo.filter((copy) => {
    const matchesSearch =
      copy.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      copy.barcode.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || copy.status === statusFilter;

    const matchesBranch =
      branchFilter === "all" || copy.branch === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // ⭐ Update status in DB
  const updateCopyStatus = async (copyId: string, newStatus: string) => {
    try {
      await CopiesAPI.update(copyId, { status: newStatus });
      const updated = await CopiesAPI.getAll();
      setCopies(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // ⭐ Update branch in DB
  const updateCopyBranch = async (copyId: string, newBranch: string) => {
    try {
      await CopiesAPI.update(copyId, { branch: newBranch });
      const updated = await CopiesAPI.getAll();
      setCopies(updated);
    } catch (err) {
      console.error("Failed to update branch:", err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Manage Copies</h1>
        <p className="text-neutral-600">
          Assign copies to branches and update item statuses
        </p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search" className="mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="search"
                type="text"
                placeholder="Search by title or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status" className="mb-2 block">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Checked Out">Checked Out</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Branch Filter */}
          <div>
            <Label htmlFor="branch" className="mb-2 block">
              Branch
            </Label>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger id="branch">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Main Branch">Main Branch</SelectItem>
                <SelectItem value="East Branch">East Branch</SelectItem>
                <SelectItem value="West Branch">West Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Barcode
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200">
              {filteredCopies.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No copies found matching your search criteria
                  </td>
                </tr>
              ) : (
                filteredCopies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium">
                      {copy.barcode}
                    </td>

                    <td className="px-6 py-4 text-sm">{copy.bookTitle}</td>

                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {copy.bookAuthor}
                    </td>

                    {/* Branch Select */}
                    <td className="px-6 py-4">
                      <Select
                        value={copy.branch}
                        onValueChange={(value) =>
                          updateCopyBranch(copy.id, value)
                        }
                      >
                        <SelectTrigger className="w-[150px] h-8 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Branch">Main Branch</SelectItem>
                          <SelectItem value="East Branch">East Branch</SelectItem>
                          <SelectItem value="West Branch">West Branch</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Status Select */}
                    <td className="px-6 py-4">
                      <Select
                        value={copy.status}
                        onValueChange={(value) =>
                          updateCopyStatus(copy.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-sm">
                          <Package className="w-3 h-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Checked Out">Checked Out</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="In Transit">In Transit</SelectItem>
                          <SelectItem value="Lost">Lost</SelectItem>
                          <SelectItem value="Damaged">Damaged</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Due Date */}
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {copy.due_date
                        ? new Date(copy.due_date).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (copy.status === "Lost" || copy.status === "Damaged") {
                            updateCopyStatus(copy.id, "Available");
                          } else if (copy.status !== "In Transit") {
                            updateCopyStatus(copy.id, "In Transit");
                          }
                        }}
                      >
                        {copy.status === "Lost" || copy.status === "Damaged"
                          ? "Restore"
                          : copy.status === "In Transit"
                          ? "Receive"
                          : "Transfer"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-neutral-600 mb-1">Total Copies</p>
          <p className="text-2xl font-semibold">{copies.length}</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-neutral-600 mb-1">Available</p>
          <p className="text-2xl font-semibold text-green-600">
            {copies.filter((c) => c.status === "Available").length}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-neutral-600 mb-1">In Transit</p>
          <p className="text-2xl font-semibold text-blue-600">
            {copies.filter((c) => c.status === "In Transit").length}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-neutral-600 mb-1">Lost/Damaged</p>
          <p className="text-2xl font-semibold text-red-600">
            {copies.filter(
              (c) => c.status === "Lost" || c.status === "Damaged"
            ).length}
          </p>
        </div>
      </div>
    </div>
  );
}
