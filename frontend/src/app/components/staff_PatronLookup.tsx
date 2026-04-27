import { useState, useEffect } from "react";
import {
  Search,
  Mail,
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

export default function PatronLookup() {
  const [patrons, setPatrons] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [holds, setHolds] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatron, setSelectedPatron] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // ----------------------------
  // Load patrons (FIXED)
  // ----------------------------
  useEffect(() => {
    PatronsAPI.getAll().then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setPatrons(data);
    });
  }, []);

  // ----------------------------
  // Load loans + holds when patron changes
  // ----------------------------
  useEffect(() => {
    if (selectedPatron !== null) {
      loadPatronData(selectedPatron);
    } else {
      setLoans([]);
      setHolds([]);
    }
  }, [selectedPatron]);

  const loadPatronData = async (patronId: number) => {
  try {
    const [loanRes, holdRes] = await Promise.all([
      LoansAPI.getByPatron(String(patronId)),
      HoldsAPI.getByPatron(String(patronId)),
    ]);

    console.log("📦 LOANS:", loanRes);
    console.log("📦 HOLDS:", holdRes);

    const loansData =
      loanRes?.data?.data ??
      loanRes?.data ??
      [];

    const holdsData =
      holdRes?.data?.data ??
      holdRes?.data ??
      [];

    setLoans(Array.isArray(loansData) ? loansData : []);
    setHolds(Array.isArray(holdsData) ? holdsData : []);
  } catch (err) {
    console.error("❌ Failed loading patron data:", err);
    setLoans([]);
    setHolds([]);
  }
};

  // ----------------------------
  // Filter patrons (SAFE)
  // ----------------------------
  const filteredPatrons = patrons.filter((patron) => {
    const q = searchQuery.toLowerCase();

    return (
      (patron.name ?? "").toLowerCase().includes(q) ||
      (patron.email ?? "").toLowerCase().includes(q) ||
      (patron.card_number ?? "").toLowerCase().includes(q)
    );
  });

  // ----------------------------
  // Selected patron (SAFE + consistent)
  // ----------------------------
  const patron = patrons.find(
    (p) => Number(p.id) === Number(selectedPatron)
  );

  // ----------------------------
  // Waive fines
  // ----------------------------
  const waiveFines = async (patronId: number) => {
    await PatronsAPI.update(String(patronId), { fines: 0 });

    const updated = await PatronsAPI.getOne(String(patronId));

    setPatrons((prev) =>
      prev.map((p) =>
        Number(p.id) === Number(patronId) ? updated.data : p
      )
    );
  };

  // ----------------------------
  // Renew loan
  // ----------------------------
  const renewItem = async (loanId: number) => {
    await LoansAPI.renew(String(loanId));

    if (selectedPatron !== null) {
      loadPatronData(selectedPatron);
    }
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
        {/* SEARCH */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <Label className="mb-2 block">Search Patrons</Label>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <Input
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, card number..."
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredPatrons.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatron(Number(p.id))}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedPatron === Number(p.id)
                      ? "bg-blue-50 border-blue-300"
                      : ""
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

        {/* DETAILS */}
        <div className="lg:col-span-2">
          {!patron ? (
            <div className="p-12 text-center border rounded-lg">
              <Search className="w-10 h-10 mx-auto text-neutral-300" />
              <p className="text-neutral-500 mt-2">
                Select a patron to view details
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* INFO */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{patron.name}</h2>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {patron.email ?? "No email"}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Patron ID: {patron.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Member since: {patron.membership_date ?? "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Branch ID: {patron.home_branch_id ?? "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* LOANS */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Loans</h3>

                {loans.length === 0 ? (
                  <p className="text-neutral-500">No loans</p>
                ) : (
                  loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex justify-between border p-3 rounded mb-2"
                    >
                      <div>
                        <p>{loan.bookTitle}</p>
                        <p className="text-sm text-neutral-500">
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => renewItem(loan.id)}
                      >
                        Renew
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* HOLDS */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-3">Holds</h3>

                {holds.length === 0 ? (
                  <p className="text-neutral-500">No holds</p>
                ) : (
                  holds.map((hold) => (
                    <div key={hold.id} className="border p-3 rounded">
                      {hold.bookTitle} — {hold.status}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patron</DialogTitle>
            <DialogDescription>
              Update patron details
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}