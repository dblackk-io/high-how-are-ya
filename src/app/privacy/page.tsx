'use client'

import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-[#ff00cc] mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>
              <strong>Anonymous Session Data:</strong> We use anonymous session IDs to track your activity within the platform.
              These IDs are randomly generated and cannot be used to identify you personally.
            </p>
            <p className="mt-4">
              <strong>Content:</strong> We store the thoughts and comments you post, but these are not linked to your identity.
            </p>
            <p className="mt-4">
              <strong>Usage Data:</strong> We collect anonymous usage statistics to improve the platform, including which thoughts
              you interact with and how you use the features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Provide and maintain the platform</li>
              <li>Improve user experience and features</li>
              <li>Generate anonymous recommendations</li>
              <li>Moderate content and prevent abuse</li>
              <li>Analyze usage patterns to enhance the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Protection</h2>
            <p>
              We implement appropriate security measures to protect your data. However, no method of transmission over the internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your information to third parties. We may share anonymous,
              aggregated data for research or analytics purposes, but this data cannot be used to identify individuals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your session and improve platform functionality. We do not use tracking
              cookies or third-party analytics that could compromise your anonymity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p>
              Since we operate an anonymous platform, we cannot provide traditional data access or deletion requests
              as we cannot verify your identity. However, you can:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
              <li>Clear your browser data to reset your anonymous session</li>
              <li>Stop using the platform at any time</li>
              <li>Report concerns through our feedback system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
            <p>
              We retain anonymous session data and content for as long as necessary to provide the service and improve
              the platform. We may delete old content periodically to maintain performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p>
              This platform is not intended for children under 13. We do not knowingly collect information from children
              under 13. If you are a parent and believe your child has provided information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Users</h2>
            <p>
              If you are accessing the platform from outside the United States, please be aware that your information
              may be transferred to and processed in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of any material changes
              through the platform or by updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us through the platform's feedback system.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 