import AddSettlementForm from "@/components/add-settlement-form";

export default function AddSettlementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add a Settlement</h1>
            <p className="text-muted-foreground">Record a payment made between flatmates to clear debts.</p>
          </div>
          <AddSettlementForm />
        </div>
      </div>
    </div>
  );
}