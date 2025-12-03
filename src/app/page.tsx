import Link from 'next/link';
import { ArrowRight, Upload, Search, FileText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            RFPMatch <span className="text-primary-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your capability statements into winning government contracts. 
            Our AI analyzes your business profile and matches you with perfect RFP opportunities.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Upload className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Upload Document</h3>
            <p className="text-gray-600">Submit your capability statement (PDF/DOCx)</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Search className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
            <p className="text-gray-600">Our AI extracts your business profile & strengths</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <FileText className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Get Matched RFPs</h3>
            <p className="text-gray-600">Receive scored RFPs with fit analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
