import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-green-500/20 p-6 rounded-full">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4">Thank You!</h1>

        <p className="text-xl text-muted-foreground mb-2">
          Your assessment has been successfully submitted.
        </p>

        <p className="text-lg text-muted-foreground mb-8">
          We appreciate your time and effort. Our team will review your submission and get back to you soon with the results.
        </p>



        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
