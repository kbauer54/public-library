import { useState, useEffect } from "react";
import { Search, Mail } from "lucide-react";

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

  useEffect(() => {
    PatronsAPI.getAll().then((res) => {
      const data = res.data ?? [];
      setPatrons(data);
    });
  }, []);

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

      setLoans(loanRes.data ?? []);
      setHolds(holdRes.data ?? []);
    } catch (err) {
      setLoans([]);
      setHolds([]);
    }
  };

  const filteredPatrons = patrons.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name ?? "").toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q)
    );
  });

  const patron = patrons.find(
    (p) => Number(p.id) === Number(selectedPatron)
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Patron Lookup</h1>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="col-span-1">
          <Label>Search Patrons</Label>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or email..."
            />
          </div>

          <div className="space-y-2">
            {filteredPatrons.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPatron(p.id)}
                className="p-3 border rounded cursor-pointer"
              >
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-2">
          {!patron ? (
            <p className="text-gray-500">Select a patron</p>
          ) : (
            <>
              <div className="border p-6 rounded mb-6">
                <h2 className="text-xl font-semibold">{patron.name}</h2>

                <div className="flex items-center gap-2 mt-2">
                  <Mail className="w-4 h-4" />
                  {patron.email}
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Member since: {patron.membership_date}
                </p>
              </div>

              {/* LOANS */}
              <div className="border p-6 rounded mb-6">
                <h3 className="font-semibold mb-3">Loans</h3>

                {loans.length === 0 ? (
                  <p>No loans</p>
                ) : (
                  loans.map((loan) => (
                    <div key={loan.id} className="border p-3 mb-2">
                      <p>{loan.bookTitle}</p>
                    </div>
                  ))
                )}
              </div>

              {/* HOLDS */}
              <div className="border p-6 rounded">
                <h3 className="font-semibold mb-3">Holds</h3>

                {holds.length === 0 ? (
                  <p>No holds</p>
                ) : (
                  holds.map((hold) => (
                    <div key={hold.id} className="border p-3 mb-2">
                      <p>{hold.bookTitle}</p>
                      <p className="text-sm text-gray-500">
                        {hold.status}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}