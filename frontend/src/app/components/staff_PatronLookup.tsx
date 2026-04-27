import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Phone,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import { PatronsAPI } from "../../api/patrons";
import { LoansAPI } from "../../api/loans";
import { HoldsAPI } from "../../api/holds";
import { BooksAPI } from "../../api/books";

export default function PatronLookup() {
  const [patrons, setPatrons] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatron, setSelectedPatron] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load all patron-related data
  useEffect(() => {
    if (selectedPatron) {
      loadPatronData(String(selectedPatron));
    }
  }, [selectedPatron]);

  // Load loans + holds for selected patron
  const loadPatronData = async (patronId: string) => {
    const [loanRes, holdRes] = await Promise.all([
      LoansAPI.getByPatron(patronId),
      HoldsAPI.getByPatron(patronId),
    ]);

    setLoans(loanRes.data);
    setHolds(holdRes.data);
  };

  // Filter patrons
  const filteredPatrons = patrons.filter((patron) => {
    const q = searchQuery.toLowerCase();

    return (
      (patron.name ?? "").toLowerCase().includes(q) ||
      (patron.email ?? "").toLowerCase().includes(q) ||
      (patron.card_number ?? "").toLowerCase().includes(q)
    );
  });

  //  Selected patron object
  const patron = selectedPatron
    ? patrons.find((p) => p.id === selectedPatron)
    : null;

  // Patron loans
  const patronLoans = loans;

  //  Patron holds
  const patronHolds = holds;

  // Waive fines
  const waiveFines = async (patronId: string) => {
    await PatronsAPI.update(patronId, { fines: 0 });
    const updated = await PatronsAPI.getOne(patronId);

    setPatrons((prev) =>
      prev.map((p) => (p.id === patronId ? updated.data : p))
    );
  };

  //  Renew item
  const renewItem = async (loanId: string) => {
    await LoansAPI.renew(loanId);
    loadPatronData(patron.id);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Patron Lookup</h1>
        <p className="text-neutral-600">
          Search for patrons and manage their accounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <Label htmlFor="patronSearch" className="mb-2 block">
              Search Patrons
            </Label>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="patronSearch"
                type="text"
                placeholder="Name, email, or card number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredPatrons.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatron(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    selectedPatron === p.id
                      ? "bg-blue-50 border-blue-300"
                      : "bg-white border-neutral-200"
                  }`}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-neutral-600">{p.email}</p>
                  <p className="text-xs text-neutral-500">
                    Card: {p.card_number}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patron Details */}
        <div className="lg:col-span-2">
          {!patron ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
              <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">Search for a patron to begin</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patron Info */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{patron.name}</h3>
                  <Button onClick={() => setIsEditDialogOpen(true)}>
                    Edit Info
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-500" />
                    <span>{patron.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-500" />
                    <span>{patron.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-neutral-500" />
                    <span>{patron.card_number}</span>
                  </div>

                  {patron.fines > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Fines: ${patron.fines.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => waiveFines(patron.id)}
                      >
                        Waive
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Loans */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Current Loans</h3>

                {patronLoans.length === 0 ? (
                  <p className="text-neutral-500">No active loans</p>
                ) : (
                  <div className="space-y-3">
                    {patronLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="p-4 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{loan.book?.title}</p>
                          <p className="text-sm text-neutral-600">
                            Due:{" "}
                            {new Date(loan.due_date).toLocaleDateString()}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => renewItem(loan.id)}
                          disabled={loan.renewals >= 2}
                        >
                          Renew
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Holds */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Holds</h3>

                {patronHolds.length === 0 ? (
                  <p className="text-neutral-500">No holds</p>
                ) : (
                  <div className="space-y-3">
                    {patronHolds.map((hold) => (
                      <div
                        key={hold.id}
                        className="p-4 border rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{hold.book?.title}</p>
                          <p className="text-sm text-neutral-600">
                            Status: {hold.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Patron Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patron Info</DialogTitle>
            <DialogDescription>
              Update patron contact details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input defaultValue={patron?.name} />
            </div>

            <div>
              <Label>Email</Label>
              <Input defaultValue={patron?.email} />
            </div>

            <div>
              <Label>Phone</Label>
              <Input defaultValue={patron?.phone} />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
