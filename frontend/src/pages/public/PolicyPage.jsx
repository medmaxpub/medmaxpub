import SectionHeader from "../../components/common/SectionHeader";

const policyContent = {
  terms: {
    label: "Terms",
    title: "Terms and Conditions",
    description: "Review the general terms that govern the use of the Medmax Publishers website and related journal resources.",
    body: [
      "By using this website, you agree to access Medmax Publishers content only for lawful academic, editorial, research, and informational purposes.",
      "All journal, PDF, PPT, and media materials remain subject to the publisher's editorial policies, copyright position, and applicable author agreements.",
      "Medmax Publishers may update website content, journal listings, submission workflows, and platform features without prior notice when operationally required."
    ]
  },
  withdraw: {
    label: "Withdraw",
    title: "Withdraw Policy",
    description: "Understand the standard withdrawal expectations for submissions, accepted manuscripts, and related publication materials.",
    body: [
      "Authors should request any submission withdrawal as early as possible through the official editorial communication channels.",
      "Withdrawal requests may be subject to review once editorial screening, peer review, acceptance, production, or publication steps have already begun.",
      "Medmax Publishers reserves the right to maintain a record of withdrawn submissions for editorial compliance, workflow history, and publishing integrity."
    ]
  },
  privacy: {
    label: "Privacy",
    title: "Privacy Policy",
    description: "Learn how Medmax Publishers handles contact information, submission data, and website interaction details.",
    body: [
      "Personal information shared through this website is used only for journal communication, editorial workflows, account administration, and related support services.",
      "We do not intentionally disclose private user or author information beyond operational, legal, editorial, or service-provider requirements tied to the platform.",
      "By continuing to use the website, you acknowledge that routine technical information may be processed to secure, maintain, and improve the Medmax platform."
    ]
  }
};

export default function PolicyPage({ policyKey = "terms" }) {
  const policy = policyContent[policyKey] || policyContent.terms;

  return (
    <div className="section-shell">
      <div className="container-shell">
        <SectionHeader label={policy.label} title={policy.title} description={policy.description} />

        <div className="mt-8 rounded-[2rem] border border-brand-border bg-white p-6 shadow-panel sm:p-8">
          <div className="space-y-5 text-base leading-8 text-brand-slate">
            {policy.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
