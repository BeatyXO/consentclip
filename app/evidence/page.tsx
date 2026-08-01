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
            <div className="grid gap-2"><Label>Case ID</Label><Input placeholder="1" /></div>
            <div className="grid gap-2"><Label>Evidence kind</Label><Input placeholder="pickup_photo / return_photo / repair_quote" /></div>
            <div className="grid gap-2"><Label>Public URL</Label><Input type="url" placeholder="https://…" /></div>
            <div className="grid gap-2"><Label>Evidence note</Label><Textarea placeholder="What should validators compare or notice?" /></div>
            <Button type="button">Submit evidence</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Evidence registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-vault-700/20 p-6">
            <p className="text-sm leading-6 text-vault-950/75">
              No local evidence rows are bundled. After live reads are wired, this table should render
              `get_evidence(case_id)` from the deployed Custodi contract.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
