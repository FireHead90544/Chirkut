import AddExpenseForm from "@/components/add-expense-form";

export default function AddExpensePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add New Expense</h1>
            <p className="text-muted-foreground">Log a new expense. It will be split equally among all flatmates.</p>
          </div>
          <AddExpenseForm />
        </div>
      </div>
    </div>
  );
}