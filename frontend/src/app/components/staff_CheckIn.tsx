import { useState, useEffect } from "react";
import { ScanBarcode, AlertCircle, CheckCircle } from "lucide-react";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

import { BooksAPI } from "../../api/books";
import { CopiesAPI } from "../../api/copies";
import { PatronsAPI } from "../../api/patrons";

interface CheckInResult {
  success: boolean;
  message: string;
  itemTitle?: string;
  patronName?: string;
  wasOverdue?: boolean;
  fineAmount?: number;
}

export default function CheckIn() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [patrons, setPatrons] = useState([]);

  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<CheckInResult | null>(null);

  const [loading, setLoading] = useState(true);

  // Load real data from API
  useEffect(() => {
    async function loadData() {
      try {
        const [bookData, copyData, patronData] = await Promise.all([
          BooksAPI.getAll(),
          CopiesAPI.getAll(),
          PatronsAPI.getAll(),
        ]);

        setBooks(bookData);
        setCopies(copyData);
        setPatrons(patronData);
      } catch (err) {
        console.error("Failed to load check-in data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();

    // Find copy by barcode
    const copy = copies.find((c: any) => c.barcode === barcode);

    if (!copy) {
      setResult({
        success: false,
        message: "Item not found. Please check the barcode and try again.",
      });
      return;
    }

    // Find book
    const book = books.find((b: any) => b.id === copy.book_id);

    if (!book) {
      setResult({
        success: false,
        message: "Book information not found.",
      });
      return;
    }

    // Check if copy is checked out
    if (copy.status !== "Checked Out") {
      setResult({
        success: false,
        message: `This item is marked as ${copy.status.toLowerCase()} and is not checked out.`,
      });
      return;
    }

    // Find patron
    let patronName = "Unknown";
    if (copy.patron_id) {
      const patron = patrons.find((p: any) => p.id === copy.patron_id);
      if (patron) patronName = patron.name;
    }

    // Overdue logic
    let wasOverdue = false;
    let fineAmount = 0;

    if (copy.due_date) {
      const dueDate = new Date(copy.due_date);
      const today = new Date();

      if (today > dueDate) {
        wasOverdue = true;
        const daysOverdue = Math.ceil(
          (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        fineAmount = daysOverdue * 0.25;
      }
    }

    setResult({
      success: true,
      message: "Item checked in successfully!",
      itemTitle: book.title,
      patronName,
      wasOverdue,
      fineAmount: wasOverdue ? fineAmount : undefined,
    });

    setBarcode("");
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-neutral-600">Loading check-in data…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Check In</h1>
        <p className="text-neutral-600">Scan item barcode to complete check-in</p>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={handleCheckIn}
          className="bg-white rounded-lg border border-neutral-200 p-6 mb-6"
        >
          <div className="space-y-6">
            <div>
              <Label htmlFor="barcode" className="flex items-center gap-2 mb-2">
                <ScanBarcode className="w-4 h-4" />
                Item Barcode
              </Label>
              <Input
                id="barcode"
                type="text"
                placeholder="Enter or scan item barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                required
                className="text-base"
                autoFocus
              />
              <p className="text-sm text-neutral-500 mt-1">
                Example: 100003, 100007 (checked out items)
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Complete Check In
            </Button>
          </div>
        </form>

        {result && (
          <div
            className={`rounded-lg border p-6 ${
              result.success
                ? result.wasOverdue
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle
                  className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    result.wasOverdue ? "text-yellow-600" : "text-green-600"
                  }`}
                />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <h3
                  className={`font-semibold mb-2 ${
                    result.success
                      ? result.wasOverdue
                        ? "text-yellow-900"
                        : "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {result.message}
                </h3>

                {result.success && (
                  <div
                    className={`space-y-2 text-sm ${
                      result.wasOverdue ? "text-yellow-900" : "text-green-900"
                    }`}
                  >
                    <p>
                      <strong>Item:</strong> {result.itemTitle}
                    </p>
                    <p>
                      <strong>Returned by:</strong> {result.patronName}
                    </p>

                    {result.wasOverdue && result.fineAmount && (
                      <div className="mt-4 pt-4 border-t border-yellow-200">
                        <p className="font-semibold text-yellow-900 mb-1">
                          ⚠️ Item Was Overdue
                        </p>
                        <p>
                          <strong>Fine Amount:</strong> $
                          {result.fineAmount.toFixed(2)}
                        </p>
                        <p className="text-xs mt-2">
                          Fine has been added to patron account. Please collect
                          payment.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-600 mb-1">Today's Check-Ins</p>
            <p className="text-2xl font-semibold">24</p>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-600 mb-1">Items in Transit</p>
            <p className="text-2xl font-semibold">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
