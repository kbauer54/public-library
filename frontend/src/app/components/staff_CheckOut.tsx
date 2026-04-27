import { useState, useEffect } from "react";
import { ScanLine, User, AlertCircle, CheckCircle } from "lucide-react";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

import { BooksAPI } from "../../api/books";
import { PatronsAPI } from "../../api/patrons";

interface CheckOutResult {
  success: boolean;
  message: string;
  itemTitle?: string;
  patronName?: string;
  dueDate?: string;
  alerts?: string[];
}

type Book = {
  id: number;
  title: string;
  isbn: string;
  branches: {
    name: string;
    available: number;
    total: number;
  }[];
};

type Patron = {
  id: number;
  name: string;
  status: string;
  fines: number;
  current_loans: number;
};

export default function StaffCheckOut() {
  const [books, setBooks] = useState<Book[]>([]);
  const [patrons, setPatrons] = useState<Patron[]>([]);

  const [barcode, setBarcode] = useState("");
  const [patronId, setPatronId] = useState("");
  const [result, setResult] = useState<CheckOutResult | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadData() {
    try {
      const [bookData, patronData] = await Promise.all([
        BooksAPI.getAll(),
        PatronsAPI.getAll(),
      ]);

      // Books: backend returns { data: { data: [...] } }
      const booksArray = Array.isArray(bookData?.data?.data)
        ? bookData.data.data
        : [];
      setBooks(booksArray);

      // Patrons: backend returns { data: [...] }
      const patronsArray = Array.isArray(patronData?.data)
        ? patronData.data
        : [];
      setPatrons(patronsArray);

    } catch (err) {
      console.error("Failed to load checkout data:", err);
      setBooks([]);
      setPatrons([]);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);


  const normalize = (v: any) =>
    String(v ?? "")
      .replace(/[^0-9Xx]/g, "")
      .toUpperCase()
      .trim();

  const handleCheckOut = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!books.length) {
        setResult({
          success: false,
          message: "Books are still loading. Please try again.",
        });
        return;
      }

      const normalizedInput = normalize(barcode);

      const book = books.find(
        (b) => normalize(b.isbn) === normalizedInput
      );

      if (!book) {
        setResult({
          success: false,
          message: "Item not found. Please check the ISBN and try again.",
        });
        return;
      }

      const totalAvailable = book.branches.reduce(
        (sum, br) => sum + br.available,
        0
      );

      if (totalAvailable <= 0) {
        setResult({
          success: false,
          message: "No available copies at any branch.",
        });
        return;
      }

      const patron = patrons.find(
        (p) => String(p.id).trim() === String(patronId).trim()
      );

      if (!patron) {
        setResult({
          success: false,
          message: "Patron not found. Please check the ID and try again.",
        });
        return;
      }

      const alerts: string[] = [];

      if (patron.status === "Suspended") {
        setResult({
          success: false,
          message:
            "This patron account is suspended. Resolve issues before checkout.",
        });
        return;
      }

      if (patron.fines > 10) {
        alerts.push(
          `Patron has $${patron.fines.toFixed(2)} in fines.`
        );
      }

      if (patron.current_loans >= 5) {
        alerts.push("Patron has reached the maximum loan limit.");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const dueDateStr = dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setPatrons((prev) =>
        prev.map((p) =>
          p.id === patron.id
            ? { ...p, current_loans: p.current_loans + 1 }
            : p
        )
      );

      setResult({
        success: true,
        message: "Item checked out successfully!",
        itemTitle: book.title,
        patronName: patron.name,
        dueDate: dueDateStr,
        alerts: alerts.length ? alerts : undefined,
      });

      setBarcode("");
      setPatronId("");
    } catch (err) {
      console.error(err);
      setResult({
        success: false,
        message: "Checkout failed. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-neutral-600">Loading checkout data…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Check Out</h1>
        <p className="text-neutral-600">
          Scan item barcode and patron card to complete checkout
        </p>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={handleCheckOut}
          className="bg-white rounded-lg border border-neutral-200 p-6 mb-6"
        >
          <div className="space-y-6">
            {/* Patron ID */}
            <div>
              <Label htmlFor="patronId" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Patron ID
              </Label>
              <Input
                id="patronId"
                type="text"
                placeholder="Enter or scan patron ID"
                value={patronId}
                onChange={(e) => setPatronId(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-sm text-neutral-500 mt-1">
                Example: 1, 2, 3
              </p>
            </div>

            {/* Barcode */}
            <div>
              <Label htmlFor="barcode" className="flex items-center gap-2 mb-2">
                <ScanLine className="w-4 h-4" />
                ISBN
              </Label>
              <Input
                id="barcode"
                type="text"
                placeholder="Enter or scan item barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-sm text-neutral-500 mt-1">
                Example: 107045821X, 9780143127796
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Complete Check Out
            </Button>
          </div>
        </form>

        {/* Result Display */}
        {result && (
          <div
            className={`rounded-lg border p-6 ${
              result.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    result.success ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.message}
                </h3>

                {result.success && (
                  <div className="space-y-2 text-sm text-green-900">
                    <p>
                      <strong>Item:</strong> {result.itemTitle}
                    </p>
                    <p>
                      <strong>Patron:</strong> {result.patronName}
                    </p>
                    <p>
                      <strong>Due Date:</strong> {result.dueDate}
                    </p>
                  </div>
                )}

                {result.alerts && result.alerts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <p className="font-medium text-yellow-900 mb-2">Alerts:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900">
                      {result.alerts.map((alert, index) => (
                        <li key={index}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
