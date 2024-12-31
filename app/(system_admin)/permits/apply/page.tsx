import { Metadata } from "next";
import ApplyForm from "./_components/ApplyForm";

export const metadata: Metadata = {
  title: "Apply for Permit | CatchTrack",
  description: "Apply for a new fishing permit",
};

export default function ApplyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Apply for Permit</h1>
        <ApplyForm />
      </div>
    </div>
  );
}
