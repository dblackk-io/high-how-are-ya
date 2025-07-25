'use client'

import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#ff00cc] hover:text-[#ff33cc] transition-colors mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-[#ff00cc] mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using High How Are Ya, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Anonymous Platform</h2>
            <p>
              This platform is designed for anonymous thought sharing. We do not collect personal information that could identify you.
              You are responsible for maintaining your anonymity and not sharing identifying information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Post content that is illegal, harmful, threatening, abusive, or defamatory</li>
              <li>Share personal information about yourself or others</li>
              <li>Post spam, commercial content, or automated messages</li>
              <li>Attempt to identify other users</li>
              <li>Use the platform to harass, bully, or harm others</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Content Moderation</h2>
            <p>
              We reserve the right to remove content that violates these terms. Users can report inappropriate content,
              and we will review reports to maintain a safe environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p>
              You retain ownership of your content. By posting, you grant us a license to display and distribute your content
              on the platform. You represent that you have the right to share the content you post.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers</h2>
            <p>
              The platform is provided "as is" without warranties. We are not responsible for the accuracy, completeness,
              or usefulness of any content posted by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting
              from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend access to the platform immediately, without prior notice, for any reason,
              including breach of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
            <p>
              If you have questions about these terms, please contact us through the platform's feedback system.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 