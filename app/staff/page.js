import StaffDashboard from "@/components/StaffDashboard";

export const metadata = {
  title: "Staff View | Real-Time Front Desk",
};

export default function StaffPage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <StaffDashboard />
    </main>
  );
}
