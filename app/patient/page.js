import PatientForm from "@/components/PatientForm";

export const metadata = {
  title: "Patient Form | Real-Time Front Desk",
};

export default function PatientPage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <PatientForm />
    </main>
  );
}
