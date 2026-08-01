import { demoEvidence } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function EvidencePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Register evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2"><Label>Case ID</Label><Input placeholder="101" /></div>
            <div className="grid gap-2"><Label>Evidence kind</Label><Input placeholder="pickup_photo / return_photo / repair_quote" /></div>
            <div className="grid gap-2"><Label>Public URL</Label><Input type="url" placeholder="https://…" /></div>
            <div className="grid gap-2"><Label>Evidence note</Label><Textarea placeholder="What should validators compare or notice?" /></div>
            <Button type="button">Simulate evidence write</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Evidence registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border border-vault-700/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-vault-200">
                <tr>
                  <th className="p-3">Case</th>
                  <th className="p-3">Kind</th>
                  <th className="p-3">Note</th>
                  <th className="p-3">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-700/20">
                {demoEvidence.map((entry) => (
                  <tr key={entry.id}>
                    <td className="p-3 font-mono">#{entry.caseId}</td>
                    <td className="p-3">{entry.kind}</td>
                    <td className="p-3 text-vault-950/75">{entry.note}</td>
                    <td className="max-w-60 truncate p-3 font-mono text-xs text-vault-700">{entry.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
