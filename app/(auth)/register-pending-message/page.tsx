import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Mail, Home } from "lucide-react";
import Link from "next/link";

export default function RegisterPendingMessage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-8">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Registration Submitted Successfully! 🎉
            </h1>
            <p className="text-gray-600">
              Thank you for registering with CatchTrack. Your application is
              currently under review and is being validated against the data submitted.
            </p>
          </div>

          {/* Status Timeline */}
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-4 text-left">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Registration Submitted
                </p>
                <p className="text-sm text-gray-500">
                  Your details have been received
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Cellphone Validation Successful
                </p>
                <p className="text-sm text-gray-500">
                  Your 2-factor authentication OTP was correct
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="bg-blue-100 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Under Review by Systems Administrator</p>
                <p className="text-sm text-gray-500">
                  Our team is reviewing your application
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  RightsHolder Confirmation Successful
                </p>
                <p className="text-sm text-gray-500">
                  The RightsHolder has confirmed your application
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-left">
              <div className="bg-blue-100 p-2 rounded-full">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Confirmation</p>
                <p className="text-sm text-gray-500">
                  You will receive an email. Click on the Validate Button to confirm email.
                </p>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-gray-50 p-6 rounded-lg text-left">
            <h2 className="font-medium text-gray-900 mb-2">
              What happens next?
            </h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                • Our system administrator will review your application within 1-2 business days
              </li>
              <li>
                • You will receive an email notification about your application
                status
              </li>
              <li>
                • Once approved, you can log in using your registered email and
                password
              </li>
              <li>
                • If additional information is needed, we will contact you via
                email
              </li>
            </ul>
          </div>

          {/* Home Button */}
          <div className="pt-4">
            <Link href="/">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-gray-500">
            Questions? Contact us at{" "}
            <a
              href="mailto:support@catchtrack.co.za"
              className="text-red-500 hover:text-red-600"
            >
              support@catchtrack.co.za
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
